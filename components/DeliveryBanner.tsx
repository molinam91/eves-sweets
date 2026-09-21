"use client";

import { useEffect, useState } from "react";
import { computeDeliveryFriday, formatDeliveryDate } from "@/lib/delivery";

export default function DeliveryBanner() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setLabel(formatDeliveryDate(computeDeliveryFriday()));
    }
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-5 py-3.5 text-sm text-foreground">
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-ok" />
      <span>
        Pide antes del <b className="text-brand-pink-deep">miercoles 4:00pm</b> y recibe el{" "}
        <b className="text-brand-pink-deep">{label ?? "..."}</b>. Despues de esa hora, tu pedido
        se entrega el viernes siguiente.
      </span>
    </div>
  );
}
