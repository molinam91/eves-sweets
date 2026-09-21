import type { Metadata } from "next";
import { Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { MenuProvider } from "@/context/MenuContext";
import { StoreConfigProvider } from "@/context/StoreConfigContext";
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
    "Homemade desserts made with love. Order your Eve's Sweets favorites for delivery or pickup.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-brand-bg">
        <LocaleProvider>
          <MenuProvider>
            <StoreConfigProvider>
              <CartProvider>
                {children}
                <ModalRoot />
              </CartProvider>
            </StoreConfigProvider>
          </MenuProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
