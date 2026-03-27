import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toast } from "@/components/ui/Toast";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-head",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wook Wear | Handmade Pouches, Bags & Accessories by Meesh",
  description:
    "One-of-a-kind handmade pouches, bags, display mats, and accessories. Made with love by Meesh. Shop the latest drop at Wook Wear.",
  openGraph: {
    type: "website",
    title: "Wook Wear | Handmade Pouches, Bags & Accessories",
    description:
      "One-of-a-kind handmade pouches, bags, display mats & accessories by Meesh.",
    siteName: "Wook Wear",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wook Wear | Handmade by Meesh",
    description: "One-of-a-kind handmade pouches, bags & accessories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
