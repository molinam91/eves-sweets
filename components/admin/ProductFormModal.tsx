"use client";

import { useState } from "react";
import Overlay from "@/components/Overlay";
import { GRADIENT_PRESETS } from "@/lib/mockData";
import { useMenu, type ProductInput } from "@/context/MenuContext";
import { uniqueSlug } from "@/lib/slug";
import type { Addon, Product } from "@/lib/types";

function gradientIndex(gradient: [string, string]): number {
  const idx = GRADIENT_PRESETS.findIndex((g) => g[0] === gradient[0] && g[1] === gradient[1]);
  return idx === -1 ? 0 : idx;
}

export default function ProductFormModal({
  category,
  product,
  onClose,
}: {
  category: "menu" | "catering";
  product?: Product;
  onClose: () => void;
}) {
  const { addProduct, updateProduct } = useMenu();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [colorIdx, setColorIdx] = useState(product ? gradientIndex(product.gradient) : 0);
  const [addons, setAddons] = useState<Addon[]>(product?.addons ?? []);
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("");
  const [error, setError] = useState("");

  function handleAddAddon() {
    const trimmedName = addonName.trim();
    const parsedPrice = Number(addonPrice);
    if (!trimmedName || !Number.isFinite(parsedPrice) || parsedPrice < 0) return;
    const id = uniqueSlug(trimmedName, addons.map((a) => a.id));
    setAddons((prev) => [...prev, { id, name: trimmedName, price: parsedPrice }]);
    setAddonName("");
    setAddonPrice("");
  }

  function handleRemoveAddon(id: string) {
    setAddons((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = Number(price);

    if (!trimmedName) {
      setError("Ponle un nombre al articulo.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("El precio debe ser un numero valido.");
      return;
    }

    const input: ProductInput = {
      name: trimmedName,
      description: description.trim(),
      price: parsedPrice,
      gradient: GRADIENT_PRESETS[colorIdx],
      isCatering: category === "catering",
      addons,
    };

    if (isEdit && product) {
      updateProduct(product.id, input);
    } else {
      addProduct(input);
    }
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-foreground">
        {isEdit ? "Editar articulo" : "Agregar articulo"}
      </h3>
      <p className="mt-1 text-xs text-foreground-soft">
        {category === "catering" ? "Catering & Eventos" : "Menu"}
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="pf-name" className="mb-1 mt-3.5 block text-xs font-medium text-foreground-soft">
          Nombre
        </label>
        <input
          id="pf-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Chocoflan"
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />

        <label htmlFor="pf-desc" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          Descripcion
        </label>
        <textarea
          id="pf-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. La perfecta combinacion de pastel de chocolate y flan."
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />

        <label htmlFor="pf-price" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          Precio (USD)
        </label>
        <input
          id="pf-price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />

        <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          Color (mientras no hay foto)
        </span>
        <div className="flex flex-wrap gap-2">
          {GRADIENT_PRESETS.map((g, idx) => (
            <button
              key={g.join("-")}
              type="button"
              onClick={() => setColorIdx(idx)}
              aria-label={`Color ${idx + 1}`}
              className="h-9 w-9 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
                outline: colorIdx === idx ? "2px solid var(--brand-pink-deep)" : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>

        {product?.photo && (
          <p className="mt-3 text-[11px] text-foreground-soft">
            Este articulo ya tiene una foto real; se conserva aunque cambies el color.
          </p>
        )}

        <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          Toppings / extras (opcional)
        </span>
        {addons.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <span>{addon.name}</span>
                <div className="flex items-center gap-2.5">
                  <span className="tabular-nums text-foreground-soft">+${addon.price.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(addon.id)}
                    className="text-xs underline text-brand-danger"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={addonName}
            onChange={(e) => setAddonName(e.target.value)}
            placeholder="Ej. Chispas de chocolate"
            className="w-full flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={addonPrice}
            onChange={(e) => setAddonPrice(e.target.value)}
            placeholder="0.00"
            className="w-24 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleAddAddon}
            className="rounded-xl border border-brand-pink px-4 text-sm font-semibold text-brand-pink-deep"
          >
            Agregar
          </button>
        </div>

        {error && <p className="mt-3 text-xs text-brand-danger">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          {isEdit ? "Guardar cambios" : "Agregar al menu"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
        >
          Cancelar
        </button>
      </form>
    </Overlay>
  );
}
