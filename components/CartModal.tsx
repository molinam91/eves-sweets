"use client";

import { useCart } from "@/context/CartContext";
import { money } from "@/lib/delivery";
import Overlay from "./Overlay";

export default function CartModal() {
  const { cart, removeLine, lineTotal, cartTotal, closeModal, openCheckout } = useCart();

  return (
    <Overlay onClose={closeModal}>
      <h3 className="text-lg font-semibold text-foreground">Tu carrito</h3>

      {cart.length === 0 ? (
        <p className="py-8 text-center text-sm text-foreground-soft">
          Tu carrito esta vacio. Elige algo delicioso 🧁
        </p>
      ) : (
        <div className="mt-2">
          {cart.map((line) => (
            <div key={line.cartId} className="flex gap-3 border-t border-border py-3 first:border-t-0">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${line.gradient[0]}, ${line.gradient[1]})` }}
              >
                🧁
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {line.qty}x {line.name}
                </div>
                <div className="truncate text-xs text-foreground-soft">
                  {[
                    line.addons.map((a) => a.name).join(", "),
                    line.isCatering && line.eventDate ? `Evento: ${line.eventDate}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(line.cartId)}
                  className="mt-0.5 text-xs text-foreground-soft underline"
                >
                  Quitar
                </button>
              </div>
              <div className="whitespace-nowrap text-sm font-semibold tabular-nums text-brand-pink-deep">
                {money(lineTotal(line))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-border pt-3.5">
        <span className="text-sm">Total</span>
        <span className="font-script text-2xl tabular-nums text-brand-pink-deep">
          {money(cartTotal)}
        </span>
      </div>

      <button
        type="button"
        disabled={cart.length === 0}
        onClick={openCheckout}
        className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-50"
      >
        Continuar al pedido
      </button>
      <button
        type="button"
        onClick={closeModal}
        className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
      >
        Seguir viendo el menu
      </button>
    </Overlay>
  );
}
