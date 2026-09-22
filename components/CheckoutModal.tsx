"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { useOrders } from "@/context/OrderContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { computeDeliveryFriday, formatDeliveryDate, money } from "@/lib/delivery";
import { PLACEHOLDER_WHATSAPP_NUMBER, type PaymentMethod } from "@/lib/types";

const PAY_KEYS: Record<PaymentMethod, "pay_zelle" | "pay_applepay" | "pay_cash"> = {
  zelle: "pay_zelle",
  applepay: "pay_applepay",
  cash: "pay_cash",
};

export default function CheckoutModal() {
  const {
    cart,
    lineTotal,
    cartTotal,
    hasCatering,
    closeModal,
    openCart,
    openConfirmation,
    clearCart,
    fulfillment,
    setFulfillment,
    appliedPromo,
    promoError,
    applyPromoCode,
    clearPromoCode,
    deliveryFeeAmount,
    deliveryFeeWaived,
    discountAmount,
    orderTotal,
  } = useCart();
  const { locale, t } = useLocale();
  const { addOrder } = useOrders();
  const { rules } = useStoreConfig();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("zelle");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const showFulfillment = !hasCatering;
  const friday = formatDeliveryDate(computeDeliveryFriday(), locale);
  const nameError = touched && !name.trim();
  const phoneError = touched && !phone.trim();
  const whatsappNumber = rules.whatsappNumbers[0];
  // Never a real send target -- the store owner hasn't configured a number yet.
  const whatsappConfigured = Boolean(whatsappNumber) && whatsappNumber !== PLACEHOLDER_WHATSAPP_NUMBER;

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    applyPromoCode(promoInput.trim());
  }

  function handleSend() {
    setTouched(true);
    if (!name.trim() || !phone.trim() || !whatsappConfigured) return;

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
        lines.push(
          deliveryFeeWaived || deliveryFeeAmount === 0
            ? "Costo de entrega: gratis"
            : `Costo de entrega: ${money(deliveryFeeAmount)}`
        );
      } else {
        lines.push(`Recoleccion en tienda — ${friday}`);
      }
    }
    lines.push(`Pago: ${PAY_KEYS[payment]} (te contactaremos por WhatsApp para confirmar el pago)`);
    if (appliedPromo) {
      lines.push(`Codigo promocional: ${appliedPromo.code} (-${money(discountAmount)})`);
    }
    if (notes.trim()) lines.push(`Notas: ${notes.trim()}`);
    lines.push(`Subtotal: ${money(cartTotal)}`);
    lines.push(`Total: ${money(orderTotal)}`);

    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waUrl, "_blank", "noopener");

    addOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      fulfillment,
      hasCatering,
      address: showFulfillment && fulfillment === "delivery" ? address.trim() : "",
      deliveryLabel: friday,
      paymentMethod: payment,
      notes: notes.trim(),
      promoCode: appliedPromo?.code ?? null,
      items: cart.map((line) => ({
        name: line.name,
        qty: line.qty,
        unitPrice: line.unitPrice,
        addons: line.addons,
        isCatering: line.isCatering,
        eventDate: line.eventDate,
        lineTotal: lineTotal(line),
      })),
      subtotal: cartTotal,
      discount: discountAmount,
      deliveryFee: deliveryFeeAmount,
      total: orderTotal,
    });

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
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-foreground-soft"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold text-foreground">{t.checkout_title}</h3>
        <p className="mt-1 text-sm text-foreground-soft">{t.checkout_subtitle}</p>

        <label htmlFor="f-name" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          {t.full_name}
        </label>
        <input
          id="f-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.full_name_placeholder}
          className="w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm"
          style={{ borderColor: nameError ? "var(--brand-danger)" : "var(--border)" }}
        />

        <label htmlFor="f-phone" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          {t.phone}
        </label>
        <input
          id="f-phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t.phone_placeholder}
          className="w-full rounded-xl border bg-surface-2 px-3 py-2.5 text-sm"
          style={{ borderColor: phoneError ? "var(--brand-danger)" : "var(--border)" }}
        />

        {showFulfillment ? (
          <>
            <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
              {t.fulfillment}
            </span>
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
                {t.delivery_option}
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
                {t.pickup_option}
              </button>
            </div>
            {fulfillment === "delivery" && (
              <>
                <label htmlFor="f-address" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
                  {t.delivery_address}
                </label>
                <input
                  id="f-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.address_placeholder}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
                />
              </>
            )}
            <p className="mt-2.5 text-xs text-foreground-soft">{t.estimated_date(friday)}</p>
          </>
        ) : (
          <p className="mt-3 text-xs text-foreground-soft">{t.catering_note}</p>
        )}

        <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          {t.promo_code}
        </span>
        {appliedPromo ? (
          <div className="flex items-center justify-between rounded-xl border border-brand-pink bg-surface-2 px-3 py-2.5 text-sm">
            <span className="font-semibold text-brand-pink-deep">{t.promo_applied(appliedPromo.code)}</span>
            <button type="button" onClick={clearPromoCode} className="text-xs underline text-foreground-soft">
              {t.remove}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder={t.promo_code_placeholder}
              className="w-full flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm uppercase"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="rounded-xl border border-brand-pink px-4 text-sm font-semibold text-brand-pink-deep"
            >
              {t.apply}
            </button>
          </div>
        )}
        {promoError && <p className="mt-1 text-xs text-brand-danger">{promoError}</p>}

        <span className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          {t.payment_method}
        </span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PAY_KEYS) as PaymentMethod[]).map((method) => (
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
              {t[PAY_KEYS[method]]}
            </label>
          ))}
        </div>

        <label htmlFor="f-notes" className="mb-1 mt-3 block text-xs font-medium text-foreground-soft">
          {t.additional_notes}
        </label>
        <textarea
          id="f-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.additional_notes_placeholder}
          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
        />

        <div className="mt-4 space-y-1.5 border-t border-dashed border-border pt-3.5">
          <div className="flex items-baseline justify-between text-sm text-foreground-soft">
            <span>{t.subtotal}</span>
            <span className="tabular-nums">{money(cartTotal)}</span>
          </div>
          {showFulfillment && fulfillment === "delivery" && (
            <div className="flex items-baseline justify-between text-sm text-foreground-soft">
              <span>{t.delivery_fee_label}</span>
              <span className="tabular-nums">
                {deliveryFeeAmount === 0 ? t.delivery_fee_waived : money(deliveryFeeAmount)}
              </span>
            </div>
          )}
          {appliedPromo && (
            <div className="flex items-baseline justify-between text-sm text-brand-pink-deep">
              <span>{t.discount_label}</span>
              <span className="tabular-nums">-{money(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-sm">{t.order_total}</span>
            <span className="font-script text-2xl tabular-nums text-brand-pink-deep">
              {money(orderTotal)}
            </span>
          </div>
        </div>

        {touched && !whatsappConfigured && (
          <p className="mt-3 text-xs text-brand-danger">{t.whatsapp_not_configured}</p>
        )}
        <button
          type="button"
          onClick={handleSend}
          className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
        >
          {t.send_whatsapp}
        </button>
        <button
          type="button"
          onClick={() => {
            closeModal();
            openCart();
          }}
          className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
        >
          {t.back_to_cart}
        </button>
      </div>
    </div>
  );
}
