"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer
      id="contacto"
      className="mt-auto bg-gradient-to-br from-brand-pink-deep to-brand-pink-dark px-5 py-9 text-center text-white"
    >
      <p className="font-script text-2xl">Eve&apos;s Sweets</p>
      <p className="mt-2 text-xs text-white/80">{t.footer_tagline}</p>
      <p className="mt-4 text-[11px] text-white/60">
        &copy; {new Date().getFullYear()} Eve&apos;s Sweets — Desserts and More
      </p>
      <Link
        href="/admin"
        className="mt-5 inline-block text-[11px] text-white/60 underline underline-offset-2 hover:text-white"
      >
        {t.footer_admin}
      </Link>
    </footer>
  );
}
