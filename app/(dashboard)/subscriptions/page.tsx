"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Pause,
  Play,
  XCircle,
  Loader2,
  ChefHat,
  ArrowLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getUserActiveSubscriptions, updateSubscriptionStatus, type UserSubscription } from "@/lib/tiffin.user.action";
import { pauseTiffinSubscription, resumeTiffinSubscription } from "@/lib/tiffin.action";

export default function SubscriptionsDashboard() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Datepicker states for pausing
  const [activePauseSubId, setActivePauseSubId] = useState<string | null>(null);
  const [pauseStart, setPauseStart] = useState("");
  const [pauseEnd, setPauseEnd] = useState("");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    const res = await getUserActiveSubscriptions();
    if (res.success && res.data) {
      setSubscriptions(res.data);
    } else {
      toast.error(res.error || "Failed to load subscriptions.");
    }
    setLoading(false);
  };

  const handleConfirmPause = async (subId: string) => {
    if (!pauseStart || !pauseEnd) {
      toast.error("Please select both start and end dates.");
      return;
    }

    setUpdatingId(subId);
    const res = await pauseTiffinSubscription(subId, pauseStart, pauseEnd);
    if (res.success) {
      toast.success("Subscription paused and delivery dates extended successfully!");
      setActivePauseSubId(null);
      loadSubscriptions();
    } else {
      toast.error(res.error || "Failed to pause subscription.");
    }
    setUpdatingId(null);
  };

  const handleStatusChange = async (
    subId: string,
    currentStatus: string,
    action: "pause" | "resume" | "cancel"
  ) => {
    if (action === "pause") {
      setPauseStart("");
      setPauseEnd("");
      setActivePauseSubId(subId);
      return;
    }

    let confirmMsg = "";
    if (action === "resume") {
      confirmMsg = "Are you sure you want to resume this subscription?";
    } else if (action === "cancel") {
      confirmMsg = "Are you sure you want to cancel this subscription? This cannot be undone.";
    }

    if (!confirm(confirmMsg)) return;

    setUpdatingId(subId);
    let res;
    if (action === "resume") {
      res = await resumeTiffinSubscription(subId);
    } else {
      res = await updateSubscriptionStatus(subId, "cancelled");
    }

    if (res.success) {
      toast.success(
        action === "resume"
          ? "Subscription resumed successfully."
          : "Subscription cancelled."
      );
      loadSubscriptions();
    } else {
      toast.error(res.error || "Failed to update subscription status.");
    }
    setUpdatingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mb-3 mx-auto" size={32} />
          <p className="text-stone-500 font-medium">Loading your subscription packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header navigation */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors mb-3 text-sm font-semibold"
          >
            <ArrowLeft size={15} />
            Back to Profile
          </Link>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-500/25">
              <Calendar size={20} />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                Tiffin Subscriptions
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Manage your active daily meals, pausing, and delivery calendar.
              </p>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-start gap-3">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={17} />
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            <strong>Need to pause your meals?</strong> You can pause your subscription at any time. When paused, you will not be charged for delivery days and meals during that period. Ensure you pause before 9:00 PM for next-day changes.
          </p>
        </div>

        {/* Subscriptions Listing */}
        {subscriptions.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-sm">
            <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-850 mb-1">
              No subscriptions found
            </h2>
            <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
              Choose from daily fresh home-style Veg or Non-Veg meal boxes delivered right from verified local kitchens.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition"
            >
              Explore Tiffin Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {subscriptions.map((sub) => {
              const isUpdating = updatingId === sub.id;
              const statusColors = {
                active: "bg-emerald-50 text-emerald-700 border-emerald-200",
                paused: "bg-amber-50 text-amber-700 border-amber-200",
                cancelled: "bg-red-50 text-red-700 border-red-200",
                completed: "bg-stone-50 text-stone-600 border-stone-200",
              };

              return (
                <article
                  key={sub.id}
                  className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
                      sub.status === "active"
                        ? "from-emerald-500 to-emerald-400"
                        : sub.status === "paused"
                        ? "from-amber-500 to-yellow-400"
                        : "from-stone-300 to-stone-400"
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      {/* Badge and Restaurant Title */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusColors[sub.status] || "bg-stone-50 text-stone-700"
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            sub.tiffin_plans?.meal_type === "Veg"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {sub.tiffin_plans?.meal_type === "Veg" ? "🥬 Veg" : "🍗 Non-Veg"}
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold">•</span>
                        <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                          <Clock size={11} />
                          Delivery: {sub.delivery_time === "both" ? "Lunch & Dinner" : sub.delivery_time}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-stone-900 leading-tight">
                        {sub.tiffin_plans?.name || "Daily Meal Subscription"}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium mt-0.5">
                        Kitchen: {sub.restaurants?.name || "Partner Kitchen"}
                      </p>

                      {/* Date span */}
                      <div className="mt-4 grid grid-cols-2 gap-4 max-w-sm">
                        <div className="p-2 bg-stone-50 rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-stone-400 block">Start Date</span>
                          <span className="text-xs font-bold text-stone-700">{formatDate(sub.start_date)}</span>
                        </div>
                        <div className="p-2 bg-stone-50 rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-stone-400 block">End Date</span>
                          <span className="text-xs font-bold text-stone-700">{formatDate(sub.end_date)}</span>
                        </div>
                      </div>

                      {/* Items lists */}
                      {sub.tiffin_plans?.items && (
                        <div className="mt-4">
                          <span className="text-[9px] uppercase font-bold text-stone-400 block mb-1.5">Includes Daily:</span>
                          <div className="flex flex-wrap gap-1">
                            {sub.tiffin_plans.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-stone-100 rounded-md text-[10px] text-stone-600 font-bold"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Premium Pause Date Picker Inline form */}
                      {activePauseSubId === sub.id && (
                        <div className="mt-5 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/50 space-y-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pause Interval Range</div>
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-stone-400">Start Date</span>
                              <input
                                type="date"
                                value={pauseStart}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setPauseStart(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-stone-200 focus:border-orange-500 outline-none text-xs font-semibold bg-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-stone-400">End Date</span>
                              <input
                                type="date"
                                value={pauseEnd}
                                min={pauseStart || new Date().toISOString().split("T")[0]}
                                onChange={(e) => setPauseEnd(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-stone-200 focus:border-orange-500 outline-none text-xs font-semibold bg-white"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setActivePauseSubId(null)}
                              className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-650 hover:bg-stone-50 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleConfirmPause(sub.id)}
                              disabled={!pauseStart || !pauseEnd || isUpdating}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-50"
                            >
                              {isUpdating && updatingId === sub.id ? "Pausing..." : "Confirm Pause"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions panel */}
                    <div className="sm:text-right flex flex-row sm:flex-col justify-end gap-2 border-t sm:border-t-0 border-stone-100 pt-4 sm:pt-0 shrink-0">
                      {sub.status === "active" && (
                        <button
                          onClick={() => handleStatusChange(sub.id, sub.status, "pause")}
                          disabled={isUpdating}
                          className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 text-xs font-bold text-amber-700 transition disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Pause size={13} />}
                          Pause Meals
                        </button>
                      )}

                      {sub.status === "paused" && (
                        <button
                          onClick={() => handleStatusChange(sub.id, sub.status, "resume")}
                          disabled={isUpdating}
                          className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3.5 text-xs font-bold text-emerald-700 transition disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                          Resume Meals
                        </button>
                      )}

                      {(sub.status === "active" || sub.status === "paused") && (
                        <button
                          onClick={() => handleStatusChange(sub.id, sub.status, "cancel")}
                          disabled={isUpdating}
                          className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-stone-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 px-3.5 text-xs font-bold text-stone-600 transition disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                          Cancel Pack
                        </button>
                      )}

                      {sub.status === "cancelled" && (
                        <span className="text-xs text-red-500 font-bold py-1">Subscription Cancelled</span>
                      )}

                      {sub.status === "completed" && (
                        <span className="text-xs text-stone-500 font-bold py-1">Package Expired</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
