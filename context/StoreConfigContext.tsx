"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchBackendSnapshot, saveConfigToBackend, savePromosToBackend } from "@/lib/backend";
import type { PromoCode, StoreRules } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-store-config-v1";

export const DEFAULT_RULES: StoreRules = {
  deliveryFee: 5,
  bulkMaxPrice: 10,
  bulkMinQty: 5,
  bulkFreeDeliveryQty: 5,
  whatsappNumbers: ["15555555555"], // placeholder -- Jayro to provide the real business number
  socialTiktok: "",
  socialInstagram: "",
  socialFacebook: "",
  contactEmail: "",
  contactPhones: [],
  // SHA-256 of "EvesSweets2026" -- starter password, change it from Settings.
  adminPasswordHash: "d1b8546159b7bb46fa2455017ee9d5754cdb48f407fd288d0ef9f5a99e375313",
};

const DEFAULT_PROMO_CODES: PromoCode[] = [];

/** Same reasoning as MenuContext's sanitizer: a sheet-hand-edited or pre-fix-saved rules object can have the wrong shape. */
function sanitizeStoredRules(parsed: unknown): Partial<StoreRules> {
  if (!parsed || typeof parsed !== "object") return {};
  const r = parsed as Record<string, unknown>;
  const num = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    deliveryFee: num(r.deliveryFee, DEFAULT_RULES.deliveryFee),
    bulkMaxPrice: num(r.bulkMaxPrice, DEFAULT_RULES.bulkMaxPrice),
    bulkMinQty: num(r.bulkMinQty, DEFAULT_RULES.bulkMinQty),
    bulkFreeDeliveryQty: num(r.bulkFreeDeliveryQty, DEFAULT_RULES.bulkFreeDeliveryQty),
    whatsappNumbers:
      Array.isArray(r.whatsappNumbers) && r.whatsappNumbers.length
        ? r.whatsappNumbers.map((n) => str(n)).filter(Boolean)
        : DEFAULT_RULES.whatsappNumbers,
    socialTiktok: str(r.socialTiktok),
    socialInstagram: str(r.socialInstagram),
    socialFacebook: str(r.socialFacebook),
    contactEmail: str(r.contactEmail),
    contactPhones: Array.isArray(r.contactPhones) ? r.contactPhones.map((n) => str(n)).filter(Boolean) : [],
    adminPasswordHash: str(r.adminPasswordHash) || DEFAULT_RULES.adminPasswordHash,
  };
}

type StoredConfig = {
  rules: StoreRules;
  promoCodes: PromoCode[];
};

type StoreConfigContextValue = {
  rules: StoreRules;
  promoCodes: PromoCode[];
  updateRules: (rules: StoreRules) => void;
  addPromoCode: (promo: PromoCode) => void;
  updatePromoCode: (code: string, promo: PromoCode) => void;
  deletePromoCode: (code: string) => void;
  findPromoCode: (code: string) => PromoCode | undefined;
};

const StoreConfigContext = createContext<StoreConfigContextValue | null>(null);

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<StoreRules>(DEFAULT_RULES);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(DEFAULT_PROMO_CODES);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredConfig = JSON.parse(raw);
        // Merge over defaults so a browser with an older saved shape (missing a
        // field added later, like whatsappNumbers) still gets a valid value.
        // One-time hydration sync from localStorage (SSR has no access to it), not a loop.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRules({ ...DEFAULT_RULES, ...sanitizeStoredRules(parsed.rules) });
        setPromoCodes(Array.isArray(parsed.promoCodes) ? parsed.promoCodes : DEFAULT_PROMO_CODES);
      }
    } catch {
      // ignore -- seed data stays
    }
  }, []);

  useEffect(() => {
    try {
      const config: StoredConfig = { rules, promoCodes };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore -- per-viewer convenience only
    }
  }, [rules, promoCodes]);

  // Shared backend (Google Sheet): once connected, rules and promo codes are
  // shared across every browser instead of living per-device.
  useEffect(() => {
    let cancelled = false;
    fetchBackendSnapshot().then((snapshot) => {
      if (cancelled || !snapshot) return;
      setRules({ ...DEFAULT_RULES, ...snapshot.config });
      setPromoCodes(snapshot.promos);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateRules = useCallback((next: StoreRules) => {
    setRules(next);
    saveConfigToBackend(next);
  }, []);

  const addPromoCode = useCallback((promo: PromoCode) => {
    let next!: PromoCode[];
    setPromoCodes((prev) => {
      next = [...prev, { ...promo, code: promo.code.toUpperCase() }];
      return next;
    });
    savePromosToBackend(next);
  }, []);

  const updatePromoCode = useCallback((code: string, promo: PromoCode) => {
    let next!: PromoCode[];
    setPromoCodes((prev) => {
      next = prev.map((p) => (p.code === code ? { ...promo, code: promo.code.toUpperCase() } : p));
      return next;
    });
    savePromosToBackend(next);
  }, []);

  const deletePromoCode = useCallback((code: string) => {
    let next!: PromoCode[];
    setPromoCodes((prev) => {
      next = prev.filter((p) => p.code !== code);
      return next;
    });
    savePromosToBackend(next);
  }, []);

  const findPromoCode = useCallback(
    (code: string) => promoCodes.find((p) => p.code === code.trim().toUpperCase() && p.active),
    [promoCodes]
  );

  const value: StoreConfigContextValue = useMemo(
    () => ({ rules, promoCodes, updateRules, addPromoCode, updatePromoCode, deletePromoCode, findPromoCode }),
    [rules, promoCodes, updateRules, addPromoCode, updatePromoCode, deletePromoCode, findPromoCode]
  );

  return <StoreConfigContext.Provider value={value}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfig(): StoreConfigContextValue {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) throw new Error("useStoreConfig must be used within StoreConfigProvider");
  return ctx;
}
