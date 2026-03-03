"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      // 1. Check if the user is actually logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If they aren't logged in, kick them back to the login page safely
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      // 2. Fetch all orders from Supabase that match this user's email
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false }); // Newest orders first

      if (!error && data) {
        setOrders(data);
      } else {
        console.error("Failed to fetch orders:", error);
      }
      
      setIsLoading(false);
    };

    fetchUserAndOrders();
  }, [router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] flex justify-center items-center">
        <div className="animate-pulse text-[#D4AF37] tracking-widest text-sm uppercase flex items-center gap-3">
          <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
          Loading your collection...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-16 md:py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-4">Order History</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            Logged in as: <span className="text-white ml-2">{userEmail}</span>
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#111111] border border-gray-800 p-12 text-center flex flex-col items-center">
            <p className="text-gray-400 text-lg mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop" className="bg-[#D4AF37] text-black px-8 py-4 text-xs font-bold tracking-widest hover:bg-white transition-colors">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {orders.map((order) => {
              // Format the date nicely (e.g., October 12, 2026)
              const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              });

              return (
                <div key={order.id} className="bg-[#111111] border border-gray-800 overflow-hidden shadow-xl">
                  {/* --- ORDER HEADER --- */}
                  <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                        <p className="text-sm text-white">{orderDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-sm text-[#D4AF37] font-bold">{order.total_amount}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                      <span className={`px-3 py-1 text-xs tracking-widest font-bold uppercase ${
                        order.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-900/50' : 
                        order.status === 'Completed' ? 'bg-green-900/30 text-green-500 border border-green-900/50' : 
                        'bg-blue-900/30 text-blue-500 border border-blue-900/50'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* --- ORDER ITEMS --- */}
                  <div className="p-4 md:p-6 divide-y divide-gray-800">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="py-4 first:pt-0 last:pb-0 flex gap-4 md:gap-6">
                        <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 border border-gray-800">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="text-base md:text-lg font-serif text-white mb-1">{item.name}</h3>
                          <p className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase mb-2">Size: {item.size}</p>
                          <p className="text-xs text-gray-500 tracking-widest uppercase">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}