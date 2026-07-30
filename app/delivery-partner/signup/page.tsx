"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, Mail, Phone, Lock, User, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { registerDeliveryPartner } from "@/lib/delivery.auth.action";

export default function RiderSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password || !vehicleNumber || !bankAccountNo || !bankIfsc) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);
    const res = await registerDeliveryPartner({
      fullName,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      bankName,
      bankAccountNo,
      bankIfsc,
    });

    if (res.success) {
      toast.success("Rider account created! Log in with your password.");
      router.push("/delivery-partner/login");
    } else {
      toast.error(res.error || "Rider registration failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex items-center justify-center p-4">
      {/* Decorative Aurora background */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-amber-100/40 blur-3xl" />

      <div className="relative bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-[32px] shadow-2xl p-6 sm:p-8 max-w-lg w-full">
        <header className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-orange-600 mb-3 transition"
          >
            <ArrowLeft size={13} /> Back to Marketplace
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600 text-white">
              <Truck size={20} />
            </span>
            <div>
              <h1 className="text-xl font-black text-stone-900 leading-none">Register as Rider</h1>
              <p className="text-xs text-stone-500 mt-1.5 font-semibold">Join the Foodiffin logistics delivery team.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Personal Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">1. Personal Info</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section: Vehicle settings */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">2. Vehicle Info</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                >
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Electric Scooter">Electric Scooter</option>
                  <option value="Auto-rickshaw">Auto-rickshaw</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Vehicle Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section: Payout Bank records */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">3. Payout Details</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">Account No *</label>
                    <input
                      type="text"
                      required
                      placeholder="30123456789"
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="SBIN0001234"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl outline-none text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 bg-white transition"
                    />
                  </div>
                </div>
              </div>
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
            {loading ? "Registering Account..." : "Register & Start Earning"}
          </button>
        </form>

        <footer className="mt-6 text-center text-xs text-stone-500 font-medium">
          Already registered?{" "}
          <Link href="/delivery-partner/login" className="text-orange-600 font-bold hover:underline">
            Log In
          </Link>
        </footer>
      </div>
    </div>
  );
}
