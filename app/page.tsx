"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import DeliveryBanner from "@/components/DeliveryBanner";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { useLocale } from "@/context/LocaleContext";
import { useMenu } from "@/context/MenuContext";

export default function Home() {
  const { menu, catering } = useMenu();
  const { t } = useLocale();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />

        <div className="mx-auto max-w-5xl px-5">
          <Carousel />
          <DeliveryBanner />
        </div>

        <section id="menu" className="px-5 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 text-center">
              <h2 className="font-script text-4xl text-brand-pink-deep">{t.menu_title}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-soft">
                {t.menu_subtitle}
              </p>
            </div>
            <ProductGrid products={menu} />
          </div>
        </section>

        <section id="catering" className="bg-surface-2 px-5 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 text-center">
              <h2 className="font-script text-4xl text-brand-pink-deep">{t.catering_title}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-soft">
                {t.catering_subtitle}
              </p>
            </div>
            <ProductGrid products={catering} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
