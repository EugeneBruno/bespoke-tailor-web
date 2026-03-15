"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/utils/supabase";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Slider States
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // NEW: Custom Toast Notification States
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);

  const categoryToSlug: Record<string, string> = {
    "Dresses": "dresses",
    "Skirts": "skirts",
    "Bubu": "bubu",
    "Pants": "pants",
    "Tops & Jackets": "tops-and-jackets",
    "Two Piece": "two-piece"
  };

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else if (data) {
        setProduct(data);
        setImages([data.image, data.image_back].filter(Boolean));
      }
      setIsLoading(false);
    }
    fetchProduct();
  }, [productId]);

  //5 Second Auto-Slide Timer that RESETS on manual interaction
  useEffect(() => {
    if (images.length <= 1) return;

    // By using setTimeout and adding currentIndex to the dependencies,
    // this timer completely restarts every time the image changes!
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [images.length, currentIndex]); // <-- currentIndex is the magic key here

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && images.length > 1) {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    } else if (distance < -50 && images.length > 1) {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // NEW: Replaced the ugly alert() with our beautiful custom Toast
  const showNotification = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hides after 3 seconds
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!selectedSize) {
      showNotification("Please select a size first!", "error");
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.image,
      quantity: quantity
    });
    
    showNotification(`${quantity}x ${product.name} (Size: ${selectedSize}) added to cart!`, "success");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-[#D4AF37] tracking-widest text-sm uppercase">
        Loading Details...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-gray-300 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-4">Product Not Found</h1>
        <Link href="/shop" className="text-sm tracking-widest hover:text-white transition-colors border-b border-gray-600 pb-1">
          RETURN TO SHOP
        </Link>
      </main>
    );
  }

  const sizeText = selectedSize ? ` in size ${selectedSize}` : "";
  const qtyText = quantity > 1 ? ` (${quantity} pieces)` : "";
  const whatsappMessage = encodeURIComponent(`Hello! I'm interested in buying the ${product.name} (${product.price})${sizeText}${qtyText}.`);

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-16 px-8 md:px-24 animate-in fade-in duration-700 relative">
      
      {/* NEW: THE CUSTOM POPUP NOTIFICATION (TOAST) */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-in-out ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-4 border shadow-2xl flex items-center gap-3 ${toastType === 'success' ? 'bg-[#1a1710] border-[#D4AF37] text-[#D4AF37]' : 'bg-red-950/90 border-red-500 text-red-200'}`}>
          <span className="text-lg">{toastType === 'success' ? '✓' : '✕'}</span>
          <p className="text-xs tracking-widest uppercase font-bold">{toastMessage}</p>
        </div>
      </div>

      <Link 
        href={`/shop/collection/${product ? categoryToSlug[product.category] ||'all' : 'all'}`} 
        className="fixed bottom-8 right-6 md:bottom-12 md:right-12 z-50 bg-[#111111] text-white border border-gray-700 w-12 h-12 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 flex items-center justify-center group"
        title="Back to Collection"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
      </Link>
      
      <div className="text-sm tracking-widest text-gray-500 mb-10">
        <Link href="/" className="hover:text-[#D4AF37]">HOME</Link> / 
        <Link href="/shop" className="hover:text-[#D4AF37]"> SHOP </Link> / 
        <span className="text-[#D4AF37]"> {product.name.toUpperCase()}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
        
        <div className="w-full md:w-1/2">
          <div 
            className="relative aspect-[3/4] w-full border border-gray-800 p-2 overflow-hidden group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-full overflow-hidden">
              {images.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`${product.name} - View ${index + 1}`} 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`} 
                />
              ))}

              {/* Slider Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                  {images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? "bg-[#D4AF37] w-6" : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* NEW: DESKTOP ARROW BUTTONS STORED! */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1)}
                    className="hidden md:flex absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-black/40 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#D4AF37] hover:text-black z-30"
                  >
                    ←
                  </button>
                  <button 
                    onClick={() => setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1)}
                    className="hidden md:flex absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-black/40 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#D4AF37] hover:text-black z-30"
                  >
                    →
                  </button>
                </>
              )}

            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col pt-4">
          <p className="text-[#D4AF37] tracking-widest text-sm mb-2 uppercase">{product.category}</p>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">{product.name}</h1>
          <p className="text-2xl text-gray-300 mb-8 tracking-wider">{product.price}</p>
          
          {product.description && (
            <p className="text-gray-400 leading-relaxed mb-8">{product.description}</p>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm tracking-widest text-white uppercase">Size</span>
            </div>
            <div className="flex gap-4">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border transition-colors flex items-center justify-center text-sm ${
                    selectedSize === size 
                      ? "border-[#D4AF37] text-[#D4AF37] bg-[#1a1a1a]" 
                      : "border-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && <p className="text-red-900 text-xs mt-2 tracking-widest">Please select a size</p>}
          </div>

          <div className="mb-8 flex items-center gap-6">
            <span className="text-sm tracking-widest text-white uppercase">Quantity</span>
            <div className="flex items-center border border-gray-700 h-12">
              <button onClick={decreaseQuantity} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-[#1a1a1a] transition-colors">-</button>
              <span className="w-12 text-center text-white">{quantity}</span>
              <button onClick={increaseQuantity} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-[#1a1a1a] transition-colors">+</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-12">
            <button onClick={handleAddToCart} className="w-full bg-[#722F37] text-white py-4 text-sm tracking-widest hover:bg-[#5a252b] transition-colors border border-transparent hover:border-[#D4AF37]">
              ADD TO CART
            </button>
            
            <a href={`https://wa.me/2340000000000?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="w-full bg-transparent text-white border border-gray-600 py-4 text-sm tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors text-center flex justify-center items-center gap-2">
              <span>✦</span> ORDER VIA WHATSAPP
            </a>
          </div>

          {product.details && product.details.length > 0 && (
            <div className="border-t border-gray-800 pt-8">
              <h3 className="text-sm tracking-widest text-white uppercase mb-4">The Details</h3>
              <ul className="space-y-2 text-gray-400 text-sm list-disc pl-4">
                {product.details.map((detail: string, index: number) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}