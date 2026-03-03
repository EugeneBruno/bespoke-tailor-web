"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "messages">("products");
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  // --- CLOUDINARY CONFIGURATION ---
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
  const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Notice we removed "image" from formData. We will handle files separately!
  const [formData, setFormData] = useState({
    name: "", price: "", category: "Dresses", description: "", details: "",
  });

  // NEW: State to hold the actual image files before uploading
  const [imageFrontFile, setImageFrontFile] = useState<File | null>(null);
  const [imageBackFile, setImageBackFile] = useState<File | null>(null);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeReply, setActiveReply] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchMessages();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- CLOUDINARY UPLOAD HELPER FUNCTION ---
  const uploadImageToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) throw new Error("Failed to upload image to Cloudinary");
    const json = await response.json();
    return json.secure_url; // Returns the permanent URL!
  };

  // ---PRODUCT SUBMIT FUNCTION ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFrontFile || !imageBackFile) {
      setStatusMessage({ type: 'error', text: "Please select both a Front and Back image." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // 1. Upload both images to Cloudinary first
      const frontImageUrl = await uploadImageToCloudinary(imageFrontFile);
      const backImageUrl = await uploadImageToCloudinary(imageBackFile);

      // 2. Format the text details
      const detailsArray = formData.details.split(",").map((item) => item.trim()).filter((item) => item !== "");
      
      // 3. Save EVERYTHING to Supabase
      const { error } = await supabase.from("products").insert([{ 
        ...formData, 
        details: detailsArray,
        image: frontImageUrl,       // Saves to your original column
        image_back: backImageUrl    // Saves to your new column!
      }]);
      
      if (error) throw error;
      
      setStatusMessage({ type: 'success', text: "Product and images uploaded successfully!" });
      
      // Reset the form
      setFormData({ name: "", price: "", category: "Dresses", description: "", details: "" });
      setImageFrontFile(null);
      setImageBackFile(null);
      
      // Reset the file input fields visually
      (document.getElementById('frontImageInput') as HTMLInputElement).value = '';
      (document.getElementById('backImageInput') as HTMLInputElement).value = '';

    } catch (error: any) {
      setStatusMessage({ type: 'error', text: `Upload Failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdatingOrderId(id);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
      const currentOrder = orders.find(o => o.id === id);
      if (currentOrder) {
        try {
          await fetch('/api/status-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: currentOrder.customer_name,
              email: currentOrder.customer_email,
              orderId: currentOrder.id,
              status: newStatus
            })
          });
        } catch (emailError) {
          console.error("Failed to trigger status email", emailError);
        }
      }
    } else {
      alert("Failed to update status.");
    }
    setUpdatingOrderId(null);
  };

  const updateMessageStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("messages").update({ status: newStatus }).eq("id", id);
    if (!error) fetchMessages();
  };

  const sendReply = async () => {
    if (!replyText.trim() || !activeReply) return;
    setIsSendingReply(true);
    try {
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: activeReply.id, email: activeReply.email, subject: activeReply.subject,
          originalMessage: activeReply.message, originalDate: activeReply.created_at, replyText: replyText,
        }),
      });
      if (response.ok) {
        alert("Reply sent successfully!");
        setActiveReply(null); setReplyText(""); fetchMessages();
      } else {
        alert("Failed to send reply. Please try again.");
      }
    } catch (error) {
      console.error("Reply error:", error); alert("Network error.");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-16 px-8 md:px-24 relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-800 pb-6 gap-6">
          <div>
            <h1 className="text-4xl font-serif text-[#D4AF37] mb-6">Admin Control</h1>
            <div className="flex gap-4">
              <button onClick={() => setActiveTab("products")} className={`text-sm tracking-widest pb-2 border-b-2 transition-colors ${activeTab === "products" ? "border-[#D4AF37] text-white" : "border-transparent text-gray-500 hover:text-white"}`}>PRODUCTS</button>
              <button onClick={() => setActiveTab("orders")} className={`text-sm tracking-widest pb-2 border-b-2 transition-colors ${activeTab === "orders" ? "border-[#D4AF37] text-white" : "border-transparent text-gray-500 hover:text-white"}`}>ORDERS</button>
              <button onClick={() => setActiveTab("messages")} className={`text-sm tracking-widest pb-2 border-b-2 transition-colors ${activeTab === "messages" ? "border-[#D4AF37] text-white" : "border-transparent text-gray-500 hover:text-white"}`}>MESSAGES</button>
            </div>
          </div>
          <Link href="/shop" className="text-sm tracking-widest text-gray-500 hover:text-white transition-colors">
            VIEW LIVE SHOP ↗
          </Link>
        </div>

        {/* --- UPGRADED PRODUCTS TAB --- */}
        {activeTab === "products" && (
          <div className="max-w-4xl animate-in fade-in duration-500">
            {statusMessage && (
              <div className={`p-4 mb-8 border ${statusMessage.type === 'success' ? 'border-green-800 bg-green-900/20 text-green-400' : 'border-red-800 bg-red-900/20 text-red-400'}`}>
                {statusMessage.text}
              </div>
            )}
            <form onSubmit={handleProductSubmit} className="bg-[#111111] border border-gray-800 p-8 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-[#D4AF37] uppercase">Product Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleProductChange} className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-[#D4AF37] uppercase">Price *</label>
                  <input required type="text" name="price" value={formData.price} onChange={handleProductChange} placeholder="e.g. ₦150,000" className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-[#D4AF37] uppercase">Category *</label>
                <select name="category" value={formData.category} onChange={handleProductChange} className="bg-[#111111] border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none">
                  <option value="Dresses">Dresses</option>
                  <option value="Skirts">Skirts</option>
                  <option value="Bubu">Bubu</option>
                  <option value="Pants">Pants (Trousers)</option>
                  <option value="Tops & Jackets">Tops & Jackets</option>
                  <option value="Two Piece">Two Piece</option>
                  <option value="Kids" disabled>Kids (Coming Soon)</option>
                </select>
              </div>

              {/* NEW: DUAL FILE UPLOADS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0B0B0B] p-6 border border-gray-800">
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-[#D4AF37] uppercase">Upload Front Image *</label>
                  <input 
                    required 
                    type="file" 
                    id="frontImageInput"
                    accept="image/*" 
                    onChange={(e) => setImageFrontFile(e.target.files ? e.target.files[0] : null)} 
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:tracking-widest file:bg-[#D4AF37] file:text-black hover:file:bg-white transition-colors cursor-pointer" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-[#D4AF37] uppercase">Upload Back Image *</label>
                  <input 
                    required 
                    type="file" 
                    id="backImageInput"
                    accept="image/*" 
                    onChange={(e) => setImageBackFile(e.target.files ? e.target.files[0] : null)} 
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-bold file:tracking-widest file:bg-[#722F37] file:text-white hover:file:bg-[#5a252b] transition-colors cursor-pointer" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-[#D4AF37] uppercase">Description</label>
                <textarea name="description" value={formData.description} onChange={handleProductChange} rows={3} className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none resize-none"></textarea>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-[#D4AF37] uppercase">Product Details (Comma Separated)</label>
                <textarea name="details" value={formData.details} onChange={handleProductChange} rows={2} className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none resize-none"></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="mt-6 bg-[#D4AF37] text-black py-4 text-sm font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50">
                {isSubmitting ? "UPLOADING TO CLOUDINARY..." : "UPLOAD PRODUCT"}
              </button>

            </form>
          </div>
        )}

        {/* ... (Orders and Messages tabs remain exactly the same) ... */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in duration-500 overflow-x-auto">
            {orders.length === 0 ? (
              <p className="text-gray-500 tracking-widest text-sm uppercase">No orders yet.</p>
            ) : (
              <div className="bg-[#111111] border border-gray-800 shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-[#1a1a1a]">
                    <tr className="border-b border-gray-800 text-[10px] uppercase tracking-widest text-gray-500">
                      <th className="py-5 px-6 font-normal">Date / Ref</th>
                      <th className="py-5 px-6 font-normal">Customer Info</th>
                      <th className="py-5 px-6 font-normal">Order Details</th>
                      <th className="py-5 px-6 font-normal">Total Paid</th>
                      <th className="py-5 px-6 font-normal">Tracking Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.map((order) => {
                      const date = new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      });

                      return (
                        <tr key={order.id} className="hover:bg-[#151515] transition-colors">
                          <td className="py-5 px-6 align-top">
                            <p className="text-sm text-white mb-1">{date}</p>
                            <p className="text-[10px] text-gray-600 font-mono tracking-wider">
                              ID: {order.id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="py-5 px-6 align-top">
                            <p className="text-sm text-[#D4AF37] font-bold mb-1">{order.customer_name}</p>
                            <p className="text-xs text-gray-400">{order.customer_email}</p>
                          </td>
                          <td className="py-5 px-6 align-top">
                            <p className="text-xs text-white mb-2">{order.items?.length || 0} Items</p>
                            <div className="space-y-1">
                              {order.items?.map((item: any, idx: number) => (
                                <p key={idx} className="text-[10px] text-gray-500 tracking-widest uppercase line-clamp-1">
                                  {item.quantity}x {item.name} (Sz: {item.size})
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="py-5 px-6 align-top">
                            <p className="text-sm text-white font-medium">{order.total_amount}</p>
                          </td>
                          <td className="py-5 px-6 align-top">
                            <select
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`bg-transparent border p-3 text-xs tracking-widest uppercase font-bold focus:outline-none cursor-pointer transition-colors ${
                                updatingOrderId === order.id ? 'opacity-50 border-gray-600 text-gray-500' :
                                order.status?.toLowerCase().includes('pending') ? 'border-yellow-900/50 text-yellow-500 hover:border-yellow-500' :
                                order.status?.toLowerCase().includes('processing') ? 'border-orange-900/50 text-orange-500 hover:border-orange-500' :
                                order.status?.toLowerCase().includes('shipped') ? 'border-blue-900/50 text-blue-500 hover:border-blue-500' :
                                'border-green-900/50 text-green-500 hover:border-green-500'
                              }`}
                            >
                              <option value="Pending" className="bg-[#111] text-white">Pending</option>
                              <option value="Processing" className="bg-[#111] text-white">Processing</option>
                              <option value="Shipped" className="bg-[#111] text-white">Shipped</option>
                              <option value="Delivered" className="bg-[#111] text-white">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="animate-in fade-in duration-500 grid gap-6">
            {messages.length === 0 ? (
              <p className="text-gray-500 tracking-widest text-sm uppercase">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`p-6 border ${msg.status === 'Unread' ? 'border-[#D4AF37] bg-[#1a1710]' : 'border-gray-800 bg-[#111111]'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg text-white font-serif">{msg.subject}</h3>
                      <p className="text-sm text-gray-400">From: <span className="text-white">{msg.name}</span> ({msg.email})</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                    
                    <select 
                      value={msg.status} 
                      onChange={(e) => updateMessageStatus(msg.id, e.target.value)}
                      className="bg-transparent border border-gray-700 p-2 text-xs text-gray-300 focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option className="bg-[#111111]">Unread</option>
                      <option className="bg-[#111111]">Read</option>
                      <option className="bg-[#111111]">Replied</option>
                    </select>
                  </div>
                  
                  <div className="text-gray-300 text-sm whitespace-pre-wrap mb-6 bg-[#0B0B0B] p-4 border border-gray-800">
                    {msg.message}
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setActiveReply(msg)}
                      className="bg-transparent border border-gray-600 text-white px-6 py-2 text-xs tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                    >
                      WRITE REPLY
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {activeReply && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#111111] border border-gray-800 p-8 w-full max-w-2xl flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-serif text-[#D4AF37]">Reply to {activeReply.name}</h2>
                <p className="text-xs text-gray-500 mt-1">Re: {activeReply.subject}</p>
              </div>
              <button onClick={() => setActiveReply(null)} className="text-gray-500 hover:text-white transition-colors text-xl">✕</button>
            </div>
            <textarea 
              autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..." rows={8}
              className="bg-[#0B0B0B] border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none resize-none"
            ></textarea>
            <div className="flex justify-end gap-4">
              <button onClick={() => setActiveReply(null)} className="text-xs tracking-widest text-gray-400 hover:text-white transition-colors">CANCEL</button>
              <button onClick={sendReply} disabled={isSendingReply || !replyText.trim()} className="bg-[#D4AF37] text-black px-8 py-3 text-sm font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50">
                {isSendingReply ? "SENDING..." : "SEND REPLY"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}