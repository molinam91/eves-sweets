"use client";

import { useCart } from "@/context/CartContext";
import ItemModal from "./ItemModal";
import CartModal from "./CartModal";
import CheckoutModal from "./CheckoutModal";
import ConfirmationModal from "./ConfirmationModal";

export default function ModalRoot() {
  const { modal } = useCart();

  switch (modal.kind) {
    case "item":
      return <ItemModal product={modal.product} />;
    case "cart":
      return <CartModal />;
    case "checkout":
      return <CheckoutModal />;
    case "confirmation":
      return <ConfirmationModal customerName={modal.customerName} />;
    default:
      return null;
  }
}
