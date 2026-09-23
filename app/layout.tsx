import type { Metadata } from "next";
import { Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { MenuProvider } from "@/context/MenuContext";
import { OrderProvider } from "@/context/OrderContext";
import { StoreConfigProvider } from "@/context/StoreConfigContext";
import ErrorBoundary from "@/components/ErrorBoundary";
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

const title = "Eve's Sweets — Desserts and More";
const description =
  "Homemade desserts made with love. Order your Eve's Sweets favorites for delivery or pickup.";

export const metadata: Metadata = {
  // Needed for og:image/twitter:image to resolve to an absolute URL -- without
  // this, link previews (iMessage, WhatsApp, etc) fall back to guessing an
  // image from the page itself, which is why Chocoflan's photo (the first
  // product image in the markup) was showing up instead of the logo.
  metadataBase: new URL("https://unrivaled-cascaron-acb7ff.netlify.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-brand-bg">
        <ErrorBoundary>
          <LocaleProvider>
            <MenuProvider>
              <StoreConfigProvider>
                <OrderProvider>
                  <CartProvider>
                    {children}
                    <ModalRoot />
                  </CartProvider>
                </OrderProvider>
              </StoreConfigProvider>
            </MenuProvider>
          </LocaleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
