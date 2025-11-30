import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HueHouse",
  description: "Artistic paintings and gallery.",
};

import { FacebookPixel } from "@/components/FacebookPixel";
import { Background3D } from "@/components/ui/Background3D";

import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { CheckoutModal } from "@/components/CheckoutModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <CartProvider>
          <Background3D />
          <Navbar />
          <CheckoutModal />
          <Suspense fallback={null}>
            <FacebookPixel />
          </Suspense>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
