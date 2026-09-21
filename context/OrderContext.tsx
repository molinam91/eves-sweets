"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addOrderToBackend, completeOrderInBackend, fetchBackendSnapshot } from "@/lib/backend";
import type { Order } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-orders-v1";
const POLL_INTERVAL_MS = 20000;

type OrderContextValue = {
  /** Active orders (not yet marked completed), newest first. */
  orders: Order[];
  /** Every order regardless of status -- for sales totals. */
  allOrders: Order[];
  findOrder: (id: string) => Order | undefined;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Order;
  completeOrder: (id: string) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // One-time hydration sync from localStorage (SSR has no access to it), not a loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setAllOrders(JSON.parse(raw));
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

  const addOrder = useCallback((input: Omit<Order, "id" | "createdAt" | "status">): Order => {
    let created!: Order;
    setAllOrders((prev) => {
      const id = String(prev.length + 1).padStart(4, "0");
      created = { ...input, id, createdAt: new Date().toISOString(), status: "new" };
      return [created, ...prev];
    });
    addOrderToBackend(created).then((res) => {
      const backendId = res?.ok && typeof res.id === "string" ? res.id : null;
      if (backendId && backendId !== created.id) {
        setAllOrders((prev) => prev.map((o) => (o.id === created.id ? { ...o, id: backendId } : o)));
      }
    });
    return created;
  }, []);

  const completeOrder = useCallback((id: string) => {
    setAllOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "completed" } : o)));
    completeOrderInBackend(id);
  }, []);

  const orders = useMemo(() => allOrders.filter((o) => o.status === "new"), [allOrders]);
  const findOrder = useCallback((id: string) => allOrders.find((o) => o.id === id), [allOrders]);

  const value: OrderContextValue = { orders, allOrders, findOrder, addOrder, completeOrder };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
