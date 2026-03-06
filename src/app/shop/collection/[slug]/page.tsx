"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

type CollectionProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: string;
};

const slugToCategory: Record<string, string> = {
  "all": "All",
  "dresses": "Dresses",
  "skirts": "Skirts",
  "bubu": "Bubu",
  "pants": "Pants",
  "tops-and-jackets": "Tops & Jackets",
  "two-piece": "Two Piece"
};

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: State to control how many products are visible (starts at 5)
  const [visibleCount, setVisibleCount] = useState(5);

  const categoryName = slugToCategory[slug] || "All";

  useEffect(() => {
    async function fetchCollection() {
      setIsLoading(true);
      
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      
      if (categoryName !== "All") {
        query = query.eq("category", categoryName);
      }

      const { data, error } = await query;

      if (error) console.error("Error fetching collection:", error);
      else if (data) setProducts(data);
      
      setIsLoading(false);
    }

    fetchCollection();
  }, [categoryName]);

  // NEW: Calculate which products to show and if we need the "View More" card
  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = products.length > visibleCount;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-16 md:py-20 px-4 md:px-12 lg:px-24 relative">
      
      <Link 
        href="/shop" 
        className="fixed bottom-8 right-6 md:bottom-12 md:right-12 z-50 bg-[#111111] text-white border border-gray-700 w-12 h-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 flex items-center justify-center group"
        title="Back to Shop"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
      </Link>

      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex flex-col items-center mb-12 md:mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-[10px] md:text-xs text-gray-500 tracking-[0.3em] mb-4 uppercase">
            Collection
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#D4AF37] tracking-wide">
            {categoryName}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-pulse text-[#D4AF37] tracking-widest text-sm uppercase flex items-center gap-3">
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
              Curating {categoryName}...
            </div>
          </div>
        ) : (
          /* UPDATED GRID: grid-cols-2 on mobile forces the images to be much smaller! */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
            {products.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-20 tracking-widest uppercase text-xs md:text-sm border border-gray-900 bg-[#0f0f0f]">
                No items in the {categoryName} collection currently.
              </div>
            ) : (
              <>
                {displayedProducts.map((product) => (
                  // UPDATED: Wrapped the entire card in a <Link> so it's fully clickable
                  <Link href={`/shop/${product.id}`} key={product.id} className="group cursor-pointer flex flex-col animate-in fade-in duration-700">
                    
                    <div className="relative overflow-hidden aspect-[2/3] mb-3 md:mb-5 bg-[#111]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Desktop hover button (Hidden on mobile since they just tap the image) */}
                      <div className="hidden md:flex absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out justify-center">
                        <button className="w-full bg-white/90 backdrop-blur-sm text-black py-3 text-xs font-bold tracking-widest hover:bg-[#D4AF37] transition-colors">
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>

                    {/* Adjusted text sizing for the smaller mobile columns */}
                    <div className="flex flex-col items-center text-center px-1">
                      <p className="text-[8px] md:text-[10px] text-gray-500 tracking-[0.2em] mb-1 uppercase">
                        {product.category}
                      </p>
                      <h3 className="text-sm md:text-base font-serif text-gray-200 group-hover:text-[#D4AF37] transition-colors mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-xs md:text-sm text-[#D4AF37] tracking-wider">
                        {product.price}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* NEW: THE 6TH "VIEW MORE" CARD */}
                {hasMore && (
                  <div 
                    onClick={() => setVisibleCount(prev => prev + 5)}
                    className="group cursor-pointer flex flex-col animate-in fade-in duration-700"
                  >
                    <div className="relative overflow-hidden aspect-[2/3] mb-3 md:mb-5 bg-[#111111] border border-gray-800 hover:border-[#D4AF37] transition-colors flex flex-col items-center justify-center">
                       <span className="text-[#D4AF37] text-2xl md:text-3xl font-light mb-2 group-hover:scale-110 transition-transform">+</span>
                       <span className="text-[#D4AF37] text-[10px] md:text-xs tracking-widest uppercase group-hover:text-white transition-colors">View More</span>
                    </div>
                    
                    {/* Invisible text block to keep the grid perfectly aligned with the real products */}
                    <div className="flex flex-col items-center text-center opacity-0 px-1">
                      <p className="text-[8px] md:text-[10px] mb-1">Category</p>
                      <h3 className="text-sm md:text-base mb-1">Name</h3>
                      <span className="text-xs md:text-sm">Price</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}