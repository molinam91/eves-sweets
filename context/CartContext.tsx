"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Addon, CartLine, FulfillmentMethod, PromoCode, Product } from "@/lib/types";
import { useStoreConfig } from "./StoreConfigContext";

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
  /** Clamped to the line's bulk minimum (if it's a bulk-priced item) or 1. */
  updateLineQty: (cartId: string, qty: number) => void;
  clearCart: () => void;
  lineTotal: (line: CartLine) => number;
  /** Raw sum of line totals, before delivery fee or a promo discount. */
  cartTotal: number;
  cartCount: number;
  hasCatering: boolean;

  fulfillment: FulfillmentMethod;
  setFulfillment: (method: FulfillmentMethod) => void;

  appliedPromo: PromoCode | null;
  promoError: string;
  applyPromoCode: (code: string) => void;
  clearPromoCode: () => void;

  /** Combined quantity of every under-$10 (bulk-priced) line in the cart. */
  bulkQtyInCart: number;
  /** True when there are no bulk-priced lines, or their combined quantity meets the minimum. */
  bulkMinMet: boolean;
  /** How many more (combined, mix and match) under-$10 items are needed to meet the minimum. */
  bulkMinRemaining: number;
  /** Waived when the combined quantity of under-$10 items meets the free-delivery threshold. */
  deliveryFeeWaived: boolean;
  deliveryFeeAmount: number;
  discountAmount: number;
  /** cartTotal - discountAmount + deliveryFeeAmount */
  orderTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineTotal(line: CartLine): number {
  const addonsTotal = line.addons.reduce((sum: number, a: Addon) => sum + a.price, 0);
  return (line.unitPrice + addonsTotal) * line.qty;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { rules, findPromoCode } = useStoreConfig();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("delivery");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");

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

  // Mix and match: a single line has no minimum of its own anymore (the combined
  // total across under-$10 lines is what has to clear rules.bulkMinQty, checked at
  // checkout) -- so here a line just can't go below 1, and dropping to 0 removes it.
  const updateLineQty = useCallback((cartId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.cartId !== cartId));
      return;
    }
    setCart((prev) => prev.map((l) => (l.cartId === cartId ? { ...l, qty } : l)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedPromo(null);
    setPromoError("");
    setFulfillment("delivery");
  }, []);

  const applyPromoCode = useCallback(
    (code: string) => {
      const promo = findPromoCode(code);
      if (!promo) {
        setAppliedPromo(null);
        setPromoError("Codigo no valido.");
        return;
      }
      setAppliedPromo(promo);
      setPromoError("");
    },
    [findPromoCode]
  );

  const clearPromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoError("");
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, l) => sum + lineTotal(l), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, l) => sum + l.qty, 0), [cart]);
  const hasCatering = useMemo(() => cart.some((l) => l.isCatering), [cart]);

  // Mix and match: the under-$10 minimum and the free-delivery threshold are both
  // counted across the COMBINED quantity of every under-$10 line, not per item --
  // 2 of one and 3 of another satisfies a minimum of 5 just like 5 of one does.
  const bulkQtyInCart = useMemo(
    () =>
      cart.reduce((sum, l) => (l.unitPrice < rules.bulkMaxPrice ? sum + l.qty : sum), 0),
    [cart, rules.bulkMaxPrice]
  );
  // No under-$10 items at all means the minimum doesn't apply; having some means
  // their combined quantity must clear it.
  const bulkMinMet = bulkQtyInCart === 0 || bulkQtyInCart >= rules.bulkMinQty;
  const bulkMinRemaining = Math.max(0, rules.bulkMinQty - bulkQtyInCart);

  const deliveryFeeWaived = useMemo(
    () => bulkQtyInCart >= rules.bulkFreeDeliveryQty,
    [bulkQtyInCart, rules.bulkFreeDeliveryQty]
  );

  const deliveryFeeAmount = useMemo(() => {
    if (fulfillment !== "delivery" || hasCatering) return 0;
    return deliveryFeeWaived ? 0 : rules.deliveryFee;
  }, [fulfillment, hasCatering, deliveryFeeWaived, rules.deliveryFee]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    const raw =
      appliedPromo.type === "percent" ? (cartTotal * appliedPromo.value) / 100 : appliedPromo.value;
    return Math.min(raw, cartTotal);
  }, [appliedPromo, cartTotal]);

  const orderTotal = useMemo(
    () => cartTotal - discountAmount + deliveryFeeAmount,
    [cartTotal, discountAmount, deliveryFeeAmount]
  );

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
    updateLineQty,
    clearCart,
    lineTotal,
    cartTotal,
    cartCount,
    hasCatering,
    fulfillment,
    setFulfillment,
    appliedPromo,
    promoError,
    applyPromoCode,
    clearPromoCode,
    bulkQtyInCart,
    bulkMinMet,
    bulkMinRemaining,
    deliveryFeeWaived,
    deliveryFeeAmount,
    discountAmount,
    orderTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
