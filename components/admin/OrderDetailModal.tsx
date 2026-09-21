"use client";

import Overlay from "@/components/Overlay";
import { money } from "@/lib/delivery";
import type { Order } from "@/lib/types";

const PAY_LABELS: Record<Order["paymentMethod"], string> = {
  zelle: "Zelle",
  applepay: "Apple Pay",
  cash: "Efectivo",
};

export default function OrderDetailModal({
  order,
  onClose,
  onComplete,
}: {
  order: Order;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-semibold text-foreground">Pedido #{order.id}</h3>
      <p className="mt-1 text-xs text-foreground-soft">
        {new Date(order.createdAt).toLocaleString("es-US")}
      </p>

      <div className="mt-3.5 rounded-xl border border-border bg-surface-2 p-3.5">
        <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
        <p className="text-xs text-foreground-soft">{order.customerPhone}</p>
      </div>

      <div className="mt-3.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="border-t border-border py-2.5 text-sm first:border-t-0">
            <div className="flex items-baseline justify-between">
              <span>
                {item.qty}x {item.name}
              </span>
              <span className="tabular-nums text-brand-pink-deep">{money(item.lineTotal)}</span>
            </div>
            {item.addons.length > 0 && (
              <p className="text-xs text-foreground-soft">
                {item.addons.map((a) => a.name).join(", ")}
              </p>
            )}
            {item.isCatering && item.eventDate && (
              <p className="text-xs text-foreground-soft">Fecha del evento: {item.eventDate}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3.5 space-y-1 border-t border-dashed border-border pt-3.5 text-sm">
        <div className="flex justify-between text-foreground-soft">
          <span>{order.hasCatering ? "Catering" : order.fulfillment === "delivery" ? "Entrega a domicilio" : "Recoleccion"}</span>
          <span>{order.deliveryLabel}</span>
        </div>
        {order.address && <p className="text-xs text-foreground-soft">{order.address}</p>}
        <div className="flex justify-between text-foreground-soft">
          <span>Metodo de pago</span>
          <span>{PAY_LABELS[order.paymentMethod]}</span>
        </div>
        {order.promoCode && (
          <div className="flex justify-between text-foreground-soft">
            <span>Codigo promocional</span>
            <span>{order.promoCode}</span>
          </div>
        )}
        {order.notes && (
          <div className="flex justify-between text-foreground-soft">
            <span>Notas</span>
            <span className="max-w-[60%] text-right">{order.notes}</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1 border-t border-dashed border-border pt-3.5 text-sm">
        <div className="flex justify-between text-foreground-soft">
          <span>Subtotal</span>
          <span className="tabular-nums">{money(order.subtotal)}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-foreground-soft">
            <span>Costo de entrega</span>
            <span className="tabular-nums">{money(order.deliveryFee)}</span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex justify-between text-brand-pink-deep">
            <span>Descuento</span>
            <span className="tabular-nums">-{money(order.discount)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-1">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-script text-2xl tabular-nums text-brand-pink-deep">
            {money(order.total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="mt-4 w-full rounded-full bg-brand-pink py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-pink-dark"
      >
        Marcar como completado
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
      >
        Cerrar
      </button>
    </Overlay>
  );
}
