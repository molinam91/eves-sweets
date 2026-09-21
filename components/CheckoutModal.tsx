"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { computeDeliveryFriday, formatDeliveryDate, money } from "@/lib/delivery";
import { WHATSAPP_NUMBER } from "@/lib/mockData";
import type { PaymentMethod } from "@/lib/types";

const PAY_LABELS: Record<PaymentMethod, string> = {
  zelle: "Zelle",
  applepay: "Apple Pay",
  cash: "Efectivo",
};

export default function CheckoutModal() {
  const { cart, lineTotal, cartTotal, hasCatering, closeModal, openCart, openConfirmation, clearCart } =
    useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("zelle");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);

  const showFulfillment = !hasCatering;
  const friday = formatDeliveryDate(computeDeliveryFriday());
  const nameError = touched && !name.trim();
  const phoneError = touched && !phone.trim();

  function handleSend() {
    setTouched(true);
    if (!name.trim() || !phone.trim()) return;

    const lines: string[] = [];
    lines.push("Pedido nuevo — Eve's Sweets");
    lines.push(`Cliente: ${name.trim()} (${phone.trim()})`);
    cart.forEach((line) => {
      const addonsTxt = line.addons.length
        ? " + " + line.addons.map((a) => a.name).join(", ")
        : "";
      const eventTxt = line.isCatering && line.eventDate ? ` [Evento: ${line.eventDate}]` : "";
      lines.push(`- ${line.qty}x ${line.name}${addonsTxt}${eventTxt} — ${money(lineTotal(line))}`);
    });
    if (showFulfillment) {
      if (fulfillment === "delivery") {
        lines.push(`Entrega: ${address.trim()} — ${friday}`);
      } else {
        lines.push(`Recoleccion en tienda — ${friday}`);
      }
    }
    lines.push(`Pago: ${PAY_LABELS[payment]} (te contactaremos por WhatsApp para confirmar el pago)`);
    if (notes.trim()) lines.push(`Notas: ${notes.trim()}`);
    lines.push(`Total: ${money(cartTotal)}`);

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waUrl, "_blank", "noopener");

    const customerName = name.trim();
    clearCart();
    openConfirmation(customerName);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-pink-deep/40 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-2xl sm:rounded-3xl">
        <button
          type="button"
          onClick={closeModal}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-foreground-soft"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold text-foreground">Finalizar pedido</h3>
        <p className="mt-1 text-sm text-foreground-soft">
          Te vamos a redirigir a WhatsApp con tu pedido listo para enviar.
        </p>

        <label htmlFor="f-name" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          Nombre completo
        </label>
        <input
          id="f-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm"
          style={{ borderColor: nameError ? "var(--brand-danger)" : "var(--border)" }}
        />

        <label htmlFor="f-phone" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          Telefono
        </label>
        <input
          id="f-phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-5555"
          className="w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm"
          style={{ borderColor: phoneError ? "var(--brand-danger)" : "var(--border)" }}
        />

        {showFulfillment ? (
          <>
            <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">Entrega</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFulfillment("delivery")}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium ${
                  fulfillment === "delivery"
                    ? "border-brand-pink bg-surface text-brand-pink-deep"
                    : "border-border bg-surface-2 text-foreground-soft"
                }`}
              >
                Entrega a domicilio
              </button>
              <button
                type="button"
                onClick={() => setFulfillment("pickup")}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium ${
                  fulfillment === "pickup"
                    ? "border-brand-pink bg-surface text-brand-pink-deep"
                    : "border-border bg-surface-2 text-foreground-soft"
                }`}
              >
                Recoleccion
              </button>
            </div>
            {fulfillment === "delivery" && (
              <>
                <label htmlFor="f-address" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
                  Direccion de entrega
                </label>
                <input
                  id="f-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, ciudad, codigo postal"
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
                />
              </>
            )}
            <p className="mt-2.5 text-xs text-foreground-soft">
              Fecha estimada: <b className="text-foreground">{friday}</b> (segun la regla de corte
              del miercoles 4pm).
            </p>
          </>
        ) : (
          <p className="mt-3 text-xs text-foreground-soft">
            Este pedido incluye articulos de catering; coordinaremos la fecha de tu evento por
            WhatsApp.
          </p>
        )}

        <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">Metodo de pago</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PAY_LABELS) as PaymentMethod[]).map((method) => (
            <label
              key={method}
              className={`min-w-[90px] flex-1 cursor-pointer rounded-xl border py-2.5 text-center text-xs font-medium ${
                payment === method
                  ? "border-brand-pink bg-surface-2 font-bold text-brand-pink-deep"
                  : "border-border text-foreground-soft"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method}
                checked={payment === method}
                onChange={() => setPayment(method)}
                className="hidden"
              />
              {PAY_LABELS[method]}
            </label>
          ))}
        </div>

        <label htmlFor="f-notes" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          Notas adicionales (opcional)
        </label>
        <textarea
          id="f-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instrucciones especiales..."
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />

        <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-border pt-3.5">
          <span className="text-sm">Total del pedido</span>
          <span className="font-script text-2xl tabular-nums text-brand-pink-deep">
            {money(cartTotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSend}
          className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          Enviar pedido por WhatsApp
        </button>
        <button
          type="button"
          onClick={() => {
            closeModal();
            openCart();
          }}
          className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
        >
          Volver al carrito
        </button>
      </div>
    </div>
  );
}
