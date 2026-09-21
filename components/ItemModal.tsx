"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { money } from "@/lib/delivery";
import type { Addon, Product } from "@/lib/types";
import Overlay from "./Overlay";
import ProductThumb from "./ProductThumb";

export default function ItemModal({ product }: { product: Product }) {
  const { addLine, closeModal, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Addon>>({});
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");

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
      <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
      <p className="mt-1 text-sm text-foreground-soft">{product.description}</p>

      <div className="mt-3 flex items-center justify-between border-t border-border py-3">
        <span className="text-sm">Cantidad</span>
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
            Fecha del evento
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
        Notas (opcional)
      </label>
      <textarea
        id="item-notes"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ej. sin nueces, mensaje en el pastel..."
        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
      />

      <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-border pt-3.5">
        <span className="text-sm">Subtotal</span>
        <span className="font-script text-2xl tabular-nums text-brand-pink-deep">
          {money(subtotal)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
      >
        Agregar al carrito
      </button>
      <button
        type="button"
        onClick={closeModal}
        className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
      >
        Cancelar
      </button>
    </Overlay>
  );
}
