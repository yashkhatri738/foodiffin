"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Settings,
  Store,
  DollarSign,
  Shield,
  Loader2,
  Save,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import {
  getRestaurantForAdmin,
  updateRestaurantSettings,
} from "@/lib/restaurant.action";

interface SettingsData {
  id: string;
  name: string;
  is_open: boolean;
  min_order_value: number;
  delivery_charge: number;
}

export default function StoreSettingsPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isOpen, setIsOpen] = useState(true);
  const [minOrder, setMinOrder] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await getRestaurantForAdmin();
      if (res.success && res.data) {
        const r = res.data as SettingsData;
        setRestaurantId(r.id);
        setIsOpen(r.is_open ?? true);
        setMinOrder(r.min_order_value ?? 0);
        setDeliveryCharge(r.delivery_charge ?? 0);
      } else {
        toast.error("Failed to load restaurant settings");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    setSaving(true);
    const res = await updateRestaurantSettings(restaurantId, {
      is_open: isOpen,
      min_order_value: minOrder,
      delivery_charge: deliveryCharge,
    });

    if (res.success) {
      toast.success("Settings updated successfully!");
    } else {
      toast.error(res.error || "Failed to save settings");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
          <p className="text-stone-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <header className="portal-glass rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
        <div className="flex items-center gap-2 mb-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
          <Settings size={14} />
          Configuration
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Store Settings
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
          Control your restaurant availability status, delivery rates, and ordering guidelines.
        </p>
      </header>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-4">
          {/* Status Settings */}
          <div className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5">
            <div className="flex items-center gap-3 mb-5 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Store size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Store Status</h3>
                <p className="text-xs text-stone-500">Toggle whether your kitchen is open to users</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  {isOpen ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    {isOpen ? "Kitchen is Open" : "Kitchen is Paused"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {isOpen ? "Customers can place orders and subscribe" : "Orders will be blocked temporarily"}
                  </p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="checkbox"
                  id="isOpenToggle"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="peer sr-only"
                />
                <label
                  htmlFor="isOpenToggle"
                  className="block w-12 h-7 bg-stone-200 peer-checked:bg-orange-500 rounded-full cursor-pointer transition-colors"
                />
                <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5">
            <div className="flex items-center gap-3 mb-5 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Ordering & Delivery Fees</h3>
                <p className="text-xs text-stone-500">Set boundaries and service costs</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="minOrderInput" className="text-sm font-semibold text-stone-700">
                  Min. Order Value (₹)
                </label>
                <input
                  id="minOrderInput"
                  type="number"
                  min="0"
                  required
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                  placeholder="e.g. 100"
                />
                <p className="text-[11px] text-stone-500 leading-normal">
                  Minimum cart value required before order checkout. Set 0 for no limit.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="deliveryChargeInput" className="text-sm font-semibold text-stone-700">
                  Flat Delivery Charge (₹)
                </label>
                <input
                  id="deliveryChargeInput"
                  type="number"
                  min="0"
                  required
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                  placeholder="e.g. 30"
                />
                <p className="text-[11px] text-stone-500 leading-normal">
                  Delivery fee added to every order. Set 0 for free delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save button and side details */}
        <aside className="flex flex-col gap-4">
          <div className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5">
            <h3 className="font-bold text-stone-900 mb-3">Save Settings</h3>
            <p className="text-xs text-stone-500 mb-5">
              Make sure to save changes. These changes will reflect instantly to all active customers.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition duration-200"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving configurations..." : "Commit configurations"}
            </button>
          </div>

          {/* Quick info */}
          <div className="portal-card rounded-[24px] border border-white/75 bg-stone-950 p-5 text-white shadow-xl shadow-stone-950/20">
            <div className="flex items-center justify-between mb-4">
              <Shield className="text-orange-200" size={22} />
              <Sparkles className="text-orange-300" size={16} />
            </div>
            <h3 className="text-base font-bold tracking-tight mb-1">Security & Rules</h3>
            <p className="text-xs leading-5 text-white/60 mb-3">
              Only authenticated restaurant owners or designated admins can mutate kitchen statuses. Subscribed users will see a warning indicator if your kitchen closes.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 p-2 text-white/80">
              <Info size={14} className="text-orange-200 shrink-0" />
              <span className="text-[10px] leading-tight">
                Branding assets (banners & logo colors) are managed in the Partner Profile tab.
              </span>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
