"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase";

// 1. We separate the form into its own component so it can safely read the URL
function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  
  const [formData, setFormData] = useState({
    fullName: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    phone: searchParams.get("phone") || "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName, 
          phone: formData.phone
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      // UPDATED: Because confirmation is off, they are instantly logged in!
      // Send them straight to the shop (or a future dashboard page)
      router.push("/shop"); 
    }
  };

  return (
    <div className="bg-[#111111] border border-gray-800 p-8 md:p-10 shadow-2xl">
      {errorMsg && (
        <div className="mb-6 p-4 border border-red-900 bg-red-900/20 text-red-400 text-xs tracking-widest uppercase text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Full Name</label>
          <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Email Address</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Phone Number</label>
          <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Create Password</label>
          <input required type="password" name="password" value={formData.password} onChange={handleChange} minLength={6} className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" />
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-[#D4AF37] text-black py-4 mt-4 text-xs md:text-sm font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50">
          {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-500 tracking-widest">
          Already have an account? <br/>
          <Link href="/login" className="text-[#D4AF37] hover:text-white transition-colors mt-2 inline-block pb-1 border-b border-[#D4AF37] hover:border-white">
            LOG IN HERE
          </Link>
        </p>
      </div>
    </div>
  );
}

// 3. We wrap the form in a Next.js Suspense boundary (Required for useSearchParams)
export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-serif text-[#D4AF37] tracking-widest inline-block mb-8">
            IVFODI
          </Link>
          <h1 className="text-2xl md:text-3xl font-serif text-white mb-3">Create an Account</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            Track orders and save your measurements
          </p>
        </div>
        
        {/* Next.js requires this Suspense boundary so the page doesn't break while loading URL params */}
        <Suspense fallback={<div className="text-center text-[#D4AF37] p-10 border border-gray-800 bg-[#111111]">Loading secure form...</div>}>
          <SignUpForm />
        </Suspense>

      </div>
    </main>
  );
}