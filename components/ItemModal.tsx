"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { money } from "@/lib/delivery";
import type { Addon, Product } from "@/lib/types";
import Overlay from "./Overlay";
import ProductThumb from "./ProductThumb";

export default function ItemModal({ product }: { product: Product }) {
  const { addLine, closeModal, openCart } = useCart();
  const { t, translateProduct } = useLocale();
  const { rules } = useStoreConfig();
  const isBulkPriced = product.price < rules.bulkMaxPrice;

  // Mix and match: the bulk minimum is checked against the combined quantity of
  // every under-$10 item in the cart (see CartContext), not this one item alone,
  // so there's no per-item floor here -- just the normal floor of 1.
  const [qty, setQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Addon>>({});
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");

  const { name, description } = translateProduct(product);
  const addonsTotal = Object.values(selectedAddons).reduce((sum, a) => sum + a.price, 0);
  const subtotal = (product.price + addonsTotal) * qty;

  function toggleAddon(addon: Addon, checked: boolean) {
    setSelectedAddons((prev) => {
      const next = { ...prev };
      if (checked) next[addon.id] = addon;
      else delete next[addon.id];
      return next;
    });
  }

  function handleAdd() {
    addLine({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      qty,
      addons: Object.values(selectedAddons),
      notes: notes.trim(),
      isCatering: product.isCatering,
      eventDate,
      gradient: product.gradient,
      photo: product.photo,
    });
    closeModal();
    openCart();
  }

  return (
    <Overlay onClose={closeModal}>
      <ProductThumb product={product} className="mb-3.5 h-28 rounded-2xl" />
      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <p className="mt-1 text-sm text-foreground-soft">{description}</p>

      <div className="mt-3 flex items-center justify-between border-t border-border py-3">
        <span className="text-sm">{t.quantity}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-brand-pink-deep"
          >
            −
          </button>
          <span className="min-w-[18px] text-center font-semibold tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-brand-pink-deep"
          >
            +
          </button>
        </div>
      </div>

      {isBulkPriced && (
        <p className="text-xs text-brand-gold-dark">
          {t.bulk_min_note(rules.bulkMinQty, rules.bulkFreeDeliveryQty)}
        </p>
      )}

      {product.addons.map((addon) => (
        <label
          key={addon.id}
          className="flex items-center gap-2.5 border-t border-border py-2.5 text-sm"
        >
          <input
            type="checkbox"
            checked={Boolean(selectedAddons[addon.id])}
            onChange={(e) => toggleAddon(addon, e.target.checked)}
            className="h-4 w-4 accent-brand-pink"
          />
          <span>{addon.name}</span>
          <span className="ml-auto text-xs tabular-nums text-foreground-soft">
            +{money(addon.price)}
          </span>
        </label>
      ))}

      {product.isCatering && (
        <div>
          <label htmlFor="event-date" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
            {t.event_date}
          </label>
          <input
            id="event-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
        </div>
      )}

      <label htmlFor="item-notes" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
        {t.notes_optional}
      </label>
      <textarea
        id="item-notes"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t.notes_placeholder}
        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
      />

      <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-border pt-3.5">
        <span className="text-sm">{t.subtotal}</span>
        <span className="font-script text-2xl tabular-nums text-brand-pink-deep">
          {money(subtotal)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
      >
        {t.add_to_cart}
      </button>
      <button
        type="button"
        onClick={closeModal}
        className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
      >
        {t.cancel}
      </button>
    </Overlay>
  );
}
