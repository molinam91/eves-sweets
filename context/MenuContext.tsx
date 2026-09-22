"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { type BackendMenuRow, fetchBackendSnapshot, saveMenuToBackend } from "@/lib/backend";
import { DEFAULT_CATERING, DEFAULT_MENU } from "@/lib/mockData";
import { slugify, uniqueSlug } from "@/lib/slug";
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

// The site's own bundled stock photos (public/menu/*.jpg), keyed by product id.
// Neither localStorage (which can predate a given photo being added to the
// codebase) nor the sheet (which never carries these) has these, so without
// this fallback a bundled photo can vanish behind an older cached snapshot.
const DEFAULT_PHOTO_BY_ID = new Map(DEFAULT_PRODUCTS.map((p) => [p.id, p.photo]));

/**
 * Bundled stock photos for items Jayro added himself from the admin panel (they live
 * only in the sheet, under whatever id the admin form generated, so DEFAULT_PHOTO_BY_ID
 * can't key on their id). Matched by the tokens in the item's own name instead -- Jayro
 * confirmed each photo he sent is named after an existing menu item, not a new one.
 */
// Order matters: DEFAULT_PHOTO_BY_NAME_TOKENS.find() takes the first match, so a more
// specific entry (e.g. "fitness" banana bread) must come before a more generic one that
// would otherwise also match it (plain "banana" + "bread").
const DEFAULT_PHOTO_BY_NAME_TOKENS: { tokens: string[]; photo: string }[] = [
  { tokens: ["gelatina", "party"], photo: "/menu/gelatina-mosaico-party-size.jpg" },
  { tokens: ["jalapeno", "cheddar"], photo: "/menu/jalapeno-cheddar-bread.jpg" },
  { tokens: ["habanero", "cheddar"], photo: "/menu/habanero-cheddar-bread.jpg" },
  { tokens: ["garlic"], photo: "/menu/garlic-cheese-loaf.jpg" },
  { tokens: ["cinnamon"], photo: "/menu/cinnamon-swirl.jpg" },
  { tokens: ["chocolate", "swirl"], photo: "/menu/chocolate-swirl.jpg" },
  { tokens: ["chocolate", "muffin"], photo: "/menu/chocolate-chip-banana-muffins.jpg" },
  { tokens: ["mexican", "cheesecake"], photo: "/menu/mexican-cheesecake.jpg" },
  { tokens: ["fitness", "banana"], photo: "/menu/fitness-banana-bread.jpg" },
  { tokens: ["banana", "bread"], photo: "/menu/banana-bread.jpg" },
];

function defaultPhotoByName(name: string): string | undefined {
  const normalized = slugify(name);
  const match = DEFAULT_PHOTO_BY_NAME_TOKENS.find((entry) =>
    entry.tokens.every((token) => normalized.includes(token))
  );
  return match?.photo;
}

/**
 * This browser's own saved catalog can predate a fix (or come from a moment
 * when the shared backend returned something odd), so a stale null/NaN price
 * can be sitting in localStorage indefinitely. Coerce it back to a safe
 * number on every hydration, the same way a fresh backend fetch is sanitized.
 */
function sanitizeStoredProducts(parsed: unknown): Product[] {
  if (!Array.isArray(parsed)) return DEFAULT_PRODUCTS;
  return parsed.map((raw) => {
    const p = (raw ?? {}) as Partial<Product> & { price?: unknown; addons?: unknown };
    const price = Number(p.price);
    return {
      ...(p as Product),
      price: Number.isFinite(price) ? price : 0,
      addons: Array.isArray(p.addons)
        ? p.addons.map((a) => {
            const addonPrice = Number((a as Partial<Addon>)?.price);
            return { ...(a as Addon), price: Number.isFinite(addonPrice) ? addonPrice : 0 };
          })
        : [],
    };
  });
}

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
  // See StoreConfigContext's identical guard: the one-time initial fetch below can resolve
  // after the admin already edited the menu (Apps Script can be slow), which would otherwise
  // silently revert what they just saved.
  const userEditedRef = useRef(false);

  // Hydrate from this browser's saved catalog after mount (SSR has no
  // localStorage, so the first render always matches the seed above).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // One-time hydration sync from localStorage (SSR has no access to it), not a loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setProducts(sanitizeStoredProducts(JSON.parse(raw)));
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
      if (cancelled || !snapshot || userEditedRef.current) return;
      setProducts((prev) => {
        // A shared photo URL from the sheet wins; otherwise keep this device's
        // local-only upload (never sent to the backend, so it never comes back);
        // otherwise fall back to the item's own bundled stock photo, if it has one.
        const localPhotoById = new Map(prev.map((p) => [p.id, p.photo]));
        return snapshot.menu.map((item) => ({
          ...item,
          photo:
            item.photo ||
            localPhotoById.get(item.id) ||
            DEFAULT_PHOTO_BY_ID.get(item.id) ||
            defaultPhotoByName(item.name),
        }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addProduct = useCallback((input: ProductInput): Product => {
    userEditedRef.current = true;
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
    userEditedRef.current = true;
    let next!: Product[];
    setProducts((prev) => {
      next = prev.map((p) => (p.id === id ? { ...p, ...input } : p));
      return next;
    });
    saveMenuToBackend(next.map(toBackendRow));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    userEditedRef.current = true;
    let next!: Product[];
    setProducts((prev) => {
      next = prev.filter((p) => p.id !== id);
      return next;
    });
    saveMenuToBackend(next.map(toBackendRow));
  }, []);

  const resetToDefaults = useCallback(() => {
    userEditedRef.current = true;
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
