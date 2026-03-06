"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const cartContext = useCart() as {
    cartItems?: Array<{ quantity: number }>;
    cart?: Array<{ quantity: number }>;
    items?: Array<{ quantity: number }>;
  };
  const cartItems = cartContext.cartItems || cartContext.cart || cartContext.items || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const checkAdminRole = async (uid: string) => {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
    setIsAdmin(profile?.role === "admin");
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) await checkAdminRole(currentUser.id);
      else setIsAdmin(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) await checkAdminRole(currentUser.id);
      else setIsAdmin(false);
    });

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
    <nav className="sticky top-0 z-50 w-full border-b border-[#1F1F1F] bg-[#0B0B0B]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10 md:px-14 lg:px-20">
        <Link href="/" onClick={closeMenu} className="font-luxury text-2xl tracking-[0.24em] text-[#E2C979]">
          IVFODI
        </Link>

        <div className="hidden items-center gap-10 text-[11px] tracking-[0.22em] text-[#BABABA] md:flex">
          <Link href="/" className="transition-colors hover:text-[#D4AF37]">
            HOME
          </Link>
          <Link href="/shop" className="transition-colors hover:text-[#D4AF37]">
            SHOP
          </Link>
          <Link href="/bespoke" className="transition-colors hover:text-[#D4AF37]">
            BESPOKE
          </Link>

          {isAdmin && (
            <Link href="/admin" className="font-medium text-[#D4AF37] transition-colors hover:text-white">
              DASHBOARD
            </Link>
          )}

          <Link href="/cart" className="flex items-center gap-2 transition-colors hover:text-[#D4AF37]">
            CART
            {totalItems > 0 && (
              <span className="rounded-full border border-[#D4AF37] px-2 py-0.5 text-[10px] text-[#D4AF37]">
                {totalItems}
              </span>
            )}
          </Link>

          {!user ? (
            <Link href="/login" className="text-[#D4AF37] transition-colors hover:text-white">
              LOG IN
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center gap-2 text-[#BABABA] transition-colors hover:text-[#D4AF37]"
              >
                ACCOUNT
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-5 flex w-60 flex-col border border-[#2A2A2A] bg-[#101010] py-3 shadow-2xl">
                  <p className="px-5 py-2 text-[10px] tracking-[0.2em] text-[#7C7C7C]">MY ACCOUNT</p>
                  <Link href="/account/orders" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs text-[#BDBDBD] hover:text-[#D4AF37]">
                    ORDER HISTORY
                  </Link>
                  <Link href="/account/track" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs text-[#BDBDBD] hover:text-[#D4AF37]">
                    TRACK ORDER
                  </Link>

                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsAccountOpen(false)} className="px-5 py-3 text-xs font-medium text-[#D4AF37] hover:text-white">
                      DASHBOARD
                    </Link>
                  )}

                  <div className="mt-2 border-t border-[#242424] pt-2">
                    <button onClick={handleLogout} className="w-full px-5 py-3 text-left text-xs text-[#9C6C6C] hover:text-[#D4AF37]">
                      LOG OUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 md:hidden">
          <Link href="/cart" onClick={closeMenu} className="relative text-sm tracking-[0.2em] text-[#BABABA]">
            CART
            {totalItems > 0 && (
              <span className="absolute -right-4 -top-2 rounded-full border border-[#D4AF37] px-1.5 text-[10px] text-[#D4AF37]">
                {totalItems}
              </span>
            )}
          </Link>

          <button onClick={() => setIsOpen(!isOpen)} className="text-[#BABABA] transition-colors hover:text-[#D4AF37]">
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div
        className={`absolute left-0 top-full w-full overflow-hidden border-t border-[#1F1F1F] bg-[#0E0E0E] transition-all duration-300 md:hidden ${
          isOpen ? "max-h-screen border-b" : "max-h-0 border-transparent"
        }`}
      >
        <div className="flex flex-col space-y-6 px-6 py-8 text-xs tracking-[0.2em] text-[#BABABA]">
          <Link href="/" onClick={closeMenu}>
            HOME
          </Link>
          <Link href="/shop" onClick={closeMenu}>
            SHOP
          </Link>
          <Link href="/bespoke" onClick={closeMenu}>
            BESPOKE
          </Link>

          {isAdmin && (
            <Link href="/admin" onClick={closeMenu} className="text-[#D4AF37]">
              DASHBOARD
            </Link>
          )}

          {!user ? (
            <Link href="/login" onClick={closeMenu} className="text-[#D4AF37]">
              LOG IN / SIGN UP
            </Link>
          ) : (
            <>
              <Link href="/account/orders" onClick={closeMenu}>
                ORDER HISTORY
              </Link>
              <Link href="/account/track" onClick={closeMenu}>
                TRACK ORDER
              </Link>
              <button onClick={handleLogout} className="text-left text-[#9C6C6C]">
                LOG OUT
              </button>
            </>
          )}

          <Link
            href="/bespoke"
            onClick={closeMenu}
            className="inline-flex w-full justify-center border border-[#D4AF37] px-6 py-4 text-center text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black"
          >
            BOOK A FITTING
          </Link>
        </div>
      </div>
    </nav>
  );
}
