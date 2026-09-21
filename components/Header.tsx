"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";

export default function Header() {
  const { cartCount, openCart } = useCart();
  const { locale, toggleLocale, t } = useLocale();

  const navLinks = [
    { label: t.nav_menu, href: "#menu" },
    { label: t.nav_catering, href: "#catering" },
    { label: t.nav_contact, href: "#contacto" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-brand-pink/20 bg-brand-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
        <a href="#" className="flex flex-shrink-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt="Eve's Sweets"
            width={44}
            height={44}
            priority
            className="h-11 w-11 rounded-full shadow-sm"
          />
          <span className="whitespace-nowrap font-script text-2xl leading-none text-brand-pink-dark">
            Eve&apos;s Sweets
          </span>
        </a>
        <nav className="hidden gap-1 text-sm font-medium text-foreground/80 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 transition-colors hover:bg-brand-bg hover:text-brand-pink-dark"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t.language}
            className="rounded-full border border-border px-2.5 py-2 text-xs font-semibold text-foreground-soft transition-colors hover:bg-brand-bg"
          >
            {locale === "en" ? "ES" : "EN"}
          </button>
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2 rounded-full bg-brand-pink px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-pink-dark"
          >
            {t.cart_button}
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-xs font-bold text-brand-pink-dark">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
