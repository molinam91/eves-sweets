"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchBackendSnapshot, saveConfigToBackend, savePromosToBackend } from "@/lib/backend";
import { PLACEHOLDER_WHATSAPP_NUMBER, type PromoCode, type StoreRules } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-store-config-v1";

export const DEFAULT_RULES: StoreRules = {
  deliveryFee: 5,
  bulkMaxPrice: 10,
  bulkMinQty: 5,
  bulkFreeDeliveryQty: 5,
  whatsappNumbers: [PLACEHOLDER_WHATSAPP_NUMBER], // Jayro to provide the real business number
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
  /** Resolves true once the shared Sheet actually has this value; false if only saved locally. */
  updateRules: (rules: StoreRules) => Promise<boolean>;
  addPromoCode: (promo: PromoCode) => void;
  updatePromoCode: (code: string, promo: PromoCode) => void;
  deletePromoCode: (code: string) => void;
  findPromoCode: (code: string) => PromoCode | undefined;
  /** True once we've confirmed the deployed Apps Script is still on the original 5-column Config schema. */
  endpointOutdated: boolean;
};

const StoreConfigContext = createContext<StoreConfigContextValue | null>(null);

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<StoreRules>(DEFAULT_RULES);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(DEFAULT_PROMO_CODES);
  // The one-time initial backend fetch below can resolve *after* the admin has already
  // edited something (Google Apps Script can take several seconds). If it does, applying
  // it would silently revert a change the admin just made and already posted back. Once
  // there's been a local edit this session, that edit -- not a slow, now-stale GET -- wins.
  const userEditedRef = useRef(false);
  const [endpointOutdated, setEndpointOutdated] = useState(false);

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
      setEndpointOutdated(!snapshot.endpointHasExtendedConfig);
      if (userEditedRef.current) return;
      setRules({ ...DEFAULT_RULES, ...snapshot.config });
      setPromoCodes(snapshot.promos);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateRules = useCallback(async (next: StoreRules) => {
    userEditedRef.current = true;
    setRules(next);
    const result = await saveConfigToBackend(next);
    if (!result?.ok) return false;
    // A save can return ok:true even when nothing actually changed: an Apps Script
    // deployment that hasn't been redeployed past "New version" after pasting newer
    // code still runs its old column layout, silently drops fields it doesn't know
    // (like whatsappNumbers/socialTiktok/contactEmail), and reports success anyway.
    // Read the snapshot back and confirm what we sent is really what's there now.
    const check = await fetchBackendSnapshot();
    if (!check) return false;
    setEndpointOutdated(!check.endpointHasExtendedConfig);
    return (
      JSON.stringify(check.config.whatsappNumbers) === JSON.stringify(next.whatsappNumbers) &&
      check.config.socialTiktok === next.socialTiktok &&
      check.config.socialInstagram === next.socialInstagram &&
      check.config.socialFacebook === next.socialFacebook &&
      check.config.contactEmail === next.contactEmail &&
      JSON.stringify(check.config.contactPhones) === JSON.stringify(next.contactPhones) &&
      check.config.adminPasswordHash === next.adminPasswordHash
    );
  }, []);

  const addPromoCode = useCallback((promo: PromoCode) => {
    userEditedRef.current = true;
    let next!: PromoCode[];
    setPromoCodes((prev) => {
      next = [...prev, { ...promo, code: promo.code.toUpperCase() }];
      return next;
    });
    savePromosToBackend(next);
  }, []);

  const updatePromoCode = useCallback((code: string, promo: PromoCode) => {
    userEditedRef.current = true;
    let next!: PromoCode[];
    setPromoCodes((prev) => {
      next = prev.map((p) => (p.code === code ? { ...promo, code: promo.code.toUpperCase() } : p));
      return next;
    });
    savePromosToBackend(next);
  }, []);

  const deletePromoCode = useCallback((code: string) => {
    userEditedRef.current = true;
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
    () => ({
      rules,
      promoCodes,
      updateRules,
      addPromoCode,
      updatePromoCode,
      deletePromoCode,
      findPromoCode,
      endpointOutdated,
    }),
    [rules, promoCodes, updateRules, addPromoCode, updatePromoCode, deletePromoCode, findPromoCode, endpointOutdated]
  );

  return <StoreConfigContext.Provider value={value}>{children}</StoreConfigContext.Provider>;
}

export function useStoreConfig(): StoreConfigContextValue {
  const ctx = useContext(StoreConfigContext);
  if (!ctx) throw new Error("useStoreConfig must be used within StoreConfigProvider");
  return ctx;
}
