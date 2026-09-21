import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import DeliveryBanner from "@/components/DeliveryBanner";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { CATERING, MENU } from "@/lib/mockData";

export default function Home() {
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
              <h2 className="font-script text-4xl text-brand-pink-deep">Nuestro menu</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-soft">
                Toca un postre para elegir cantidad y extras.
              </p>
            </div>
            <ProductGrid products={MENU} />
          </div>
        </section>

        <section id="catering" className="bg-surface-2 px-5 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 text-center">
              <h2 className="font-script text-4xl text-brand-pink-deep">Catering &amp; Eventos</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-soft">
                Paquetes para bodas, cumpleanos y reuniones. Indica la fecha de tu evento al pedir.
              </p>
            </div>
            <ProductGrid products={CATERING} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
