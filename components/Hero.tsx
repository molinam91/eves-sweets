"use client";

import { useLocale } from "@/context/LocaleContext";

export default function Hero() {
  const { t } = useLocale();

  return (
    <section className="mx-auto max-w-5xl px-5 pt-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold-dark">
        {t.eyebrow}
      </p>
      <h1 className="mt-2 font-script text-5xl text-brand-pink-dark sm:text-6xl">
        Eve&apos;s Sweets
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-foreground/70 sm:text-base">
        {t.hero_tagline}
      </p>
    </section>
  );
}
