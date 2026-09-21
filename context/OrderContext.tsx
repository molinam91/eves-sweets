"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-orders-v1";

type OrderContextValue = {
  /** Active orders (not yet marked completed), newest first. */
  orders: Order[];
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

  const addOrder = useCallback((input: Omit<Order, "id" | "createdAt" | "status">): Order => {
    let created!: Order;
    setAllOrders((prev) => {
      const id = String(prev.length + 1).padStart(4, "0");
      created = { ...input, id, createdAt: new Date().toISOString(), status: "new" };
      return [created, ...prev];
    });
    return created;
  }, []);

  const completeOrder = useCallback((id: string) => {
    setAllOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "completed" } : o)));
  }, []);

  const orders = useMemo(() => allOrders.filter((o) => o.status === "new"), [allOrders]);
  const findOrder = useCallback((id: string) => allOrders.find((o) => o.id === id), [allOrders]);

  const value: OrderContextValue = { orders, findOrder, addOrder, completeOrder };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
