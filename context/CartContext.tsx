"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Addon, CartLine, Product } from "@/lib/types";

type ModalState =
  | { kind: "none" }
  | { kind: "item"; product: Product }
  | { kind: "cart" }
  | { kind: "checkout" }
  | { kind: "confirmation"; customerName: string };

type CartContextValue = {
  cart: CartLine[];
  modal: ModalState;
  openItem: (product: Product) => void;
  openCart: () => void;
  openCheckout: () => void;
  openConfirmation: (customerName: string) => void;
  closeModal: () => void;
  addLine: (line: Omit<CartLine, "cartId">) => void;
  removeLine: (cartId: string) => void;
  clearCart: () => void;
  lineTotal: (line: CartLine) => number;
  cartTotal: number;
  cartCount: number;
  hasCatering: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineTotal(line: CartLine): number {
  const addonsTotal = line.addons.reduce((sum: number, a: Addon) => sum + a.price, 0);
  return (line.unitPrice + addonsTotal) * line.qty;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const openItem = useCallback((product: Product) => setModal({ kind: "item", product }), []);
  const openCart = useCallback(() => setModal({ kind: "cart" }), []);
  const openCheckout = useCallback(() => setModal({ kind: "checkout" }), []);
  const openConfirmation = useCallback(
    (customerName: string) => setModal({ kind: "confirmation", customerName }),
    []
  );
  const closeModal = useCallback(() => setModal({ kind: "none" }), []);

  const addLine = useCallback((line: Omit<CartLine, "cartId">) => {
    setCart((prev) => [
      ...prev,
      { ...line, cartId: Date.now() + "-" + Math.random().toString(36).slice(2, 7) },
    ]);
  }, []);

  const removeLine = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((l) => l.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((sum, l) => sum + lineTotal(l), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, l) => sum + l.qty, 0), [cart]);
  const hasCatering = useMemo(() => cart.some((l) => l.isCatering), [cart]);

  const value: CartContextValue = {
    cart,
    modal,
    openItem,
    openCart,
    openCheckout,
    openConfirmation,
    closeModal,
    addLine,
    removeLine,
    clearCart,
    lineTotal,
    cartTotal,
    cartCount,
    hasCatering,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
