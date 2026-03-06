"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const heroImages = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop",
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-[#A9A9A9]">
      <section className="mx-auto grid min-h-[88vh] w-full max-w-[1400px] grid-cols-1 items-center gap-14 px-6 py-16 sm:px-10 md:gap-16 md:px-14 lg:grid-cols-2 lg:px-20 lg:py-24">
        <div className="order-2 flex flex-col gap-8 lg:order-1">
          <p className="luxury-label text-[11px] text-[#7F7B70]">COUTURE ATELIER · SPRING CHAPTER</p>
          <h1 className="font-luxury text-5xl leading-[0.95] text-[#E2C979] sm:text-6xl md:text-7xl">
            Silhouettes
            <br />
            in Quiet Gold.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[#9A9A9A] md:text-lg">
            A study in precision tailoring and modern romance. Discover limited pieces shaped for your movement,
            your ritual, your name.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="luxury-label inline-flex border border-[#D4AF37] bg-transparent px-8 py-4 text-xs text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black"
            >
              DISCOVER THE COLLECTION
            </Link>
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative h-[70vh] w-full max-w-[520px] overflow-hidden rounded-t-[260px] border border-[#2A2A2A] bg-[#111111]">
            {heroImages.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Editorial fashion ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="border-y border-[#1F1F1F] bg-[#0E0E0E] py-24">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 sm:px-10 md:gap-16 md:px-14 lg:grid-cols-2 lg:px-20">
          <div className="overflow-hidden border border-[#272727]">
            <img
              src="https://images.unsplash.com/photo-1464863979621-258859e62245?q=80&w=1200&auto=format&fit=crop"
              alt="Luxury portrait"
              className="h-[520px] w-full object-cover"
            />
          </div>

          <div className="space-y-8">
            <p className="luxury-label text-[11px] text-[#7F7B70]">BRAND PHILOSOPHY</p>
            <h2 className="font-luxury text-4xl leading-tight text-[#E2C979] sm:text-5xl">Crafted with Intention</h2>
            <p className="max-w-xl text-base leading-relaxed text-[#9A9A9A]">
              Every garment begins in conversation and ends in confidence. We merge timeless structure with expressive
              detail to create pieces that feel both cinematic and deeply personal.
            </p>

            <div className="space-y-6">
              {[
                "Made-to-measure precision",
                "Ethically sourced premium cloth",
                "Private styling consultation",
              ].map((item) => (
                <div key={item} className="flex items-start gap-4 border-t border-[#252525] pt-5">
                  <span className="mt-1 inline-block h-4 w-4 rounded-full border border-[#D4AF37]" />
                  <p className="text-sm tracking-wide text-[#BCBCBC]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 sm:px-10 md:gap-16 md:px-14 lg:grid-cols-2 lg:px-20">
          <div className="order-2 space-y-8 lg:order-1">
            <p className="luxury-label text-[11px] text-[#7F7B70]">THE ELEGANCE EDIT</p>
            <h2 className="font-luxury text-4xl leading-tight text-[#E2C979] sm:text-5xl">Poise in Every Detail</h2>
            <p className="text-base leading-relaxed text-[#9A9A9A]">
              Designed for evenings, ceremonies, and quiet power moments. Our couture process ensures each line,
              drape, and finish lands with effortless grace.
            </p>

            <ul className="space-y-3 text-sm tracking-wide text-[#B6B6B6]">
              <li>— Hand-finished seams and subtle structure</li>
              <li>— Signature palettes inspired by warm metallic tones</li>
              <li>— Seasonal drops with timeless longevity</li>
            </ul>

            <Link
              href="/bespoke"
              className="luxury-label inline-flex border border-[#D4AF37] px-8 py-4 text-xs text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black"
            >
              BOOK A BESPOKE CONSULTATION
            </Link>
          </div>

          <div className="order-1 overflow-hidden border border-[#272727] lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop"
              alt="Elegant lifestyle fashion"
              className="h-[540px] w-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
