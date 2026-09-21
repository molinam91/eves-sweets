"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

  const addProduct = useCallback((input: ProductInput): Product => {
    let created!: Product;
    setProducts((prev) => {
      const id = uniqueSlug(input.name, prev.map((p) => p.id));
      created = { id, ...input };
      return [...prev, created];
    });
    return created;
  }, []);

  const updateProduct = useCallback((id: string, input: ProductInput) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setProducts(DEFAULT_PRODUCTS);
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
