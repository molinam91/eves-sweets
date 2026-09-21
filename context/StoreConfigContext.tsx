"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PromoCode, StoreRules } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-store-config-v1";

export const DEFAULT_RULES: StoreRules = {
  deliveryFee: 5,
  bulkMaxPrice: 10,
  bulkMinQty: 5,
  bulkFreeDeliveryQty: 5,
};

const DEFAULT_PROMO_CODES: PromoCode[] = [];

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
        // One-time hydration sync from localStorage (SSR has no access to it), not a loop.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRules(parsed.rules);
        setPromoCodes(parsed.promoCodes);
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

  const updateRules = useCallback((next: StoreRules) => setRules(next), []);

  const addPromoCode = useCallback((promo: PromoCode) => {
    setPromoCodes((prev) => [...prev, { ...promo, code: promo.code.toUpperCase() }]);
  }, []);

  const updatePromoCode = useCallback((code: string, promo: PromoCode) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.code === code ? { ...promo, code: promo.code.toUpperCase() } : p))
    );
  }, []);

  const deletePromoCode = useCallback((code: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.code !== code));
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
