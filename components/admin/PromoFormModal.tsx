"use client";

import { useState } from "react";
import Overlay from "@/components/Overlay";
import { useStoreConfig } from "@/context/StoreConfigContext";
import type { PromoCode } from "@/lib/types";

export default function PromoFormModal({
  promo,
  onClose,
}: {
  promo?: PromoCode;
  onClose: () => void;
}) {
  const { addPromoCode, updatePromoCode } = useStoreConfig();
  const isEdit = Boolean(promo);

  const [code, setCode] = useState(promo?.code ?? "");
  const [type, setType] = useState<PromoCode["type"]>(promo?.type ?? "percent");
  const [value, setValue] = useState(promo ? String(promo.value) : "");
  const [active, setActive] = useState(promo?.active ?? true);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim();
    const parsedValue = Number(value);

    if (!trimmedCode) {
      setError("Ponle un codigo.");
      return;
    }
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setError("El valor debe ser un numero valido.");
      return;
    }

    const input: PromoCode = { code: trimmedCode, type, value: parsedValue, active };

    if (isEdit && promo) {
      updatePromoCode(promo.code, input);
    } else {
      addPromoCode(input);
    }
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-foreground">
        {isEdit ? "Editar codigo" : "Agregar codigo"}
      </h3>

      <form onSubmit={handleSubmit}>
        <label htmlFor="pc-code" className="mb-1 mt-3.5 block text-xs font-medium text-foreground-soft">
          Codigo
        </label>
        <input
          id="pc-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ej. DULCE10"
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm uppercase"
        />

        <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">Tipo</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("percent")}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium ${
              type === "percent"
                ? "border-brand-pink bg-surface text-brand-pink-deep"
                : "border-border bg-surface-2 text-foreground-soft"
            }`}
          >
            % Porcentaje
          </button>
          <button
            type="button"
            onClick={() => setType("fixed")}
            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium ${
              type === "fixed"
                ? "border-brand-pink bg-surface text-brand-pink-deep"
                : "border-border bg-surface-2 text-foreground-soft"
            }`}
          >
            $ Monto fijo
          </button>
        </div>

        <label htmlFor="pc-value" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          {type === "percent" ? "Porcentaje de descuento" : "Monto de descuento (USD)"}
        </label>
        <input
          id="pc-value"
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === "percent" ? "10" : "5.00"}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />

        <label className="mt-3 flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-brand-pink"
          />
          Activo
        </label>

        {error && <p className="mt-3 text-xs text-brand-danger">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          {isEdit ? "Guardar cambios" : "Agregar codigo"}
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
