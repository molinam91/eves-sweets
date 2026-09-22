"use client";

import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useMenu } from "@/context/MenuContext";
import { money } from "@/lib/delivery";
import Overlay from "./Overlay";
import ProductThumb from "./ProductThumb";

export default function CartModal() {
  const { cart, removeLine, updateLineQty, lineTotal, cartTotal, closeModal, openCheckout } = useCart();
  const { t, translateProduct } = useLocale();
  const { findProduct } = useMenu();

  return (
    <Overlay onClose={closeModal}>
      <h3 className="text-lg font-semibold text-foreground">{t.your_cart}</h3>

      {cart.length === 0 ? (
        <p className="py-8 text-center text-sm text-foreground-soft">{t.cart_empty}</p>
      ) : (
        <div className="mt-2">
          {cart.map((line) => {
            const product = findProduct(line.productId);
            const displayName = product ? translateProduct(product).name : line.name;
            return (
              <div key={line.cartId} className="flex gap-3 border-t border-border py-3 first:border-t-0">
                <ProductThumb product={line} className="h-11 w-11 flex-shrink-0 rounded-xl" sizes="44px" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{displayName}</div>
                  <div className="truncate text-xs text-foreground-soft">
                    {[
                      line.addons.map((a) => a.name).join(", "),
                      line.isCatering && line.eventDate ? `${t.event_date}: ${line.eventDate}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateLineQty(line.cartId, line.qty - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-2 text-xs text-brand-pink-deep"
                    >
                      −
                    </button>
                    <span className="min-w-[14px] text-center text-xs font-semibold tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateLineQty(line.cartId, line.qty + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-2 text-xs text-brand-pink-deep"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.cartId)}
                    className="mt-0.5 text-xs text-foreground-soft underline"
                  >
                    {t.remove}
                  </button>
                </div>
                <div className="whitespace-nowrap text-sm font-semibold tabular-nums text-brand-pink-deep">
                  {money(lineTotal(line))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-border pt-3.5">
        <span className="text-sm">{t.total}</span>
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
        {t.continue_to_order}
      </button>
      <button
        type="button"
        onClick={closeModal}
        className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
      >
        {t.keep_browsing}
      </button>
    </Overlay>
  );
}
