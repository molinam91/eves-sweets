"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type BackendMenuRow, fetchBackendSnapshot, saveMenuToBackend } from "@/lib/backend";
import { DEFAULT_CATERING, DEFAULT_MENU } from "@/lib/mockData";
import { uniqueSlug } from "@/lib/slug";
import type { Addon, Product } from "@/lib/types";

const STORAGE_KEY = "eves-sweets-menu-v1";

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  gradient: [string, string];
  isCatering: boolean;
  addons: Addon[];
  photo?: string;
};

type MenuContextValue = {
  menu: Product[];
  catering: Product[];
  findProduct: (id: string) => Product | undefined;
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  resetToDefaults: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

const DEFAULT_PRODUCTS = [...DEFAULT_MENU, ...DEFAULT_CATERING];

/**
 * A photo pasted as a URL is small and shareable, so it's synced to the sheet.
 * A photo picked from this device's files is a data: URL (can be 100KB+) and
 * stays local-only -- it's left out of what's sent to the backend.
 */
function toBackendRow(p: Product): BackendMenuRow {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    gradient: p.gradient,
    isCatering: p.isCatering,
    addons: p.addons,
    photo: p.photo?.startsWith("http") ? p.photo : undefined,
  };
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  // Hydrate from this browser's saved catalog after mount (SSR has no
  // localStorage, so the first render always matches the seed above).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // One-time hydration sync from localStorage (SSR has no access to it), not a loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setProducts(JSON.parse(raw));
    } catch {
      // ignore -- private mode / blocked storage, seed data stays
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore -- per-viewer convenience only
    }
  }, [products]);

  // Shared backend (Google Sheet): pulls the real catalog once connected, keeping
  // this browser's local photos (the sheet has no room for those) merged in by id.
  useEffect(() => {
    let cancelled = false;
    fetchBackendSnapshot().then((snapshot) => {
      if (cancelled || !snapshot) return;
      setProducts((prev) => {
        // A shared photo URL from the sheet wins; otherwise keep this device's
        // local-only upload (never sent to the backend, so it never comes back).
        const localPhotoById = new Map(prev.map((p) => [p.id, p.photo]));
        return snapshot.menu.map((item) => ({ ...item, photo: item.photo || localPhotoById.get(item.id) }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addProduct = useCallback((input: ProductInput): Product => {
    let created!: Product;
    let next!: Product[];
    setProducts((prev) => {
      const id = uniqueSlug(input.name, prev.map((p) => p.id));
      created = { id, ...input };
      next = [...prev, created];
      return next;
    });
    saveMenuToBackend(next.map(toBackendRow));
    return created;
  }, []);

  const updateProduct = useCallback((id: string, input: ProductInput) => {
    let next!: Product[];
    setProducts((prev) => {
      next = prev.map((p) => (p.id === id ? { ...p, ...input } : p));
      return next;
    });
    saveMenuToBackend(next.map(toBackendRow));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    let next!: Product[];
    setProducts((prev) => {
      next = prev.filter((p) => p.id !== id);
      return next;
    });
    saveMenuToBackend(next.map(toBackendRow));
  }, []);

  const resetToDefaults = useCallback(() => {
    setProducts(DEFAULT_PRODUCTS);
    saveMenuToBackend(DEFAULT_PRODUCTS.map(toBackendRow));
  }, []);

  const menu = useMemo(() => products.filter((p) => !p.isCatering), [products]);
  const catering = useMemo(() => products.filter((p) => p.isCatering), [products]);
  const findProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  const value: MenuContextValue = {
    menu,
    catering,
    findProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefaults,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within MenuProvider");
  return ctx;
}
