"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { login, logout } from "@/lib/supabase/auth.action";

export default function RiderLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    const res = await login(email, password);

    if (res.success && res.data) {
      const userRole = (res.data as any).role;
      if (userRole === "delivery_partner") {
        toast.success("Welcome back! Active courier duty dashboard loaded.");
        router.push("/delivery-partner/orders");
      } else {
        toast.error("Access Denied: This account is not registered as a delivery partner.");
        await logout(); // force logout non-rider accounts
      }
    } else {
      toast.error(res.error || "Invalid credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex items-center justify-center p-4">
      {/* Decorative Aurora background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-amber-100/40 blur-3xl" />

      <div className="relative bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-[32px] shadow-2xl p-8 max-w-md w-full">
        <header className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-orange-600 mb-4 transition"
          >
            <ArrowLeft size={13} /> Back to Marketplace
          </Link>
          <div className="mx-auto w-14 h-14 mb-4 flex items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-500/25">
            <Truck size={28} />
          </div>
          <h1 className="text-2xl font-black text-stone-900 leading-none">Rider Portal Login</h1>
          <p className="text-xs text-stone-500 mt-2 font-semibold">Enter details to sign in for delivery courier duty.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-stone-500 uppercase">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Mail size={14} />
              </span>
              <input
                type="email"
                required
                placeholder="ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-stone-500 uppercase">Password</label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <Lock size={14} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 h-11 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Truck size={16} />
            )}
            {loading ? "Logging in..." : "Go Online & Start Duty"}
          </button>
        </form>

        <footer className="mt-6 text-center text-xs text-stone-500 font-medium">
          New delivery rider?{" "}
          <Link href="/delivery-partner/signup" className="text-orange-600 font-bold hover:underline">
            Create Rider Account
          </Link>
        </footer>
      </div>
    </div>
  );
}
