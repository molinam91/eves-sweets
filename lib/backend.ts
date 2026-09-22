import type { Addon, Order, PromoCode, StoreRules } from "./types";

/**
 * Google Apps Script Web App deployed from
 * /mnt/project-files/eves-sweets-sheets-backend/Code.gs, bound to Jayro's
 * Google Sheet. It is the shared source of truth for menu, promo codes,
 * store rules, and orders across every browser/device.
 */
export const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzgJYvNnm6W1U0my7hsXdd2zcSGPTk6airPA0VnfetmPMj5lPqWXk_QS_n9Rc_elpoZ/exec";

type BackendMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  gradient: [string, string];
  photo?: string;
  isCatering: boolean;
  addons: Addon[];
};

export type BackendSnapshot = {
  menu: BackendMenuItem[];
  promos: PromoCode[];
  config: StoreRules;
  orders: Order[];
};

/**
 * Product shape sent to save_menu. `photo` is only included when it's a real
 * URL (small string, safe for a sheet cell) -- a device-local data: URL from
 * an uploaded file is never sent, it stays in this browser's localStorage.
 */
export type BackendMenuRow = BackendMenuItem;

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/**
 * The Sheet is hand-editable, so a row can arrive with the wrong type in any
 * cell (text where a number was expected, a missing column, etc). This
 * coerces every field to a safe shape so a malformed row degrades quietly
 * instead of throwing deep in a render (e.g. `null.toFixed()`) and blanking
 * the whole page.
 */
function sanitizeSnapshot(data: unknown): BackendSnapshot | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  const menu = Array.isArray(d.menu)
    ? d.menu.map((raw): BackendMenuItem => {
        const r = (raw ?? {}) as Record<string, unknown>;
        const gradient = Array.isArray(r.gradient) ? r.gradient : [];
        return {
          id: asString(r.id),
          name: asString(r.name),
          description: asString(r.description),
          price: asNumber(r.price),
          gradient: [asString(gradient[0], "#F06292"), asString(gradient[1], "#E8B84B")],
          photo: typeof r.photo === "string" && r.photo ? r.photo : undefined,
          isCatering: Boolean(r.isCatering),
          addons: Array.isArray(r.addons)
            ? r.addons.map((a) => {
                const addon = (a ?? {}) as Record<string, unknown>;
                return { id: asString(addon.id), name: asString(addon.name), price: asNumber(addon.price) };
              })
            : [],
        };
      })
    : [];

  const promos = Array.isArray(d.promos)
    ? d.promos.map((raw): PromoCode => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return {
          code: asString(r.code),
          type: r.type === "fixed" ? "fixed" : "percent",
          value: asNumber(r.value),
          active: Boolean(r.active),
        };
      })
    : [];

  const c = (d.config ?? {}) as Record<string, unknown>;
  const config: StoreRules = {
    deliveryFee: asNumber(c.deliveryFee, 5),
    bulkMaxPrice: asNumber(c.bulkMaxPrice, 10),
    bulkMinQty: asNumber(c.bulkMinQty, 5),
    bulkFreeDeliveryQty: asNumber(c.bulkFreeDeliveryQty, 5),
    whatsappNumbers:
      Array.isArray(c.whatsappNumbers) && c.whatsappNumbers.length
        ? c.whatsappNumbers.map((n) => asString(n)).filter(Boolean)
        : ["15555555555"],
    socialTiktok: asString(c.socialTiktok),
    socialInstagram: asString(c.socialInstagram),
    socialFacebook: asString(c.socialFacebook),
    contactEmail: asString(c.contactEmail),
    contactPhones: Array.isArray(c.contactPhones) ? c.contactPhones.map((n) => asString(n)).filter(Boolean) : [],
    // SHA-256 of "EvesSweets2026" -- same starter default as StoreConfigContext, used when the sheet has none set yet.
    adminPasswordHash:
      asString(c.adminPasswordHash) || "d1b8546159b7bb46fa2455017ee9d5754cdb48f407fd288d0ef9f5a99e375313",
  };

  const orders = Array.isArray(d.orders)
    ? d.orders.map((raw): Order => {
        const r = (raw ?? {}) as Record<string, unknown>;
        const createdAt = asString(r.createdAt);
        return {
          id: asString(r.id),
          createdAt: Number.isNaN(new Date(createdAt).getTime()) ? new Date().toISOString() : createdAt,
          customerName: asString(r.customerName),
          customerPhone: asString(r.customerPhone),
          fulfillment: r.fulfillment === "delivery" ? "delivery" : "pickup",
          hasCatering: Boolean(r.hasCatering),
          address: asString(r.address),
          deliveryLabel: asString(r.deliveryLabel),
          paymentMethod: r.paymentMethod === "applepay" || r.paymentMethod === "cash" ? r.paymentMethod : "zelle",
          notes: asString(r.notes),
          promoCode: typeof r.promoCode === "string" && r.promoCode ? r.promoCode : null,
          items: Array.isArray(r.items)
            ? r.items.map((raw2) => {
                const line = (raw2 ?? {}) as Record<string, unknown>;
                return {
                  name: asString(line.name),
                  qty: asNumber(line.qty, 1),
                  unitPrice: asNumber(line.unitPrice),
                  addons: Array.isArray(line.addons) ? (line.addons as Addon[]) : [],
                  isCatering: Boolean(line.isCatering),
                  eventDate: asString(line.eventDate),
                  lineTotal: asNumber(line.lineTotal),
                };
              })
            : [],
          subtotal: asNumber(r.subtotal),
          discount: asNumber(r.discount),
          deliveryFee: asNumber(r.deliveryFee),
          total: asNumber(r.total),
          status: r.status === "completed" ? "completed" : "new",
        };
      })
    : [];

  return { menu, promos, config, orders };
}

/** GETs the whole snapshot. Returns null on any failure (offline, misconfigured URL, malformed response, etc). */
export async function fetchBackendSnapshot(): Promise<BackendSnapshot | null> {
  try {
    const res = await fetch(BACKEND_URL, { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data === "object" && "error" in data) return null;
    return sanitizeSnapshot(data);
  } catch {
    return null;
  }
}

/**
 * POSTs an action. Uses Content-Type: text/plain so the browser sends it as a
 * "simple request" -- Apps Script doesn't handle the OPTIONS preflight a real
 * application/json request would trigger.
 */
async function postBackend(action: string, payload: unknown): Promise<{ ok: boolean; [k: string]: unknown } | null> {
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveMenuToBackend(rows: BackendMenuRow[]) {
  return postBackend("save_menu", rows);
}

export function savePromosToBackend(rows: PromoCode[]) {
  return postBackend("save_promos", rows);
}

export function saveConfigToBackend(config: StoreRules) {
  return postBackend("save_config", config);
}

export function addOrderToBackend(order: Order) {
  return postBackend("add_order", order);
}

export function completeOrderInBackend(id: string) {
  return postBackend("complete_order", { id });
}
