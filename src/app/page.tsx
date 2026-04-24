"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";

const collectionImages = [
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515347619152-00b12cb92a3e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550614000-4b95d4edfaea?q=80&w=800&auto=format&fit=crop",
];

// export const metadata = {
//   title: "Home",
//   description: "Discover timeless bespoke fashion crafted with elegance.",
// };

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % collectionImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      {/* ADJUSTED: Changed mobile padding from px-8 to px-6 for more breathing room */}
      <section className="relative w-full min-h-[85vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-24 py-12 md:py-20">
         
         <div className="md:w-1/2 z-10 flex flex-col items-start gap-6 mt-6 md:mt-0 w-full">
           <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-[#D4AF37] leading-tight tracking-wide">
             The Art of <br /> Personalization.
           </h1>
           <p className="text-base md:text-lg text-gray-400 max-w-md leading-relaxed">
             Expertly crafted garments tailored to your unique measurements. Discover the luxurious side of modern fashion.
           </p>
           
           {/* ADJUSTED: Changed to flex-col on mobile so buttons stack full-width for easy tapping */}
           <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 mt-6">
             <Link 
               href="/shop"
               className="w-full sm:w-auto text-center bg-[#722F37] text-white px-8 py-4 text-sm tracking-widest hover:bg-[#5a252b] transition-all duration-300"
             >
               SHOP READY-TO-WEAR
             </Link>
             <Link 
               href="/bespoke"
               className="w-full sm:w-auto text-center border border-[#D4AF37] text-[#D4AF37] px-8 py-4 text-sm tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
             >
               BOOK BESPOKE
             </Link>
           </div>
         </div>

         {/* Right Side: Featured Image */}
         <div className="md:w-1/2 w-full flex justify-center md:justify-end mt-16 md:mt-0">
             <div className="relative w-full max-w-md h-[55vh] sm:h-[60vh] md:h-[75vh]">
               
               <div className="absolute inset-0 w-full h-full rounded-t-[150px] md:rounded-t-full overflow-hidden shadow-2xl border-b-4 border-[#D4AF37]">
                 {collectionImages.map((src, index) => (
                   <img
                     key={src}
                     src={src}
                     alt={`Luxury Fashion ${index + 1}`}
                     className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                       index === currentImageIndex ? "opacity-100" : "opacity-0"
                     }`}
                   />
                 ))}
               </div>

               {/* ADJUSTED: Changed bottom/left positioning to adapt to mobile screens */}
               <div className="absolute bottom-4 -left-2 sm:-left-6 md:bottom-8 md:-left-8 bg-[#111111] border border-[#D4AF37] p-3 md:p-4 text-center z-20 shadow-xl">
                 <p className="text-[#D4AF37] font-serif text-xl md:text-2xl">10+</p>
                 <p className="text-[10px] md:text-xs tracking-widest text-gray-400">YEARS EXP.</p>
               </div>
             </div>
         </div>
      </section>

      {/* 2. FEATURES STRIP */}
      {/* ADJUSTED: Made gap smaller on mobile, reduced text size slightly so it fits neatly */}
      <section className="w-full bg-[#111111] border-y border-gray-900 py-6 px-4 md:px-8 flex flex-wrap justify-center md:justify-around gap-4 md:gap-8 text-[10px] md:text-sm tracking-widest text-[#D4AF37]">
        <div className="flex items-center gap-2 md:gap-3"><span>✦</span> 100% FIT GUARANTEE</div>
        <div className="flex items-center gap-2 md:gap-3"><span>✦</span> PREMIUM FABRICS</div>
        <div className="flex items-center gap-2 md:gap-3"><span>✦</span> ON-TIME DELIVERY</div>
        <div className="flex items-center gap-2 md:gap-3"><span>✦</span> BESPOKE CONSULTATION</div>
      </section>

      {/* 3. THE COLLECTION GRID */}
      <section className="w-full py-20 md:py-24 px-6 md:px-24 bg-[#0B0B0B]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 md:mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-4">Our Collection</h2>
            <p className="text-gray-400 max-w-md text-sm md:text-base">Discover timeless designs crafted to elevate your wardrobe, available for immediate purchase and preorder</p>
          </div>
          <Link href="/shop" className="text-[#D4AF37] border-b border-[#D4AF37] pb-1 hover:text-white hover:border-white transition-colors tracking-widest text-xs md:text-sm">
            VIEW ALL PIECES ↗
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
          <div className="group cursor-pointer">
            <div className="overflow-hidden h-[400px] md:h-[450px] mb-6">
              <img src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" alt="Suit" />
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-serif text-white group-hover:text-[#D4AF37] transition-colors">The Royal Suit</h3>
              <span className="text-gray-400 text-sm md:text-base">{formatPrice(Number(150000))}</span>
            </div>
          </div>

          <div className="group cursor-pointer mt-0 md:mt-12">
            <div className="overflow-hidden h-[400px] md:h-[450px] mb-6">
              <img src="https://images.unsplash.com/photo-1550614000-4b95dd26cc63?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" alt="Dress" />
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-serif text-white group-hover:text-[#D4AF37] transition-colors">Wine Velvet Gown</h3>
              <span className="text-gray-400 text-sm md:text-base">{formatPrice(Number(120000))}</span>
            </div>
          </div>

          <div className="group cursor-pointer">
            <div className="overflow-hidden h-[400px] md:h-[450px] mb-6">
              <img src="https://images.unsplash.com/photo-1594938298596-70f56fb3cecb?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" alt="Traditional" />
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-serif text-white group-hover:text-[#D4AF37] transition-colors">Gold Accent Agbada</h3>
              <span className="text-gray-400 text-sm md:text-base">{formatPrice(Number(200000))}</span>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}