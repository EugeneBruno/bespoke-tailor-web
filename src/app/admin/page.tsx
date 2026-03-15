"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
              <button onClick={() => setActiveTab("products")}>PRODUCTS</button>
              <button onClick={() => setActiveTab("orders")}>ORDERS</button>
              <button onClick={() => setActiveTab("messages")}>MESSAGES</button>
            </div>
          </div>
          <Link href="/shop" className="text-sm tracking-widest text-gray-500 hover:text-white transition-colors">
            VIEW LIVE SHOP ↗
          </Link>
        </div>

        {activeTab === "products" && (
          <form onSubmit={handleProductSubmit} className="bg-[#111111] border border-gray-800 p-8 flex flex-col gap-6 max-w-4xl">
            {statusMessage && <p>{statusMessage.text}</p>}
            <input required type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product name" />
            <input required type="text" name="price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Price" />
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="Dresses">Dresses</option>
              <option value="Skirts">Skirts</option>
              <option value="Bubu">Bubu</option>
              <option value="Pants">Pants (Trousers)</option>
              <option value="Tops & Jackets">Tops & Jackets</option>
              <option value="Two Piece">Two Piece</option>
            </select>
            <textarea name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" />
            <textarea name="details" value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} placeholder="Details comma-separated" />
            <input
              required
              type="file"
              id="frontImageInput"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFrontFile(e.target.files ? e.target.files[0] : null)}
            />
            <input
              required
              type="file"
              id="backImageInput"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageBackFile(e.target.files ? e.target.files[0] : null)}
            />
            <button disabled={isSubmitting} className="bg-[#D4AF37] text-black p-3 font-bold">
              {isSubmitting ? "UPLOADING..." : "ADD PRODUCT"}
            </button>
          </form>
        )}

        {activeTab === "orders" && (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-800 p-4 flex justify-between items-center">
                <div>
                  <p>{order.customer_name}</p>
                  <p>{order.total_amount}</p>
                </div>
                <select
                  value={order.status}
                  disabled={updatingOrderId === order.id}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="border border-gray-800 p-4">
                <p>{msg.subject}</p>
                <p>{msg.email}</p>
                <p>{msg.message}</p>
                <div className="flex gap-2 mt-3">
                  <select value={msg.status} onChange={(e) => updateMessageStatus(msg.id, e.target.value)}>
                    <option value="Unread">Unread</option>
                    <option value="Read">Read</option>
                    <option value="Replied">Replied</option>
                  </select>
                  <button onClick={() => setActiveReply(msg)} className="border border-gray-700 px-3 py-1">WRITE REPLY</button>
                </div>
              </div>
            ))}
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
