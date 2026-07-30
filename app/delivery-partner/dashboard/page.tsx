"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  CheckCircle,
  Truck,
  ArrowRight,
  Shield,
  Loader2,
  Calendar,
} from "lucide-react";
import { getProfile } from "@/lib/profile.action";
import { getDeliveryPartnerHistory, getDeliveryPartnerActiveOrders } from "@/lib/delivery.action";

export default function DeliveryPartnerDashboard() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const profRes = await getProfile();
      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
      }

      const histRes = await getDeliveryPartnerHistory();
      if (histRes.success && histRes.data) {
        setDeliveryCount(histRes.data.length);
        const total = histRes.data.reduce((acc, order) => acc + (order.total_amount || 0), 0);
        setEarnings(total);
      }

      const actRes = await getDeliveryPartnerActiveOrders();
      if (actRes.success && actRes.data) {
        setActiveCount(actRes.data.length);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
          <p className="text-stone-500 font-medium">Opening logistics overview...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5 min-w-0 flex-1 max-w-4xl mx-auto">
      {/* Header */}
      <header className="portal-glass flex flex-col gap-4 rounded-[24px] border border-white/70 p-5 shadow-xl shadow-stone-900/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight sm:text-3xl">
            Welcome back, {profile?.full_name || "Courier"}!
          </h1>
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${profile?.is_online ? "bg-emerald-500" : "bg-stone-300"}`} />
            Duty Status: {profile?.is_online ? "Active & Online" : "Offline"}
          </p>
        </div>
        <Link
          href="/delivery-partner/orders"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 text-xs font-bold shadow-md shadow-orange-500/25 transition hover:-translate-y-0.5"
        >
          <Package size={14} /> Open Delivery Queue <ArrowRight size={13} />
        </Link>
      </header>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <TrendingUp size={22} />
          </span>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Wallet Balance</span>
            <p className="text-xl font-black text-stone-850 mt-0.5">₹{earnings}</p>
          </div>
        </article>

        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <CheckCircle size={22} />
          </span>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Delivered Orders</span>
            <p className="text-xl font-black text-stone-850 mt-0.5">{deliveryCount} tasks</p>
          </div>
        </article>

        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Truck size={22} />
          </span>
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">In-Transit Task</span>
            <p className="text-xl font-black text-stone-850 mt-0.5">{activeCount} orders</p>
          </div>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick configuration links */}
        <div className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Shield size={15} className="text-orange-600" /> Shift & Duty guidelines
            </h3>
            <p className="text-xs text-stone-500 leading-normal mb-4">
              Keep your status Online to receive incoming food boxes dispatching from standard home kitchens in your locality.
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Base Delivery Fare (up to 2km)</span>
                <span className="font-bold text-stone-900">₹30</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Per Kilometer Rate (after 2km)</span>
                <span className="font-bold text-stone-900">₹10/km</span>
              </div>
            </div>
          </div>

          <Link
            href="/delivery-partner/profile"
            className="w-full mt-3 h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition"
          >
            Manage Vehicle & Payout settings
          </Link>
        </div>

        {/* Action card */}
        <div className="portal-card rounded-[24px] border border-white bg-gradient-to-br from-stone-950 to-stone-900 p-5 text-white shadow-xl shadow-stone-950/20 flex flex-col justify-between">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-orange-400 mb-4">
              <Calendar size={18} />
            </span>
            <h3 className="text-base font-bold tracking-tight mb-1">Rider duty settlement</h3>
            <p className="text-xs leading-relaxed text-white/70 mb-5">
              Cash gathered from customers on COD orders must be submitted to the admin panel regularly. Weekly bank deposits are processed every Monday at 12:00 AM.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/80 leading-normal flex items-start gap-2">
            <span className="text-orange-400 font-bold shrink-0 mt-0.5">Note:</span>
            <span>Bank payouts require verified account settings. Confirm details in the Profile tab.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
