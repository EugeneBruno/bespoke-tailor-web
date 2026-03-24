import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ivfodi.com"), // change to your real domain

  title: {
    default: "IVFODI | Luxury Bespoke Fashion",
    template: "%s | IVFODI",
  },

  description:
    "Luxury Nigerian bespoke fashion brand creating timeless, elegant pieces tailored for confident women.",

  keywords: [
    "IVFODI",
    "Nigerian fashion",
    "bespoke fashion",
    "luxury clothing",
    "tailor made dresses",
    "custom fashion Nigeria",
  ],

  alternates: {
    canonical: "https://ivfodi.com", // change to your real domain
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  openGraph: {
    title: "IVFODI | Luxury Bespoke Fashion",
    description:
      "Timeless bespoke fashion crafted with elegance and precision.",
    url: "https://ivfodi.com", // change to your real domain
    siteName: "IVFODI",
    images: [
      {
        url: "/og-image.jpg", // put image in public folder
        width: 1200,
        height: 630,
        alt: "IVFODI Fashion",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "IVFODI | Luxury Bespoke Fashion",
    description:
      "Luxury Nigerian bespoke fashion brand creating timeless elegance.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
