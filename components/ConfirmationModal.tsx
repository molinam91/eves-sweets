"use client";

import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { computeDeliveryFriday, formatDeliveryDate } from "@/lib/delivery";
import Overlay from "./Overlay";

export default function ConfirmationModal({ customerName }: { customerName: string }) {
  const { closeModal } = useCart();
  const { locale, t } = useLocale();
  const friday = formatDeliveryDate(computeDeliveryFriday(), locale);

  return (
    <Overlay onClose={closeModal}>
      <div className="text-center">
        <div className="mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-2xl text-white">
          ♥
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {t.thanks_title(customerName || (locale === "en" ? "friend" : "amig@"))}
        </h3>
        <p className="mt-2 text-sm text-foreground-soft">{t.thanks_body}</p>
        <p className="mt-2 text-sm text-foreground-soft">
          <b className="text-foreground">{t.estimated_delivery}</b> {friday}
        </p>
        <button
          type="button"
          onClick={closeModal}
          className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          {t.keep_exploring}
        </button>
      </div>
    </Overlay>
  );
}
