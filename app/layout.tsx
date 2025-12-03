import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HueHouse - Premium Art Store",
  description: "Discover exclusive, premium art pieces at HueHouse. Elevate your space with our curated collection of artistic paintings and gallery-quality works.",
  icons: {
    icon: "/logo.png",
  },
};

import { FacebookPixel } from "@/components/FacebookPixel";
import { Background3D } from "@/components/ui/Background3D";

import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckoutModal } from "@/components/CheckoutModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased relative`}
      >
        <CartProvider>
          <Background3D />
          <Navbar />
          <CheckoutModal />
          <Suspense fallback={null}>
            <FacebookPixel />
          </Suspense>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
