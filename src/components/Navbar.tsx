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
  const [isAdmin, setIsAdmin] = useState(false);

  const cartContext = useCart() as any;
  const cartItems = cartContext.cartItems || cartContext.cart || cartContext.items || [];
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // 🔐 Fetch role helper
  const checkAdminRole = async (uid: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .maybeSingle();

    setIsAdmin(profile?.role === "admin");
  };

  // 🔄 Auth state
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) await checkAdminRole(currentUser.id);
      else setIsAdmin(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) await checkAdminRole(currentUser.id);
        else setIsAdmin(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAccountOpen(false);
    setIsOpen(false);
    router.push("/login");
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full bg-[#0B0B0B] shadow-md px-6 md:px-8 py-5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center w-full">

        {/* LOGO */}
        <Link href="/" onClick={closeMenu} className="text-2xl font-serif font-bold tracking-widest text-[#D4AF37] z-50">
          IVFODI
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex space-x-10 text-sm font-medium text-gray-300 items-center">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">HOME</Link>
          <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">SHOP</Link>
          <Link href="/bespoke" className="hover:text-[#D4AF37] transition-colors">BESPOKE</Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="text-[#D4AF37] font-bold hover:text-white transition-colors"
            >
              DASHBOARD
            </Link>
          )}

          <Link href="/cart" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2">
            CART
            {totalItems > 0 && (
              <span className="bg-[#D4AF37] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>

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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-6 w-56 bg-[#111111] border border-gray-800 shadow-2xl py-4 z-50 flex flex-col">
                  <p className="px-5 text-[10px] text-gray-500 tracking-widest uppercase mb-2">My Account</p>
                  <Link href="/account/orders" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs hover:text-[#D4AF37]">ORDER HISTORY</Link>
                  <Link href="/account/track" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs hover:text-[#D4AF37]">TRACK ORDER</Link>

                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs text-[#D4AF37] font-bold hover:text-white">
                      DASHBOARD
                    </Link>
                  )}

                  <div className="border-t border-gray-800 mt-2 pt-2">
                    <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-xs text-[#722F37] hover:text-red-400">
                      LOG OUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-6 md:hidden z-50">
          <Link href="/cart" onClick={closeMenu} className="relative text-gray-300 hover:text-[#D4AF37]">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-[#D4AF37]">
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#0B0B0B] border-t border-gray-800 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-screen border-b" : "max-h-0 border-transparent"}`}>
        <div className="flex flex-col px-6 py-8 space-y-6 text-sm tracking-widest text-gray-300 bg-[#111111]">
          <Link href="/" onClick={closeMenu}>HOME</Link>
          <Link href="/shop" onClick={closeMenu}>SHOP</Link>
          <Link href="/bespoke" onClick={closeMenu}>BESPOKE</Link>

          {isAdmin && (
            <Link href="/admin" onClick={closeMenu} className="text-[#D4AF37] font-bold">
              DASHBOARD
            </Link>
          )}

          {!user ? (
            <Link href="/login" onClick={closeMenu} className="text-[#D4AF37]">
              LOG IN / SIGN UP
            </Link>
          ) : (
            <>
              <Link href="/account/orders" onClick={closeMenu}>ORDER HISTORY</Link>
              <Link href="/account/track" onClick={closeMenu}>TRACK ORDER</Link>
              <button onClick={handleLogout} className="text-left text-[#722F37] pt-2">LOG OUT</button>
            </>
          )}

          <Link href="/bespoke" onClick={closeMenu} className="text-center bg-[#722F37] text-white py-4">
            BOOK A FITTING
          </Link>
        </div>
      </div>
    </nav>
  );
}