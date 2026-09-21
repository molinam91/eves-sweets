import type { Metadata } from "next";
import { Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ModalRoot from "@/components/ModalRoot";

const bodyFont = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const scriptFont = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Eve's Sweets — Desserts and More",
  description:
    "Postres caseros hechos con amor. Pide tus favoritos de Eve's Sweets para entrega o recoleccion.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bodyFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-brand-bg">
        <CartProvider>
          {children}
          <ModalRoot />
        </CartProvider>
      </body>
    </html>
  );
}
