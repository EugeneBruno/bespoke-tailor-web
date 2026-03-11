"use client";

import { useState } from "react";
import Link from "next/link";

export const metadata = {
  title: "Bespoke Services",
  description:
    "Book a fitting and get custom-made luxury fashion tailored to perfection.",
};

export default function BespokeForm() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Single state object to hold all form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    garmentType: "Evening Gown",
    targetDate: "",
    bust: "",
    waist: "",
    hips: "",
    shoulder: "",
    length: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    // Quick validation before leaving step 1
    if (step === 1 && (!formData.fullName || !formData.whatsapp || !formData.email)) {
      alert("Please fill out your Name, WhatsApp, and Email before proceeding.");
      return;
    }
    setStep((prev) => prev + 1);
  };
  
  const prevStep = () => setStep((prev) => prev - 1);

  // Manual submission handler
  const handleSubmit = async () => {
    try {
      // Send the data to our new Next.js API Route
      const response = await fetch('/api/bespoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert("There was an error submitting your request. Please try again.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Network error. Please check your connection.");
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-gray-300 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 border border-[#D4AF37] rounded-full flex items-center justify-center mb-8">
          <span className="text-[#D4AF37] text-3xl">✦</span>
        </div>
        <h1 className="text-4xl font-serif text-[#D4AF37] mb-4">Request Received</h1>
        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
          Thank you for trusting IVFODI with your vision. Our design team will review your measurements and contact you via WhatsApp within 24 hours to confirm the details.
        </p>
        <Link href="/" className="bg-[#722F37] text-white px-8 py-3 text-sm tracking-widest hover:bg-[#5a252b] transition-colors border border-transparent hover:border-[#D4AF37]">
          RETURN HOME
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 py-16 px-8 md:px-24">
      <div className="max-w-3xl mx-auto">
        
        {/* Header & Progress Indicator */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#D4AF37] mb-4">Book a Fitting</h1>
          <p className="text-gray-400">Step {step} of 3</p>
          <div className="w-full bg-gray-900 h-1 mt-6">
            <div 
              className="bg-[#D4AF37] h-1 transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Changed from <form> to <div> to prevent auto-submission bugs */}
        <div className="bg-[#111111] border border-gray-800 p-8 md:p-12">
          
          {/* STEP 1: The Vision */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif text-white mb-6 border-b border-gray-800 pb-4">1. The Vision</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">WhatsApp Number *</label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">Target Date</label>
                  <input type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors [color-scheme:dark]" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-gray-400 uppercase">Garment Type</label>
                <select name="garmentType" value={formData.garmentType} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors">
                  <option className="bg-[#111111]">Evening Gown</option>
                  <option className="bg-[#111111]">Traditional Wear (Agbada/Iro & Buba)</option>
                  <option className="bg-[#111111]">Two-Piece Suit</option>
                  <option className="bg-[#111111]">Casual / Day Dress</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: The Measurements */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif text-white mb-6 border-b border-gray-800 pb-4">2. Core Measurements</h2>
              <p className="text-xs text-[#D4AF37] tracking-widest mb-6">PLEASE PROVIDE ALL MEASUREMENTS IN INCHES.</p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">Bust / Chest</label>
                  <input type="number" name="bust" value={formData.bust} onChange={handleChange} placeholder="e.g. 34" className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">Waist</label>
                  <input type="number" name="waist" value={formData.waist} onChange={handleChange} placeholder="e.g. 28" className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">Hips</label>
                  <input type="number" name="hips" value={formData.hips} onChange={handleChange} placeholder="e.g. 40" className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-widest text-gray-400 uppercase">Shoulder to Shoulder</label>
                  <input type="number" name="shoulder" value={formData.shoulder} onChange={handleChange} placeholder="e.g. 16" className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-xs tracking-widest text-gray-400 uppercase">Desired Length (Shoulder to Hem)</label>
                <input type="number" name="length" value={formData.length} onChange={handleChange} placeholder="e.g. 60" className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif text-white mb-6 border-b border-gray-800 pb-4">3. Design Notes & Review</h2>
              
              <div className="flex flex-col gap-2 mb-8">
                <label className="text-xs tracking-widest text-gray-400 uppercase">Additional Notes or Design Changes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="e.g. I want the sleeves to be slightly puffed, and I will be providing my own fabric..." className="bg-transparent border border-gray-700 p-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"></textarea>
              </div>

              <div className="bg-[#0B0B0B] p-6 border border-gray-800">
                <h3 className="text-[#D4AF37] tracking-widest text-sm mb-4 uppercase">Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                  <p>Name: <span className="text-white">{formData.fullName}</span></p>
                  <p>Garment: <span className="text-white">{formData.garmentType}</span></p>
                  <p>Bust/Chest: <span className="text-white">{formData.bust || "—"}"</span></p>
                  <p>Waist: <span className="text-white">{formData.waist || "—"}"</span></p>
                  <p>Hip: <span className="text-white">{formData.hips || "—"}"</span></p>
                  <p>Shoulder: <span className="text-white">{formData.shoulder || "—"}"</span></p>
                  <p>Length: <span className="text-white">{formData.length || "—"}"</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-800 flex justify-between">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="text-sm tracking-widest text-gray-400 hover:text-[#D4AF37] transition-colors border-b border-transparent hover:border-[#D4AF37]">
                BACK
              </button>
            ) : (
              <div></div> 
            )}

            {step < 3 ? (
              <button type="button" onClick={nextStep} className="bg-[#D4AF37] text-black px-8 py-3 text-sm font-bold tracking-widest hover:bg-white transition-colors">
                NEXT STEP
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="bg-[#722F37] text-white px-8 py-3 text-sm tracking-widest hover:bg-[#5a252b] transition-colors border border-transparent hover:border-[#D4AF37]">
                SUBMIT REQUEST
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}