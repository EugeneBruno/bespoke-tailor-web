"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/utils/supabase";

interface CartItemType {
  id: string;
  name: string;
  price: string;
  size: string;
  image: string;
  quantity: number;
}

export default function CartPage() {
  const cartContext = useCart() as any;
  const cart: CartItemType[] = cartContext.cart || cartContext.cartItems || cartContext.items || [];
  const removeFromCart = cartContext.removeFromCart;
  const updateQuantity = cartContext.updateQuantity;
  
  // NEW: Pull the clearCart function!
  const clearCart = cartContext.clearCart;

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States for the Success Screen
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  
  // NEW: Track if the user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "Lagos",
  });

  // NEW: Auto-fill the form if they are logged in!
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLoggedIn(true);
        const user = session.user;
        
        // Split the full name back into First and Last name
        const fullName = user.user_metadata?.full_name || "";
        const nameParts = fullName.split(" ");
        
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
        }));
      }
    };
    
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    return cart.reduce((total: number, item: CartItemType) => {
      const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
      return total + (numericPrice * item.quantity);
    }, 0);
  };

  const cartTotal = calculateTotal();

  

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);

    try {
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.reference,
          cart,
          formData,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Unable to verify payment.');
      }

      // 2. Trigger the automated Thank You email
      await fetch('/api/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.firstName,
          email: formData.email,
          reference: reference.reference,
          items: cart,
          total: `₦${cartTotal.toLocaleString()}`
        })
      });

      // 3. Display the gorgeous Success Screen
      setOrderRef(reference.reference);
      setIsSuccess(true);
      
      // NEW: Clear the cart now that they have bought the items!
      clearCart();
    } catch (error) {
      console.error("Payment verification error:", error);
      alert("Payment was received, but we couldn't verify your order automatically. Please contact support with your payment reference.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToPayment =  async (e: React.FormEvent) => {
    e.preventDefault();
    
    const PaystackPop = (await import('@paystack/inline-js')).default;

    const paystack = new PaystackPop();
    
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
      email: formData.email,
      amount: cartTotal * 100,
      reference: (new Date()).getTime().toString(),
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: `${formData.firstName} ${formData.lastName}` },
          { display_name: "Phone Number", variable_name: "phone_number", value: formData.phone }
        ]
      },
      onSuccess: (transaction: any) => {
        // Pass the transaction reference to your existing success function
        onSuccess(transaction);
      },
      onCancel: () => {
        alert("Payment cancelled. You can try again when you're ready.");
      }
    });
  };

  // --- VIEW 3: THE SUCCESS SCREEN ---
  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-gray-300 flex flex-col items-center justify-center px-6 py-20 animate-in fade-in zoom-in duration-700">
        <div className="bg-[#111111] border border-gray-800 p-8 md:p-16 max-w-2xl w-full text-center flex flex-col items-center shadow-2xl">
          
          <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-8 border border-[#D4AF37]">
            <span className="text-[#D4AF37] text-3xl">✓</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-4">Thank You.</h1>
          <p className="text-gray-400 text-lg mb-8">Your payment was successful and your order is confirmed.</p>
          
          <div className="bg-[#0B0B0B] border border-gray-800 p-6 w-full mb-10">
            <p className="text-xs tracking-widest text-gray-500 uppercase mb-2">Order Reference</p>
            <p className="text-xl text-white font-mono">{orderRef}</p>
            <p className="text-sm text-[#D4AF37] mt-4">A receipt has been sent to {formData.email}</p>
          </div>

          <div className="w-full border-t border-gray-800 pt-10">
            <h3 className="text-white text-lg mb-2">
              {!isLoggedIn ? "Want to track your order?" : "View Your Order Details"}
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              {!isLoggedIn 
                ? "Create an account using your checkout email to view real-time production and shipping updates." 
                : "You can track the live production and shipping status in your account dashboard."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/shop" className="w-full sm:w-auto bg-transparent border border-gray-600 text-white px-8 py-4 text-xs tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                RETURN TO SHOP
              </Link>
              
              {/* NEW: DYNAMIC SUCCESS BUTTONS */}
              {!isLoggedIn ? (
                <Link 
                  href={`/signup?name=${encodeURIComponent(formData.firstName + ' ' + formData.lastName)}&email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phone)}`} 
                  className="w-full sm:w-auto bg-[#D4AF37] text-black px-8 py-4 text-xs font-bold tracking-widest hover:bg-white transition-colors text-center"
                >
                  CREATE ACCOUNT
                </Link>
              ) : (
                <Link 
                  href="/account/orders" 
                  className="w-full sm:w-auto bg-[#D4AF37] text-black px-8 py-4 text-xs font-bold tracking-widest hover:bg-white transition-colors text-center"
                >
                  VIEW ORDER HISTORY
                </Link>
              )}
            </div>
          </div>

        </div>
      </main>
    );
  }

  // --- VIEW 1 & 2: EMPTY CART OR CHECKOUT FLOW ---
  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-gray-300 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-6">Your Cart is Empty</h1>
        <Link href="/shop" className="text-sm tracking-widest hover:text-white transition-colors border-b border-gray-600 pb-1">
          CONTINUE SHOPPING
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-12 border-b border-gray-800 pb-6">
          {isCheckingOut ? "Checkout" : "Shopping Cart"}
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          <div className="w-full lg:w-2/3">
            {!isCheckingOut ? (
              <div className="animate-in fade-in duration-500 space-y-8">
                {cart.map((item: CartItemType, index: number) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4 md:gap-6 border border-gray-800 p-3 md:p-4 bg-[#111111]">
                    <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex flex-col justify-between flex-grow py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-base md:text-lg font-serif text-white line-clamp-1 pr-2">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id, item.size)} className="text-gray-500 hover:text-red-500 text-sm tracking-widest transition-colors flex-shrink-0">✕</button>
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase mt-1">Size: {item.size}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center border border-gray-700 h-8">
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-[#1a1a1a] transition-colors disabled:opacity-50">-</button>
                          <span className="w-8 text-center text-xs text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-[#D4AF37] hover:bg-[#1a1a1a] transition-colors">+</button>
                        </div>
                        <p className="text-[#D4AF37] tracking-wider text-sm md:text-base">{item.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <form id="checkout-form" onSubmit={handleProceedToPayment} className="space-y-6 bg-[#111111] p-6 md:p-8 border border-gray-800">
                  <h2 className="text-xs md:text-sm tracking-widest text-[#D4AF37] uppercase mb-6">Delivery Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">First Name *</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Last Name *</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Phone Number *</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Delivery Address *</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">City / Area *</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">State *</label>
                      <select name="state" value={formData.state} onChange={handleChange} className="bg-[#111111] border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none">
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <div className="bg-[#111111] border border-gray-800 p-6 md:p-8 sticky top-24">
              <h2 className="text-xs md:text-sm tracking-widest text-white uppercase mb-6 border-b border-gray-800 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 border-b border-gray-800 pb-6">
                <div className="flex justify-between text-gray-400 text-xs md:text-sm">
                  <span>Subtotal</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs md:text-sm">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-white tracking-widest uppercase text-sm">Total</span>
                <span className="text-[#D4AF37] text-lg md:text-xl tracking-wider">₦{cartTotal.toLocaleString()}</span>
              </div>

              {!isCheckingOut ? (
                <button onClick={() => setIsCheckingOut(true)} className="w-full bg-[#D4AF37] text-black py-4 text-xs md:text-sm font-bold tracking-widest hover:bg-white transition-colors">
                  PROCEED TO CHECKOUT
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <button type="submit" form="checkout-form" disabled={isProcessing} className="w-full bg-[#722F37] text-white py-4 text-xs md:text-sm tracking-widest hover:bg-[#5a252b] transition-colors disabled:opacity-50">
                    {isProcessing ? "PROCESSING..." : "PAY SECURELY NOW"}
                  </button>
                  <button onClick={() => setIsCheckingOut(false)} type="button" className="w-full bg-transparent border border-gray-600 text-white py-4 text-xs md:text-sm tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                    BACK TO CART
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
