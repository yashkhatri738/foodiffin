"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Truck,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { getProfile } from "@/lib/profile.action";
import { getDeliveryPartnerHistory } from "@/lib/delivery.action";
import { updateRiderStatus, updateRiderProfileSettings } from "@/lib/delivery.auth.action";

export default function DeliveryPartnerProfile() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Statistics
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Vehicle settings inputs
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [vehicleNo, setVehicleNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const profRes = await getProfile();
    if (profRes.success && profRes.data) {
      const prof = profRes.data as any;
      setProfile(prof);
      setIsOnline(prof.is_online ?? true);
      setVehicleType(prof.vehicle_type || "Motorcycle");
      setVehicleNo(prof.vehicle_number || "");
      setBankName(prof.bank_name || "");
      setAccountNo(prof.bank_account_no || "");
      setBankIfsc(prof.bank_ifsc || "");
    }

    const histRes = await getDeliveryPartnerHistory();
    if (histRes.success && histRes.data) {
      setDeliveryCount(histRes.data.length);
      const earnings = histRes.data.reduce((acc, order) => acc + (order.delivery_cost_share || 30), 0);
      setTotalEarnings(earnings);
    }
    setLoading(false);
  };

  const handleToggleOnline = async () => {
    setUpdatingStatus(true);
    const newVal = !isOnline;
    const res = await updateRiderStatus(newVal);
    if (res.success) {
      setIsOnline(newVal);
      toast.success(`Duty status: You are now ${newVal ? "Online (Active)" : "Offline (Inactive)"}`);
    } else {
      toast.error(res.error || "Failed to update duty status.");
    }
    setUpdatingStatus(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateRiderProfileSettings({
      vehicleType,
      vehicleNumber: vehicleNo,
      bankName,
      bankAccountNo: accountNo,
      bankIfsc,
    });
    if (res.success) {
      toast.success("Rider vehicle and bank details updated successfully!");
      loadData();
    } else {
      toast.error(res.error || "Failed to update profile settings.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mb-3 mx-auto" size={32} />
          <p className="text-stone-500 font-medium">Opening partner portal profile...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5 min-w-0 flex-1 max-w-4xl mx-auto">
      {/* Header card */}
      <header className="portal-glass flex flex-col gap-4 rounded-[24px] border border-white/70 p-5 shadow-xl shadow-stone-900/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-2xl shadow">
              {(profile?.full_name?.[0] || "P").toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 block h-4 w-4 rounded-full ring-2 ring-white ${
                isOnline ? "bg-emerald-500" : "bg-stone-300"
              }`}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight sm:text-2xl">
              {profile?.full_name || "Delivery Partner"}
            </h1>
            <p className="text-xs text-stone-500 font-semibold uppercase mt-0.5">
              Role: {profile?.role || "Logistics Courier"}
            </p>
          </div>
        </div>

        {/* Online status switch */}
        <div className="flex items-center gap-2 bg-white/80 border border-stone-200/60 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-xs font-bold text-stone-500 uppercase">
            Duty status: {isOnline ? "Online" : "Offline"}
          </span>
          <button
            onClick={handleToggleOnline}
            disabled={updatingStatus}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isOnline ? "bg-emerald-500" : "bg-stone-200"
            } ${updatingStatus ? "opacity-50" : ""}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isOnline ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2">
        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 text-center">
          <p className="text-2xl font-black text-stone-850">{deliveryCount}</p>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-1">Total Deliveries</p>
        </article>
        <article className="portal-card rounded-[22px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 text-center">
          <p className="text-2xl font-black text-emerald-600">₹{totalEarnings}</p>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-1">Wallet Payout Balance</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact Info card */}
        <div className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-950 mb-3 flex items-center gap-1.5">
              <User size={15} className="text-orange-600" /> Personal credentials
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Mail size={14} className="text-stone-400" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Registered Email</span>
                  <span className="text-xs font-semibold text-stone-700 truncate block">{profile?.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Phone size={14} className="text-stone-400" />
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Registered Contact</span>
                  <span className="text-xs font-semibold text-stone-700 block">{profile?.phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle & bank form */}
        <form onSubmit={handleSaveSettings} className="portal-card rounded-[24px] border border-white bg-white/80 p-5 shadow-xl shadow-stone-900/5 space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-stone-950 mb-1 flex items-center gap-1.5">
            <Truck size={15} className="text-orange-600" /> Delivery Vehicle Settings
          </h3>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-stone-400 uppercase">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-semibold transition bg-white"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Electric Scooter">Electric Scooter</option>
                <option value="Auto-rickshaw">Auto-rickshaw</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-stone-400 uppercase">Plate Number</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs font-semibold transition bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-stone-400 uppercase">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-[10px] font-semibold transition bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-stone-400 uppercase">Account No</label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-[10px] font-semibold transition bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-stone-400 uppercase">IFSC Code</label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value)}
                className="px-3 py-2 border border-stone-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-[10px] font-semibold transition bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 hover:bg-stone-900 text-white text-xs font-bold transition disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={13} />
            ) : (
              <Save size={13} />
            )}
            Save Vehicle & Payout settings
          </button>
        </form>
      </div>
    </section>
  );
}
