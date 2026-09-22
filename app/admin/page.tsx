"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductFormModal from "@/components/admin/ProductFormModal";
import PromoFormModal from "@/components/admin/PromoFormModal";
import StoreRulesForm from "@/components/admin/StoreRulesForm";
import { useLocale } from "@/context/LocaleContext";
import { useMenu } from "@/context/MenuContext";
import { useOrders } from "@/context/OrderContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import {
  computeDeliveryFriday,
  formatDeliveryDate,
  mondayFirstIndex,
  money,
  pacificNow,
  toPacificDate,
} from "@/lib/delivery";
import { sha256Hex } from "@/lib/hash";
import type { Product, PromoCode } from "@/lib/types";

const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const SESSION_KEY = "eves-sweets-admin-unlocked";

export default function AdminPage() {
  const { locale, t, toggleLocale } = useLocale();
  const { rules } = useStoreConfig();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    try {
      // One-time check of this tab's session -- avoids re-typing the password on every reload.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") setUnlocked(true);
    } catch {
      // ignore -- private mode / blocked storage, just asks again
    }
  }, []);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    const hash = await sha256Hex(password);
    if (hash === rules.adminPasswordHash) {
      setAuthError("");
      setUnlocked(true);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore -- per-tab convenience only
      }
    } else {
      setAuthError(t.admin_wrong_password);
    }
  }

  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
        <form onSubmit={handleUnlock} className="rounded-3xl border border-border bg-surface p-7 text-center shadow-lg">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-pink to-brand-gold font-script text-xl text-white">
            E
          </div>
          <h1 className="text-base font-semibold text-foreground">{t.admin_access}</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setAuthError("");
            }}
            placeholder={t.admin_password_placeholder}
            className="mt-3.5 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-center text-sm"
          />
          {authError && <p className="mt-2 text-xs text-brand-danger">{authError}</p>}
          <button
            type="submit"
            className="mt-3.5 w-full rounded-full bg-brand-pink py-3 text-sm font-semibold text-white hover:bg-brand-pink-dark"
          >
            {t.admin_enter}
          </button>
          <Link
            href="/"
            className="mt-2 block w-full rounded-full border border-border py-2.5 text-sm font-medium text-foreground-soft"
          >
            {t.back_to_store}
          </Link>
          <button
            type="button"
            onClick={toggleLocale}
            className="mt-3 text-[11px] text-foreground-soft underline"
          >
            {t.language}: {locale === "en" ? "English" : "Espanol"}
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { locale, t, toggleLocale } = useLocale();
  const { menu, catering, deleteProduct, resetToDefaults } = useMenu();
  const { promoCodes, deletePromoCode } = useStoreConfig();
  const { allOrders } = useOrders();

  const [productModal, setProductModal] = useState<{ category: "menu" | "catering"; product?: Product } | null>(
    null
  );
  const [promoModal, setPromoModal] = useState<{ promo?: PromoCode } | null>(null);

  // Computed client-side only: on a statically exported page, doing this
  // directly in render would bake in the build-time date instead of "today".
  const [nextDeliveryLabel, setNextDeliveryLabel] = useState<string | null>(null);
  useEffect(() => {
    // Client-only: derives "today" from the visitor's clock, not the build-time render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNextDeliveryLabel(formatDeliveryDate(computeDeliveryFriday(), locale));
  }, [locale]);

  const [weekStats, setWeekStats] = useState<{ totals: number[]; total: number; orderCount: number } | null>(
    null
  );
  useEffect(() => {
    const todayPacific = pacificNow();
    const weekStart = new Date(todayPacific);
    weekStart.setDate(todayPacific.getDate() - mondayFirstIndex(todayPacific));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const totals = DAY_LABELS.map(() => 0);
    let orderCount = 0;
    allOrders.forEach((order) => {
      const created = toPacificDate(order.createdAt);
      if (created >= weekStart && created < weekEnd) {
        totals[mondayFirstIndex(created)] += order.total;
        orderCount += 1;
      }
    });
    // Client-only: today's Pacific date determines the week window; must not run at build time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeekStats({ totals, total: totals.reduce((sum, v) => sum + v, 0), orderCount });
  }, [allOrders]);

  const weekTotals = weekStats?.totals ?? DAY_LABELS.map(() => 0);
  const totalWeek = weekStats?.total ?? 0;
  const hasSalesThisWeek = (weekStats?.total ?? 0) > 0;
  const maxVal = Math.max(1, ...weekTotals);

  // All-time, not just this week -- a new bakery shouldn't see this reset to empty every Monday.
  const bestSellers = useMemo(() => {
    const byItem = new Map<string, { qty: number; revenue: number }>();
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        const entry = byItem.get(item.name) ?? { qty: 0, revenue: 0 };
        entry.qty += item.qty;
        entry.revenue += item.lineTotal;
        byItem.set(item.name, entry);
      });
    });
    return [...byItem.entries()]
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
  }, [allOrders]);

  function handleDeleteProduct(product: Product) {
    if (window.confirm(`${t.admin_delete} "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  }

  function handleDeletePromo(promo: PromoCode) {
    if (window.confirm(`${t.admin_delete} "${promo.code}"?`)) {
      deletePromoCode(promo.code);
    }
  }

  function handleReset() {
    if (window.confirm(t.admin_reset + "?")) {
      resetToDefaults();
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-script text-3xl text-brand-pink-deep">{t.admin_panel_title}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-full border border-border bg-surface px-4 py-2 text-xs text-foreground-soft"
          >
            {locale === "en" ? "ES" : "EN"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-border bg-surface px-4 py-2 text-xs text-foreground-soft"
          >
            {t.back_to_store}
          </Link>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label={t.admin_sales_week} value={money(totalWeek)} />
        <StatTile label={t.admin_orders_week} value={String(weekStats?.orderCount ?? 0)} />
        <StatTile label={t.admin_next_delivery} value={nextDeliveryLabel ?? "..."} small />
      </div>

      <div className="mb-5 rounded-3xl border border-border bg-surface p-5">
        <h2 className="mb-3.5 text-sm font-semibold text-foreground">{t.admin_weekly_summary}</h2>
        {hasSalesThisWeek ? (
          <div className="flex h-36 items-end gap-2.5">
            {DAY_LABELS.map((day, i) => (
              <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[11px] tabular-nums text-foreground-soft">{money(weekTotals[i])}</span>
                <div
                  className="w-full max-w-[34px] rounded-t-md bg-gradient-to-t from-brand-pink to-brand-gold"
                  style={{ height: `${Math.round((weekTotals[i] / maxVal) * 100)}%` }}
                />
                <span className="text-[11px] text-foreground-soft">{day}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center text-sm text-foreground-soft">
            {t.admin_no_sales_yet}
          </div>
        )}
      </div>

      <div className="mb-5 rounded-3xl border border-border bg-surface p-5">
        <h2 className="mb-3.5 text-sm font-semibold text-foreground">{t.admin_best_sellers}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-foreground-soft">
                <th className="border-b border-border pb-2 font-medium">Articulo</th>
                <th className="border-b border-border pb-2 font-medium">Cantidad vendida</th>
                <th className="border-b border-border pb-2 font-medium">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((item) => (
                <tr key={item.name}>
                  <td className="border-b border-border py-2.5">{item.name}</td>
                  <td className="border-b border-border py-2.5 tabular-nums">{item.qty}</td>
                  <td className="border-b border-border py-2.5 tabular-nums">{money(item.revenue)}</td>
                </tr>
              ))}
              {bestSellers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-xs text-foreground-soft">
                    Sin ventas todavia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductSection
        title={t.nav_menu}
        category="menu"
        products={menu}
        t={t}
        onAdd={() => setProductModal({ category: "menu" })}
        onEdit={(p) => setProductModal({ category: "menu", product: p })}
        onDelete={handleDeleteProduct}
      />

      <ProductSection
        title={t.nav_catering}
        category="catering"
        products={catering}
        t={t}
        onAdd={() => setProductModal({ category: "catering" })}
        onEdit={(p) => setProductModal({ category: "catering", product: p })}
        onDelete={handleDeleteProduct}
      />

      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full border border-border bg-surface px-4 py-2 text-xs text-foreground-soft"
        >
          {t.admin_reset}
        </button>
      </div>

      <div className="mb-5 rounded-3xl border border-border bg-surface p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t.admin_promo_codes}</h2>
          <button
            type="button"
            onClick={() => setPromoModal({})}
            className="rounded-full bg-brand-pink px-4 py-2 text-xs font-semibold text-white"
          >
            {t.admin_add_code}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-foreground-soft">
                <th className="border-b border-border pb-2 font-medium">{t.admin_code}</th>
                <th className="border-b border-border pb-2 font-medium">{t.admin_discount}</th>
                <th className="border-b border-border pb-2 font-medium">{t.admin_status}</th>
                <th className="border-b border-border pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo.code}>
                  <td className="border-b border-border py-2.5 font-semibold">{promo.code}</td>
                  <td className="border-b border-border py-2.5 tabular-nums">
                    {promo.type === "percent" ? `${promo.value}%` : money(promo.value)}
                  </td>
                  <td className="border-b border-border py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        promo.active
                          ? "bg-brand-ok/20 text-brand-ok"
                          : "bg-foreground-soft/15 text-foreground-soft"
                      }`}
                    >
                      {promo.active ? t.admin_active : t.admin_inactive}
                    </span>
                  </td>
                  <td className="border-b border-border py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setPromoModal({ promo })}
                      className="mr-3 text-xs underline text-foreground-soft"
                    >
                      {t.admin_edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(promo)}
                      className="text-xs underline text-brand-danger"
                    >
                      {t.admin_delete}
                    </button>
                  </td>
                </tr>
              ))}
              {promoCodes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-xs text-foreground-soft">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5">
        <h2 className="mb-3.5 text-sm font-semibold text-foreground">{t.admin_settings}</h2>
        <StoreRulesForm />
      </div>

      {productModal && (
        <ProductFormModal
          category={productModal.category}
          product={productModal.product}
          onClose={() => setProductModal(null)}
        />
      )}
      {promoModal && <PromoFormModal promo={promoModal.promo} onClose={() => setPromoModal(null)} />}
    </div>
  );
}

function ProductSection({
  title,
  products,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  category: "menu" | "catering";
  products: Product[];
  t: ReturnType<typeof useLocale>["t"];
  onAdd: () => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div className="mb-5 rounded-3xl border border-border bg-surface p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full bg-brand-pink px-4 py-2 text-xs font-semibold text-white"
        >
          {t.admin_add_item}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-foreground-soft">
              <th className="border-b border-border pb-2 font-medium">{t.admin_item}</th>
              <th className="border-b border-border pb-2 font-medium">{t.admin_price}</th>
              <th className="border-b border-border pb-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="border-b border-border py-2.5">{product.name}</td>
                <td className="border-b border-border py-2.5 tabular-nums">{money(product.price)}</td>
                <td className="border-b border-border py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="mr-3 text-xs underline text-foreground-soft"
                  >
                    {t.admin_edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="text-xs underline text-brand-danger"
                  >
                    {t.admin_delete}
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-xs text-foreground-soft">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatTile({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wide text-foreground-soft">{label}</div>
      <div className={`mt-0.5 font-script text-brand-pink-deep ${small ? "text-xl" : "text-3xl"}`}>
        {value}
      </div>
    </div>
  );
}
