import { PLACEHOLDER_WHATSAPP_NUMBER, type Addon, type Order, type PromoCode, type StoreRules } from "./types";

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
  /**
   * False when the deployed Apps Script's `config` response is missing a field only the
   * current schema has (e.g. `adminPasswordHash`) -- a strong signal the endpoint is
   * still running an older version of Code.gs (pasting new code does nothing at the
   * /exec URL until it's redeployed as a new version). When this is false, whatsapp
   * numbers still round-trip (that field has been there since the first backend
   * version), but social links, contact info, and the admin password have no column to
   * be written into and will never persist no matter how many times they're saved.
   */
  endpointHasExtendedConfig: boolean;
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
 * Like asString, but also accepts a number -- Sheets silently stores a numeric-looking
 * cell (e.g. an order id written as the text "0003") as an actual number, dropping any
 * leading zeros. Reading that back with asString alone would return "" for every id
 * (since it's no longer typeof "string"), collapsing every order onto the same blank
 * key: they'd all look identical to any code that compares or dedupes by id, which is
 * what made every order landing in the shared Sheet appear duplicated on admin's device.
 */
function asIdString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return fallback;
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
          id: asIdString(r.id),
          name: asString(r.name),
          description: asString(r.description),
          price: asNumber(r.price),
          gradient: [asString(gradient[0], "#F06292"), asString(gradient[1], "#E8B84B")],
          photo: typeof r.photo === "string" && r.photo ? r.photo : undefined,
          isCatering: Boolean(r.isCatering),
          addons: Array.isArray(r.addons)
            ? r.addons.map((a) => {
                const addon = (a ?? {}) as Record<string, unknown>;
                return { id: asIdString(addon.id), name: asString(addon.name), price: asNumber(addon.price) };
              })
            : [],
        };
      })
    : [];

  const promos = Array.isArray(d.promos)
    ? d.promos.map((raw): PromoCode => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return {
          code: asIdString(r.code),
          type: r.type === "fixed" ? "fixed" : "percent",
          value: asNumber(r.value),
          active: Boolean(r.active),
        };
      })
    : [];

  const c = (d.config ?? {}) as Record<string, unknown>;
  // Checked on the RAW response, before any defaults below fill it in -- a deployment
  // still running the original 5-column schema simply never sends this key at all, so
  // its absence (not just an empty value) is the signal.
  const endpointHasExtendedConfig = Object.prototype.hasOwnProperty.call(c, "adminPasswordHash");
  const config: StoreRules = {
    deliveryFee: asNumber(c.deliveryFee, 5),
    bulkMaxPrice: asNumber(c.bulkMaxPrice, 10),
    bulkMinQty: asNumber(c.bulkMinQty, 5),
    bulkFreeDeliveryQty: asNumber(c.bulkFreeDeliveryQty, 5),
    whatsappNumbers:
      Array.isArray(c.whatsappNumbers) && c.whatsappNumbers.length
        ? c.whatsappNumbers.map((n) => asString(n)).filter(Boolean)
        : [PLACEHOLDER_WHATSAPP_NUMBER],
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
          id: asIdString(r.id),
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

  return { menu, promos, config, orders, endpointHasExtendedConfig };
}

/**
 * GETs the whole snapshot. Returns null on any failure (offline, misconfigured URL,
 * malformed response, etc).
 *
 * A GET to the same Apps Script /exec URL is a known caching trap: both the browser's
 * own HTTP cache and Google's edge in front of a public ("Anyone") deployment can serve
 * a stale response for a plain, unparameterized GET, so a page can keep showing old
 * config (or a save's own verification re-read, below, can wrongly compare against
 * pre-save data) long after the Sheet itself was updated. `cache: "no-store"` plus a
 * cache-busting query param forces every call to actually hit the script fresh.
 */
export async function fetchBackendSnapshot(): Promise<BackendSnapshot | null> {
  try {
    const url = `${BACKEND_URL}?t=${Date.now()}`;
    const res = await fetch(url, { method: "GET", cache: "no-store" });
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
      cache: "no-store",
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

/** Deletes every recorded order (resets sales/best-sellers). Never touches menu, promos, or config. */
export function clearOrdersInBackend() {
  return postBackend("clear_orders", {});
}

/** Deletes a single order (e.g. a test order), leaving every other order untouched. */
export function deleteOrderInBackend(id: string) {
  return postBackend("delete_order", { id });
}

/**
 * Uploads a photo to the store's own Drive (via the Apps Script backend) so a
 * product photo works without a third-party image host. `dataUrl` is a
 * `data:image/...;base64,...` URL (already resized/compressed client-side --
 * see readPhotoFile in ProductFormModal). Returns the hosted, directly-loadable
 * image URL on success, or null if the upload failed (offline, endpoint still
 * on an older version without this action, Drive quota, etc).
 */
export async function uploadPhotoToBackend(dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mimeType, data] = match;
  const result = await postBackend("upload_photo", { mimeType, data });
  return typeof result?.url === "string" ? result.url : null;
}
