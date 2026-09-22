"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addOrderToBackend,
  clearOrdersInBackend,
  completeOrderInBackend,
  deleteOrderInBackend,
  fetchBackendSnapshot,
} from "@/lib/backend";
import type { Order } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-orders-v1";
const POLL_INTERVAL_MS = 20000;

type OrderContextValue = {
  /** Active orders (not yet marked completed), newest first. */
  orders: Order[];
  /** Every order regardless of status -- for sales totals. */
  allOrders: Order[];
  findOrder: (id: string) => Order | undefined;
  /** Resolves once the shared Sheet confirms the write (or fails) -- await this before
   *  navigating away (e.g. to WhatsApp), since leaving the page can cancel an
   *  in-flight save. `saved` is false when the backend never confirmed it. */
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Promise<{ order: Order; saved: boolean }>;
  completeOrder: (id: string) => void;
  /** Deletes one order (e.g. a test order), leaving every other order untouched. */
  deleteOrder: (id: string) => void;
  /** Deletes every recorded order (sales/best-sellers reset). Resolves true once the shared Sheet confirms it's empty. */
  clearOrders: () => Promise<boolean>;
};

const OrderContext = createContext<OrderContextValue | null>(null);

/**
 * Same reasoning as MenuContext's sanitizer: heal any stale bad order saved before this
 * fix existed. A blank id is never a real order -- it's the fingerprint of the id-type
 * bug (Sheets turning "0003" into the number 3, which the old sanitizer then read as "")
 * that made every backend order collapse onto the same key and get merged in as a
 * duplicate. Dropping those here, plus keeping only the first of any repeated id, self-heals
 * a browser's already-polluted cache the next time it loads, no manual cache-clearing needed.
 */
function sanitizeStoredOrders(parsed: unknown): Order[] {
  if (!Array.isArray(parsed)) return [];
  const num = (v: unknown, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const seenIds = new Set<string>();
  return parsed
    .filter((raw) => {
      const id = (raw as Record<string, unknown> | null)?.id;
      if (typeof id !== "string" || !id || seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    })
    .map((raw) => {
      const o = (raw ?? {}) as Partial<Order> & Record<string, unknown>;
      return {
        ...(o as Order),
        createdAt: Number.isNaN(new Date(String(o.createdAt)).getTime())
          ? new Date().toISOString()
          : String(o.createdAt),
        subtotal: num(o.subtotal),
        discount: num(o.discount),
        deliveryFee: num(o.deliveryFee),
        total: num(o.total),
        items: Array.isArray(o.items)
          ? o.items.map((raw2) => {
              const line = (raw2 ?? {}) as Record<string, unknown>;
              return {
                ...line,
                qty: num(line.qty, 1),
                unitPrice: num(line.unitPrice),
                lineTotal: num(line.lineTotal),
                addons: Array.isArray(line.addons)
                  ? line.addons.map((a) => {
                      const addon = (a ?? {}) as Record<string, unknown>;
                      return { ...addon, price: num(addon.price) };
                    })
                  : [],
              };
            })
          : [],
      } as Order;
    });
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // One-time hydration sync from localStorage (SSR has no access to it), not a loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setAllOrders(sanitizeStoredOrders(JSON.parse(raw)));
    } catch {
      // ignore -- private mode / blocked storage, starts empty
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
    } catch {
      // ignore -- per-viewer convenience only
    }
  }, [allOrders]);

  // Shared backend (Google Sheet): once connected, orders placed on any device
  // reach admin on every device. Polls since the sheet has no push updates.
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const snapshot = await fetchBackendSnapshot();
      if (cancelled || !snapshot) return;
      setAllOrders((prev) => {
        const backendIds = new Set(snapshot.orders.map((o) => o.id));
        const localOnly = prev.filter((o) => !backendIds.has(o.id));
        return [...snapshot.orders, ...localOnly].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      });
    }
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const addOrder = useCallback(async (input: Omit<Order, "id" | "createdAt" | "status">) => {
    let created!: Order;
    setAllOrders((prev) => {
      const id = String(prev.length + 1).padStart(4, "0");
      created = { ...input, id, createdAt: new Date().toISOString(), status: "new" };
      return [created, ...prev];
    });
    const localId = created.id;
    // A single attempt only -- add_order always appends a new row with no idempotency
    // check, so retrying it is unsafe: if the first POST actually landed but its
    // response was lost (the same kind of flaky mobile connection that caused orders to
    // never save in the first place), a retry creates a second, fully real duplicate
    // order rather than recovering a failed one. A genuinely failed save still surfaces
    // as a visible error at checkout (see CheckoutModal), and the customer can just tap
    // send again -- safer than the alternative.
    const res = await addOrderToBackend(created);
    const backendId = res?.ok && typeof res.id === "string" ? res.id : null;
    if (backendId && backendId !== localId) {
      created = { ...created, id: backendId };
      setAllOrders((prev) => prev.map((o) => (o.id === localId ? { ...o, id: backendId } : o)));
    }
    return { order: created, saved: Boolean(res?.ok) };
  }, []);

  const completeOrder = useCallback((id: string) => {
    setAllOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "completed" } : o)));
    completeOrderInBackend(id);
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setAllOrders((prev) => prev.filter((o) => o.id !== id));
    deleteOrderInBackend(id);
  }, []);

  const clearOrders = useCallback(async (): Promise<boolean> => {
    setAllOrders([]);
    const result = await clearOrdersInBackend();
    return Boolean(result?.ok);
  }, []);

  const orders = useMemo(() => allOrders.filter((o) => o.status === "new"), [allOrders]);
  const findOrder = useCallback((id: string) => allOrders.find((o) => o.id === id), [allOrders]);

  const value: OrderContextValue = {
    orders,
    allOrders,
    findOrder,
    addOrder,
    completeOrder,
    deleteOrder,
    clearOrders,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
