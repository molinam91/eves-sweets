"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useStoreConfig } from "@/context/StoreConfigContext";

export default function Footer() {
  const { t } = useLocale();
  const { rules } = useStoreConfig();
  const socialLinks = [
    { label: "TikTok", url: rules.socialTiktok },
    { label: "Instagram", url: rules.socialInstagram },
    { label: "Facebook", url: rules.socialFacebook },
  ].filter((s) => s.url);

  return (
    <footer
      id="contacto"
      className="mt-auto bg-gradient-to-br from-brand-pink-deep to-brand-pink-dark px-5 py-9 text-center text-white"
    >
      <p className="font-script text-2xl">Eve&apos;s Sweets</p>
      <p className="mt-2 text-xs text-white/80">{t.footer_tagline}</p>

      {socialLinks.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/30 px-3.5 py-1.5 text-xs text-white/90 hover:bg-white/10"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}

      {(rules.contactEmail || rules.contactPhones.length > 0) && (
        <div className="mt-3 flex flex-col items-center gap-1 text-xs text-white/80">
          {rules.contactEmail && (
            <a href={`mailto:${rules.contactEmail}`} className="underline underline-offset-2 hover:text-white">
              {rules.contactEmail}
            </a>
          )}
          {rules.contactPhones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="underline underline-offset-2 hover:text-white"
            >
              {phone}
            </a>
          ))}
        </div>
      )}

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
