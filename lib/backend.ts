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

/** Product shape sent to save_menu -- photo is intentionally left out, it only lives locally for now. */
export type BackendMenuRow = Omit<BackendMenuItem, "photo">;

/** GETs the whole snapshot. Returns null on any failure (offline, misconfigured URL, etc). */
export async function fetchBackendSnapshot(): Promise<BackendSnapshot | null> {
  try {
    const res = await fetch(BACKEND_URL, { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.error) return null;
    return data as BackendSnapshot;
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
