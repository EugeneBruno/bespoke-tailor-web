import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { brandName, defaultKeywords, defaultOgImage, siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brandName} | Luxury Nigerian Bespoke Fashion`,
    template: `%s | ${brandName}`,
  },
  description:
    "Discover IVFODI Clothing, a luxury Nigerian fashion brand creating elegant ready-to-wear and bespoke pieces tailored for modern women.",
  keywords: defaultKeywords,
  openGraph: {
    title: `${brandName} | Luxury Nigerian Bespoke Fashion`,
    description:
      "Shop luxury ready-to-wear collections and request bespoke tailoring from one of Lagos' modern fashion houses.",
    siteName: brandName,
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${brandName} luxury fashion preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandName} | Luxury Nigerian Bespoke Fashion`,
    description:
      "Shop premium Nigerian ready-to-wear and bespoke outfits crafted for timeless elegance.",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
