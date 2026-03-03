"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Call Supabase to log the user in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      // If successful, instantly redirect them to the shop
      router.push("/shop"); 
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-gray-300 flex items-center justify-center px-6 py-20">
      
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-serif text-[#D4AF37] tracking-widest inline-block mb-8">
            IVFODI
          </Link>
          <h1 className="text-2xl md:text-3xl font-serif text-white mb-3">Welcome Back</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            Sign in to access your account
          </p>
        </div>

        <div className="bg-[#111111] border border-gray-800 p-8 md:p-10 shadow-2xl">
          
          {errorMsg && (
            <div className="mb-6 p-4 border border-red-900 bg-red-900/20 text-red-400 text-xs tracking-widest uppercase text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Email Address</label>
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] md:text-xs tracking-widest text-gray-400 uppercase">Password</label>
                {/* We can wire up a forgot password page later if needed! */}
                <Link href="#" className="text-[10px] text-gray-500 hover:text-[#D4AF37] transition-colors">
                  Forgot?
                </Link>
              </div>
              <input 
                required 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                className="bg-transparent border border-gray-700 p-3 md:p-4 text-white focus:border-[#D4AF37] focus:outline-none transition-colors" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#D4AF37] text-black py-4 mt-4 text-xs md:text-sm font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50"
            >
              {isLoading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500 tracking-widest">
              Don't have an account? <br/>
              <Link href="/signup" className="text-[#D4AF37] hover:text-white transition-colors mt-2 inline-block pb-1 border-b border-[#D4AF37] hover:border-white">
                CREATE ACCOUNT HERE
              </Link>
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}