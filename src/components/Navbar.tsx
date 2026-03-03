"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/utils/supabase";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Safely grab the cart array
  const cartContext = useCart() as any;
  const cartItems = cartContext.cartItems || cartContext.cart || cartContext.items || [];
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // --- NEW: LISTEN FOR SUPABASE LOGIN/LOGOUT ---
  useEffect(() => {
    // 1. Check if they are already logged in when the page loads
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();

    // 2. Listen for any changes (like them logging in or clicking log out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAccountOpen(false);
    setIsOpen(false);
    router.push("/login"); // Send them back to login after signing out
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full bg-[#0B0B0B] shadow-md px-6 md:px-8 py-5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
        
        {/* LOGO */}
        <Link href="/" onClick={closeMenu} className="text-2xl font-serif font-bold tracking-widest text-[#D4AF37] z-50">
          IVFODI
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex space-x-10 text-sm font-medium text-gray-300 items-center">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">HOME</Link>
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">SHOP</Link>
          <Link href="/bespoke" className="hover:text-[#D4AF37] transition-colors">BESPOKE</Link>
          
          <Link href="/cart" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
            CART 
            {totalItems > 0 && (
              <span className="bg-[#D4AF37] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* --- DESKTOP AUTHENTICATION --- */}
          {!user ? (
            <Link href="/login" className="text-[#D4AF37] hover:text-white transition-colors tracking-widest">
              LOG IN
            </Link>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-2"
              >
                {/* User Profile Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>

              {/* Account Dropdown Menu */}
              {isAccountOpen && (
                <div className="absolute right-0 mt-6 w-56 bg-[#111111] border border-gray-800 shadow-2xl py-4 z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="px-5 text-[10px] text-gray-500 tracking-widest uppercase mb-2">My Account</p>
                  <Link href="/account/orders" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs tracking-widest text-gray-300 hover:text-[#D4AF37] hover:bg-[#1a1a1a] transition-colors">
                    ORDER HISTORY
                  </Link>
                  <Link href="/account/track" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs tracking-widest text-gray-300 hover:text-[#D4AF37] hover:bg-[#1a1a1a] transition-colors">
                    TRACK ORDER
                  </Link>
                  <div className="border-t border-gray-800 mt-2 pt-2">
                    <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-xs tracking-widest text-[#722F37] hover:text-red-400 hover:bg-[#1a1a1a] transition-colors">
                      LOG OUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DESKTOP CTA BUTTON */}
        <div className="hidden md:block">
          <Link 
            href="/bespoke" 
            className="bg-[#722F37] text-white px-6 py-2.5 text-sm tracking-wide hover:bg-[#5a252b] transition-colors border border-[#722F37] hover:border-[#D4AF37]"
          >
            Book a Fitting
          </Link>
        </div>

        {/* --- MOBILE NAVIGATION CONTROLS --- */}
        <div className="flex items-center gap-6 md:hidden z-50">
          <Link href="/cart" onClick={closeMenu} className="relative text-gray-300 hover:text-[#D4AF37] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-[#D4AF37] focus:outline-none">
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            )}
          </button>
        </div>

      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#0B0B0B] border-t border-gray-800 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-screen border-b" : "max-h-0 border-transparent"}`}>
        <div className="flex flex-col px-6 py-8 space-y-6 text-sm tracking-widest text-gray-300 bg-[#111111]">
          <Link href="/" onClick={closeMenu} className="hover:text-[#D4AF37] transition-colors border-b border-gray-800 pb-4">HOME</Link>
          <Link href="/shop" onClick={closeMenu} className="hover:text-[#D4AF37] transition-colors border-b border-gray-800 pb-4">SHOP</Link>
          <Link href="/bespoke" onClick={closeMenu} className="hover:text-[#D4AF37] transition-colors border-b border-gray-800 pb-4">BESPOKE</Link>
          
          {/* --- MOBILE AUTHENTICATION --- */}
          {!user ? (
            <Link href="/login" onClick={closeMenu} className="text-[#D4AF37] hover:text-white transition-colors border-b border-gray-800 pb-4">
              LOG IN / SIGN UP
            </Link>
          ) : (
            <div className="flex flex-col space-y-4 border-b border-gray-800 pb-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">My Account</p>
              <Link href="/account/orders" onClick={closeMenu} className="hover:text-[#D4AF37] transition-colors">ORDER HISTORY</Link>
              <Link href="/account/track" onClick={closeMenu} className="hover:text-[#D4AF37] transition-colors">TRACK ORDER</Link>
              <button onClick={handleLogout} className="text-left text-[#722F37] hover:text-red-400 transition-colors pt-2">LOG OUT</button>
            </div>
          )}

          <Link href="/bespoke" onClick={closeMenu} className="text-center bg-[#722F37] text-white py-4 mt-4 tracking-widest hover:bg-[#5a252b] transition-colors border border-transparent hover:border-[#D4AF37]">
            BOOK A FITTING
          </Link>
        </div>
      </div>

    </nav>
  );
}