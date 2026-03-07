"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert("There was an error sending your message. Please try again.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 border border-[#D4AF37] rounded-full flex items-center justify-center mb-8">
          <span className="text-[#D4AF37] text-3xl">✓</span>
        </div>
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-4">Message Sent</h1>
        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
          Thank you for reaching out. Our team will get back to you within 24-48 hours.
        </p>
        <Link href="/" className="bg-[#722F37] text-white px-8 py-3 text-sm tracking-widest hover:bg-[#5a252b] transition-colors border border-transparent hover:border-[#D4AF37]">
          RETURN HOME
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-20 px-8 md:px-24">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
        
        {/* Left Side: Contact Information */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <h1 className="text-5xl font-serif text-[#D4AF37] mb-8">Get in Touch.</h1>
          <p className="text-gray-400 leading-relaxed mb-12">
            Whether you have a question about our ready-to-wear pieces, need assistance with an order, or want to discuss a custom design, we are here to help.
          </p>

          <div className="space-y-10">
            <div>
              <h3 className="text-xs tracking-widest text-[#D4AF37] uppercase mb-2">Studio</h3>
              <p className="text-white">Lagos, Nigeria</p>
              <p className="text-gray-500 text-sm mt-1">(By appointment only)</p>
            </div>
            
            <div>
              <h3 className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3">Direct Contact</h3>
              <a href="tel:+2340000000000" className="block text-white hover:text-[#D4AF37] transition-colors mb-2 w-fit">+234 000 000 0000</a>
              <a href="mailto:contact@ivfodi.com" className="block text-white hover:text-[#D4AF37] transition-colors mb-6 w-fit">contact@ivfodi.com</a>
              
              {/* NEW: WhatsApp Button */}
              <a 
                href="https://wa.me/2349042979346?text=Hello!%20I%20have%20an%20inquiry%20from%20your%20website." 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-gray-600 px-6 py-3 text-sm tracking-widest text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors w-full md:w-auto"
              >
                <span>✦</span> MESSAGE ON WHATSAPP
              </a>
            </div>

            <div>
              <h3 className="text-xs tracking-widest text-[#D4AF37] uppercase mb-2">Working Hours</h3>
              <p className="text-white">Monday - Friday: 9am - 6pm</p>
              <p className="text-white mt-1">Saturday: 10am - 4pm</p>
            </div>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="w-full lg:w-2/3">
          <form onSubmit={handleSubmit} className="bg-[#111111] border border-gray-800 p-8 md:p-12 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-gray-400 uppercase">Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-gray-400 uppercase">Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest text-gray-400 uppercase">Subject *</label>
              <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-widest text-gray-400 uppercase">Message *</label>
              <textarea required name="message" value={formData.message} onChange={handleChange} rows={6} className="bg-transparent border border-gray-700 p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-4 bg-[#722F37] text-white py-4 text-sm tracking-widest hover:bg-[#5a252b] transition-colors border border-transparent hover:border-[#D4AF37] disabled:opacity-50"
            >
              {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
            </button>
            
          </form>
        </div>

      </div>
    </main>
  );
}