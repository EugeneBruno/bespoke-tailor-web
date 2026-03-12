"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";
import { supabase } from "@/utils/supabase";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      // 1. Authenticate user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Fetch their orders
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setOrders(data);
        setSelectedOrder(data[0]); // Automatically select their most recent order!
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [router]);

  // --- HELPER FUNCTION FOR THE TIMELINE ---
  // We map the database status to a numerical step
  const getStepNumber = (status: string) => {
    const s = status?.toLowerCase() || '';

    if (s.includes('pending') || s.includes('placed') || s.includes('paid')) return 1;
    if (s.includes('processing') || s.includes('production') || s.includes('tailoring')) return 2;
    if (s.includes('shipped') || s.includes('transit')) return 3;
    if (s.includes('completed') || s.includes('delivered')) return 4;
    
    return 1;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] flex justify-center items-center">
        <div className="animate-pulse text-[#D4AF37] tracking-widest text-sm uppercase flex items-center gap-3">
          <span className="w-2 h-2 bg-[#D4AF37] rounded-full"></span>
          Locating your orders...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-16 md:py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12 border-b border-gray-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-4">Track Order</h1>
            <p className="text-gray-400 text-sm tracking-widest uppercase">
              Monitor your garments in real-time
            </p>
          </div>
          
          {/* If they have multiple orders, let them choose which one to track */}
          {orders.length > 1 && (
            <div className="w-full md:w-auto">
              <label className="text-[10px] text-gray-500 tracking-widest uppercase mb-2 block">Select Order</label>
              <select 
                className="w-full md:w-64 bg-[#111111] border border-gray-700 text-white p-3 text-sm focus:border-[#D4AF37] focus:outline-none"
                onChange={(e) => setSelectedOrder(orders.find(o => o.id === e.target.value))}
                value={selectedOrder?.id}
              >
                {orders.map(order => {
                  const date = new Date(order.created_at).toLocaleDateString();
                  return <option key={order.id} value={order.id}>{date} - {formatPrice(Number(order.total_amount?.toString().replace(/[^0-9]/g, "") || 0))}</option>
                })}
              </select>
            </div>
          )}
        </div>

        {!selectedOrder ? (
          <div className="bg-[#111111] border border-gray-800 p-12 text-center flex flex-col items-center">
            <p className="text-gray-400 text-lg mb-6">You don't have any active orders to track.</p>
            <Link href="/shop" className="bg-[#D4AF37] text-black px-8 py-4 text-xs font-bold tracking-widest hover:bg-white transition-colors">
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="bg-[#111111] border border-gray-800 p-8 md:p-16 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="text-center mb-16">
              <p className="text-[#D4AF37] text-xl md:text-2xl font-serif mb-2">Order Status: <span className="text-white uppercase tracking-widest text-lg md:text-xl ml-2">{selectedOrder.status}</span></p>
              <p className="text-gray-500 text-xs tracking-widest uppercase">Estimated Delivery: 5 Working Days from placement</p>
            </div>

            {/* --- THE VISUAL TIMELINE --- */}
            <div className="relative max-w-2xl mx-auto">
              {/* Background Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 z-0"></div>
              
              {/* Active Golden Line (Grows based on status) */}
              <div 
                className="absolute top-1/2 left-0 h-1 bg-[#D4AF37] -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
                style={{ width: `${((getStepNumber(selectedOrder.status) - 1) / 3) * 100}%` }}
              ></div>

              <div className="relative z-10 flex justify-between">
                
                {/* STEP 1: PENDING */}
                <div className="flex flex-col items-center gap-4 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${getStepNumber(selectedOrder.status) >= 1 ? 'bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800'}`}>
                    {getStepNumber(selectedOrder.status) > 1 ? <span className="text-black text-sm">✓</span> : <span className="w-3 h-3 bg-black rounded-full"></span>}
                  </div>
                  <p className={`text-[10px] md:text-xs tracking-widest uppercase text-center ${getStepNumber(selectedOrder.status) >= 1 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>Order<br/>Placed</p>
                </div>

                {/* STEP 2: PROCESSING */}
                <div className="flex flex-col items-center gap-4 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${getStepNumber(selectedOrder.status) >= 2 ? 'bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800'}`}>
                    {getStepNumber(selectedOrder.status) > 2 ? <span className="text-black text-sm">✓</span> : getStepNumber(selectedOrder.status) === 2 ? <span className="w-3 h-3 bg-black rounded-full animate-pulse"></span> : null}
                  </div>
                  <p className={`text-[10px] md:text-xs tracking-widest uppercase text-center ${getStepNumber(selectedOrder.status) >= 2 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>In<br/>Production</p>
                </div>

                {/* STEP 3: SHIPPED */}
                <div className="flex flex-col items-center gap-4 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${getStepNumber(selectedOrder.status) >= 3 ? 'bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800'}`}>
                    {getStepNumber(selectedOrder.status) > 3 ? <span className="text-black text-sm">✓</span> : getStepNumber(selectedOrder.status) === 3 ? <span className="w-3 h-3 bg-black rounded-full animate-pulse"></span> : null}
                  </div>
                  <p className={`text-[10px] md:text-xs tracking-widest uppercase text-center ${getStepNumber(selectedOrder.status) >= 3 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>Shipped</p>
                </div>

                {/* STEP 4: COMPLETED */}
                <div className="flex flex-col items-center gap-4 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${getStepNumber(selectedOrder.status) >= 4 ? 'bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800'}`}>
                    {getStepNumber(selectedOrder.status) >= 4 && <span className="text-black text-sm">✓</span>}
                  </div>
                  <p className={`text-[10px] md:text-xs tracking-widest uppercase text-center ${getStepNumber(selectedOrder.status) >= 4 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>Delivered</p>
                </div>

              </div>
            </div>

            {/* --- ITEMS IN THIS ORDER SUMMARY --- */}
            <div className="mt-16 pt-8 border-t border-gray-800">
              <p className="text-[10px] text-gray-500 tracking-widest uppercase mb-6 text-center">Items in this shipment</p>
              <div className="flex flex-wrap justify-center gap-4">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 bg-[#1a1a1a] border border-gray-800 p-3 pr-6">
                    <img src={item.image} alt={item.name} className="w-12 h-16 object-cover object-top border border-gray-700" />
                    <div>
                      <p className="text-sm font-serif text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Qty: {item.quantity} | Size: {item.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}