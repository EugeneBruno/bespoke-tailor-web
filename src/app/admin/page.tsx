"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { formatPrice } from "@/lib/formatPrice";
import { supabase } from "@/utils/supabase";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AdminTab = "products" | "orders" | "messages";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | string;
  created_at: string;
};

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "Unread" | "Read" | "Replied" | string;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Dresses",
    description: "",
    details: "",
  });
  const [imageFrontFile, setImageFrontFile] = useState<File | null>(null);
  const [imageBackFile, setImageBackFile] = useState<File | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeReply, setActiveReply] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");

  const adminFetch = async (url: string, init: RequestInit = {}) => {
    if (!adminToken) throw new Error("Missing admin token.");

    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
        ...(init.headers || {}),
      },
    });

    return response;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        router.replace("/login");
        return;
      }

      setAdminToken(token);
      setIsAuthorized(true);
      setIsLoading(false);
    };

    bootstrap();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized || !adminToken) return;

    const fetchAdminData = async () => {
      const [ordersResponse, messagesResponse] = await Promise.all([
        adminFetch("/api/admin/orders"),
        adminFetch("/api/admin/messages"),
      ]);

      if (ordersResponse.ok) {
        const data = await ordersResponse.json();
        setOrders(data.data || []);
      }

      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        setMessages(data.data || []);
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

       setProducts(productsData || []);
      };

    fetchAdminData();
  }, [isAuthorized, adminToken]);

  const validateImageFile = (file: File | null) => {
    if (!file) return "Please select an image file.";
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, and WEBP files are allowed.";
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return "Image size must be 5MB or less.";
    }
    return null;
  };

  const uploadImageToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    const json = await response.json();
    return json.secure_url as string;
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const frontFileError = validateImageFile(imageFrontFile);
    const backFileError = validateImageFile(imageBackFile);

    if (frontFileError || backFileError) {
      setStatusMessage({ type: "error", text: frontFileError || backFileError || "Invalid file upload." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const frontImageUrl = await uploadImageToCloudinary(imageFrontFile as File);
      const backImageUrl = await uploadImageToCloudinary(imageBackFile as File);
      const detailsArray = formData.details.split(",").map((item) => item.trim()).filter(Boolean);

      const response = await adminFetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          details: detailsArray,
          image: frontImageUrl,
          image_back: backImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save product.");
      }

      setStatusMessage({ type: "success", text: "Product and images uploaded successfully!" });
      setFormData({ name: "", price: "", category: "Dresses", description: "", details: "" });
      setImageFrontFile(null);
      setImageBackFile(null);
      (document.getElementById("frontImageInput") as HTMLInputElement).value = "";
      (document.getElementById("backImageInput") as HTMLInputElement).value = "";
    } catch {
      setStatusMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    setUpdatingOrderId(id);

    const response = await adminFetch("/api/admin/orders", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });

    if (response.ok) {
      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
      const currentOrder = orders.find((o) => o.id === id);
      if (currentOrder) {
        await fetch("/api/status-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: currentOrder.customer_name,
            email: currentOrder.customer_email,
            orderId: currentOrder.id,
            status,
          }),
        });
      }
    }

    setUpdatingOrderId(null);
  };

  const updateMessageStatus = async (id: string, status: string) => {
    const response = await adminFetch("/api/admin/messages", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });

    if (response.ok) {
      setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, status } : message)));
    }
  };

  const sendReply = async () => {
    if (!activeReply || !replyText.trim()) return;

    const response = await fetch("/api/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: activeReply.id,
        email: activeReply.email,
        subject: activeReply.subject,
        replyText,
        originalDate: activeReply.created_at,
        originalMessage: activeReply.message,
      }),
    });

    if (response.ok) {
      await updateMessageStatus(activeReply.id, "Replied");
      setActiveReply(null);
      setReplyText("");
    }
  };

  if (isLoading) {
    return <main className="min-h-screen bg-[#0B0B0B] text-white p-10">Loading admin dashboard...</main>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-16 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif text-[#D4AF37] mb-6">Admin Control</h1>
            <div className="flex gap-4">
              {["products", "orders", "messages"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as AdminTab)}
                  className={`px-4 py-2 border text-sm tracking-widest transition-colors
                  ${
                    activeTab === tab
                      ? "border-[#D4AF37] text-[#D4AF37]"
                      : "border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <Link href="/shop" className="text-sm tracking-widest text-gray-500 hover:text-white transition-colors">
            VIEW LIVE SHOP ↗
          </Link>
        </div>

        {activeTab === "products" && (
          <div className="grid lg:grid-cols-2 gap-10">

            {/* PRODUCT FORM */}
            <form
              onSubmit={handleProductSubmit}
              className="bg-[#111111] border border-gray-800 p-8 flex flex-col gap-6"
            >
              <h2 className="text-xl text-[#D4AF37] font-serif">Add New Product</h2>

              {statusMessage && (
                <p className={statusMessage.type === "error" ? "text-red-400" : "text-green-400"}>
                  {statusMessage.text}
                </p>
              )}

              <input
                required
                type="text"
                placeholder="Product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#0B0B0B] border border-gray-700 p-3"
              />

              <input
                required
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-[#0B0B0B] border border-gray-700 p-3"
              />

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-[#0B0B0B] border border-gray-700 p-3"
              >
                <option>Dresses</option>
                <option>Skirts</option>
                <option>Bubu</option>
                <option>Pants</option>
                <option>Tops & Jackets</option>
                <option>Two Piece</option>
              </select>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#0B0B0B] border border-gray-700 p-3"
              />

              <textarea
                placeholder="Details comma separated"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="bg-[#0B0B0B] border border-gray-700 p-3"
              />

            <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Front Image</label>
                <input
                  required
                  type="file"
                  id="frontImageInput"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFrontFile(e.target.files?.[0] || null)}
                  className="bg-[#0B0B0B] border border-gray-700 p-3 file:bg-[#D4AF37] file:text-black file:border-0 file:px-3 file:py-1 file:mr-3"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Back Image</label>
                <input
                  required
                  type="file"
                  id="backImageInput"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageBackFile(e.target.files?.[0] || null)}
                  className="bg-[#0B0B0B] border border-gray-700 p-3 file:bg-[#D4AF37] file:text-black file:border-0 file:px-3 file:py-1 file:mr-3"
                />
              </div>          

              <button
                disabled={isSubmitting}
                className="bg-[#D4AF37] text-black p-3 font-bold"
              >
                {isSubmitting ? "UPLOADING..." : "ADD PRODUCT"}
              </button>
            </form>


            {/* PRODUCT LIST */}
            <div className="bg-[#111111] border border-gray-800 p-8">
              <h2 className="text-xl text-[#D4AF37] font-serif mb-6">Existing Products</h2>

              {products.length === 0 ? (
                <p className="text-gray-500">No products yet.</p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between border border-gray-800 p-4"
                    >
                      <div>
                        <p className="text-white">{product.name}</p>
                        <p className="text-gray-400">₦{product.price}</p>
                      </div>
                      <span className="text-gray-500 text-sm">{product.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="border border-gray-800 p-8 text-center text-gray-500">
                No orders yet.
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-gray-800 p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white">{order.customer_name}</p>
                    <p className="text-gray-400">{formatPrice(Number(order.total_amount?.toString().replace(/[^0-9]/g, "") || 0))}</p>
                  </div>

                  <select
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="bg-[#0B0B0B] border border-gray-700 p-2"
                  >
                    <option>Paid</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="border border-gray-800 p-8 text-center text-gray-500">
                No messages yet.
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="border border-gray-800 p-4">
                  <p className="text-white">{msg.subject}</p>
                  <p className="text-gray-400">{msg.email}</p>
                  <p className="mt-2">{msg.message}</p>

                  <div className="flex gap-2 mt-3">
                    <select
                      value={msg.status}
                      onChange={(e) => updateMessageStatus(msg.id, e.target.value)}
                      className="bg-[#0B0B0B] border border-gray-700 p-2"
                    >
                      <option>Unread</option>
                      <option>Read</option>
                      <option>Replied</option>
                    </select>

                    <button
                      onClick={() => setActiveReply(msg)}
                      className="border border-gray-700 px-3 py-1"
                    >
                      REPLY
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {activeReply && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-gray-800 p-8 w-full max-w-2xl flex flex-col gap-6">
            <textarea
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              rows={8}
              className="bg-[#0B0B0B] border border-gray-700 p-4 text-white"
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setActiveReply(null)}>CANCEL</button>
              <button onClick={sendReply} disabled={!replyText.trim()} className="bg-[#D4AF37] text-black px-8 py-3 text-sm font-bold tracking-widest">
                SEND REPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
