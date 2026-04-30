"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";


export default function ShopClient() {
    const [data, setData] = useState([]);
    
    const categories = [
    { name: "All", slug: "all" },
    { name: "Dresses", slug: "dresses" },
    { name: "Skirts", slug: "skirts" },
    { name: "Bubu", slug: "bubu" },
    { name: "Pants", slug: "pants" },
    { name: "Tops & Jackets", slug: "tops-and-jackets" },
    { name: "Two Piece", slug: "two-piece" },
    { name: "Kids", slug: "kids" },
    ];

    const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchCategoryImages = async () => {
            const imagesMap: Record<string, string> = {};

            for (const cat of categories) {
            if (cat.slug === "all") continue;

            const { data } = await supabase
                .from("products")
                .select("image")
                .eq("category", cat.name) 
                .limit(1)
                .single();

            if (data?.image) {
                imagesMap[cat.slug] = data.image;
            }
            }

            setCategoryImages(imagesMap);
        };

        fetchCategoryImages();
    }, []);


    return (
        <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-20 px-4 md:px-12 lg:px-24 flex flex-col items-center justify-center">
        
        <div className="max-w-[1400px] w-full mx-auto">
            
            {/* Page Header */}
            <div className="flex flex-col items-center mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#D4AF37] mb-6 tracking-wide">
                Ready-to-Wear
            </h1>
            <h2 className="text-sm md:text-base tracking-[0.3em] text-white uppercase font-serif">
                Shop by Collection
            </h2>
            </div>

            {/* Circular Navigation (Fixed Scroll Bug) */}
            <div className="w-full overflow-x-auto pb-10 scroll-smooth [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            
            {/* Using w-max and mx-auto ensures it centers on big screens but scrolls perfectly on small ones without cutting off the left side */}
            <div className="w-max mx-auto flex gap-6 md:gap-10 px-4">
                
                {categories.map((cat) => (
                cat.name === "Kids" ? (
                    // Disabled button for Kids
                    <div key={cat.name} className="flex flex-col items-center opacity-30 cursor-not-allowed">
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden relative mb-5 border-2 border-transparent">
                        <img
                        src={categoryImages[cat.slug] || "/fallback.jpg"}
                        alt={cat.name}
                        className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                        <span className="text-white text-[10px] md:text-xs tracking-widest uppercase font-serif drop-shadow-lg">{cat.name}</span>
                        </div>
                    </div>
                    <span className="text-[10px] md:text-xs tracking-widest uppercase text-gray-500">{cat.name} <span className="text-[9px] lowercase">(Soon)</span></span>
                    </div>
                ) : (
                    // Active Link for other categories
                    <Link 
                    href={`/shop/collection/${cat.slug}`} 
                    key={cat.name}
                    className="flex flex-col items-center group cursor-pointer"
                    >
                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden relative mb-5 transition-all duration-500 border-2 border-transparent group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <img 
                        src={categoryImages[cat.slug] || "/fallback.jpg"} 
                        alt={cat.name} 
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-colors duration-500"></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                        <span className="text-white text-[10px] md:text-xs tracking-widest uppercase font-serif drop-shadow-lg group-hover:text-[#D4AF37] transition-colors">
                            {cat.name}
                        </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs tracking-widest uppercase text-gray-500 group-hover:text-[#D4AF37] transition-colors duration-300">
                        {cat.name}
                        </span>
                        <span className="text-xs text-transparent group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all duration-300">
                        →
                        </span>
                    </div>
                    </Link>
                )
                ))}
                
            </div>
            </div>

        </div>
        </main>
    );
}