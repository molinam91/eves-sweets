"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PRODUCT_TRANSLATIONS, UI_STRINGS, type Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-locale-v1";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (typeof UI_STRINGS)[Locale];
  translateProduct: (product: Product) => { name: string; description: string };
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "es") {
        // One-time hydration sync from localStorage (SSR has no access to it), not a loop.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // ignore -- default stays "en"
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore -- per-viewer convenience only
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "es" : "en");
  }, [locale, setLocale]);

  const translateProduct = useCallback(
    (product: Product) => {
      if (locale === "es") return { name: product.name, description: product.description };
      const translation = PRODUCT_TRANSLATIONS[product.id];
      return translation ?? { name: product.name, description: product.description };
    },
    [locale]
  );

  const value: LocaleContextValue = {
    locale,
    setLocale,
    toggleLocale,
    t: UI_STRINGS[locale],
    translateProduct,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
