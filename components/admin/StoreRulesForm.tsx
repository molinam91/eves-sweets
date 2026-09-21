"use client";

import { useState } from "react";
import { useStoreConfig } from "@/context/StoreConfigContext";

export default function StoreRulesForm() {
  const { rules, updateRules } = useStoreConfig();
  const [deliveryFee, setDeliveryFee] = useState(String(rules.deliveryFee));
  const [bulkMaxPrice, setBulkMaxPrice] = useState(String(rules.bulkMaxPrice));
  const [bulkMinQty, setBulkMinQty] = useState(String(rules.bulkMinQty));
  const [bulkFreeDeliveryQty, setBulkFreeDeliveryQty] = useState(String(rules.bulkFreeDeliveryQty));
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateRules({
      deliveryFee: Number(deliveryFee) || 0,
      bulkMaxPrice: Number(bulkMaxPrice) || 0,
      bulkMinQty: Math.max(1, Math.round(Number(bulkMinQty) || 1)),
      bulkFreeDeliveryQty: Math.max(1, Math.round(Number(bulkFreeDeliveryQty) || 1)),
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
