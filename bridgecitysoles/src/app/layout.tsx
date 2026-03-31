import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Toast } from "@/components/ui/Toast";
import { BackToTop } from "@/components/ui/BackToTop";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bridge City Soles | Portland's Premier Sneaker Destination",
    template: "%s | Bridge City Soles",
  },
  description:
    "Portland's premier destination for authentic sneakers and streetwear. Buy, sell, and trade rare kicks and everyday classics. 100% authenticated.",
  keywords: [
    "sneakers",
    "Portland",
    "resale",
    "streetwear",
    "Jordan",
    "Nike",
    "Yeezy",
    "authentic",
    "Bridge City Soles",
  ],
  openGraph: {
    title: "Bridge City Soles | Portland's Premier Sneaker Destination",
    description:
      "Authentic sneakers & streetwear. From rare finds to everyday heat.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bcs-black text-bcs-white font-[family-name:var(--font-inter)]">
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <Toast />
            <BackToTop />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
