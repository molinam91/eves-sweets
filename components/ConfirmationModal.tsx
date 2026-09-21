"use client";

import { useCart } from "@/context/CartContext";
import { computeDeliveryFriday, formatDeliveryDate } from "@/lib/delivery";
import Overlay from "./Overlay";

export default function ConfirmationModal({ customerName }: { customerName: string }) {
  const { closeModal } = useCart();
  const friday = formatDeliveryDate(computeDeliveryFriday());

  return (
    <Overlay onClose={closeModal}>
      <div className="text-center">
        <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-2xl text-white">
          ♥
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Gracias, {customerName || "amig@"}!
        </h3>
        <p className="mt-2 text-sm text-foreground-soft">
          Abrimos WhatsApp con tu pedido listo para enviar. En cuanto lo confirmes, te
          contactaremos para coordinar el pago.
        </p>
        <p className="mt-2 text-sm text-foreground-soft">
          <b className="text-foreground">Entrega estimada:</b> {friday}
        </p>
        <button
          type="button"
          onClick={closeModal}
          className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          Seguir explorando el menu
        </button>
      </div>
    </Overlay>
  );
}
