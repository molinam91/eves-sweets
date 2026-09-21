"use client";

import { useState } from "react";
import { useStoreConfig } from "@/context/StoreConfigContext";

export default function StoreRulesForm() {
  const { rules, updateRules } = useStoreConfig();
  const [deliveryFee, setDeliveryFee] = useState(String(rules.deliveryFee));
  const [bulkMaxPrice, setBulkMaxPrice] = useState(String(rules.bulkMaxPrice));
  const [bulkMinQty, setBulkMinQty] = useState(String(rules.bulkMinQty));
  const [bulkFreeDeliveryQty, setBulkFreeDeliveryQty] = useState(String(rules.bulkFreeDeliveryQty));
  const [whatsappNumbers, setWhatsappNumbers] = useState(rules.whatsappNumbers);
  const [newNumber, setNewNumber] = useState("");
  const [saved, setSaved] = useState(false);

  function handleAddNumber() {
    const trimmed = newNumber.trim().replace(/[^\d]/g, "");
    if (!trimmed) return;
    setWhatsappNumbers((prev) => [...prev, trimmed]);
    setNewNumber("");
  }

  function handleRemoveNumber(idx: number) {
    setWhatsappNumbers((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleEditNumber(idx: number, value: string) {
    const digits = value.replace(/[^\d]/g, "");
    setWhatsappNumbers((prev) => prev.map((n, i) => (i === idx ? digits : n)));
  }

  function handleMakePrimary(idx: number) {
    setWhatsappNumbers((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(idx, 1);
      return [chosen, ...next];
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateRules({
      deliveryFee: Number(deliveryFee) || 0,
      bulkMaxPrice: Number(bulkMaxPrice) || 0,
      bulkMinQty: Math.max(1, Math.round(Number(bulkMinQty) || 1)),
      bulkFreeDeliveryQty: Math.max(1, Math.round(Number(bulkFreeDeliveryQty) || 1)),
      whatsappNumbers: whatsappNumbers.length ? whatsappNumbers : rules.whatsappNumbers,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <div>
        <label htmlFor="r-fee" className="mb-1 block text-xs font-medium text-foreground-soft">
          Costo de entrega (USD)
        </label>
        <input
          id="r-fee"
          type="number"
          min="0"
          step="0.01"
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="r-maxprice" className="mb-1 block text-xs font-medium text-foreground-soft">
          Regla de cantidad minima: articulos con precio menor a (USD)
        </label>
        <input
          id="r-maxprice"
          type="number"
          min="0"
          step="0.01"
          value={bulkMaxPrice}
          onChange={(e) => setBulkMaxPrice(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="r-minqty" className="mb-1 block text-xs font-medium text-foreground-soft">
          Cantidad minima por pedido (para esos articulos)
        </label>
        <input
          id="r-minqty"
          type="number"
          min="1"
          step="1"
          value={bulkMinQty}
          onChange={(e) => setBulkMinQty(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="r-freeqty" className="mb-1 block text-xs font-medium text-foreground-soft">
          Cantidad para envio gratis (mismo articulo)
        </label>
        <input
          id="r-freeqty"
          type="number"
          min="1"
          step="1"
          value={bulkFreeDeliveryQty}
          onChange={(e) => setBulkFreeDeliveryQty(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-foreground-soft">
          Numeros de WhatsApp (el primero recibe los pedidos, los demas son de respaldo)
        </span>
        {whatsappNumbers.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {whatsappNumbers.map((num, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <input
                  type="text"
                  value={num}
                  onChange={(e) => handleEditNumber(idx, e.target.value)}
                  className="w-full flex-1 bg-transparent tabular-nums outline-none"
                />
                {idx === 0 ? (
                  <span className="whitespace-nowrap text-[11px] font-semibold text-brand-pink-deep">
                    principal
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMakePrimary(idx)}
                    className="whitespace-nowrap text-xs underline text-foreground-soft"
                  >
                    Hacer principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveNumber(idx)}
                  className="whitespace-nowrap text-xs underline text-brand-danger"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="Ej. 16505551234 (codigo de pais + numero, sin espacios)"
            className="w-full flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={handleAddNumber}
            className="rounded-xl border border-brand-pink px-4 text-sm font-semibold text-brand-pink-deep"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          Guardar
        </button>
        {saved && <span className="ml-3 text-xs text-brand-ok">Guardado.</span>}
      </div>
    </form>
  );
}
