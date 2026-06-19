"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Utensils,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { getRestaurantForAdmin } from "@/lib/restaurant.action";
import {
  getTiffinPlansByRestaurant,
  createTiffinPlan,
  updateTiffinPlan,
  deleteTiffinPlan,
  toggleTiffinPlanAvailability,
  TiffinPlanData,
} from "@/lib/tiffin.action";

export default function SubscriptionsPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [plans, setPlans] = useState<TiffinPlanData[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TiffinPlanData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceWeekly, setPriceWeekly] = useState<number>(499);
  const [priceMonthly, setPriceMonthly] = useState<number>(1899);
  const [mealType, setMealType] = useState("Veg");
  const [itemsString, setItemsString] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const restRes = await getRestaurantForAdmin();
    if (restRes.success && restRes.data) {
      const restId = (restRes.data as any).id;
      setRestaurantId(restId);

      const plansRes = await getTiffinPlansByRestaurant(restId);
      if (plansRes.success) {
        setPlans(plansRes.data || []);
      } else {
        toast.error("Failed to load tiffin plans");
      }
    } else {
      toast.error("Failed to retrieve restaurant information");
    }
    setLoading(false);
  };

  const handleOpenNew = () => {
    setEditingPlan(null);
    setName("");
    setDescription("");
    setPriceWeekly(499);
    setPriceMonthly(1899);
    setMealType("Veg");
    setItemsString("");
    setIsOpen(true);
  };

  const handleOpenEdit = (plan: TiffinPlanData) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description || "");
    setPriceWeekly(plan.price_weekly);
    setPriceMonthly(plan.price_monthly);
    setMealType(plan.meal_type);
    setItemsString(plan.items.join(", "));
    setIsOpen(true);
  };

  const handleToggleAvailability = async (planId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    
    // Optimistic Update
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, is_available: newVal } : p));
    
    const res = await toggleTiffinPlanAvailability(planId, newVal);
    if (!res.success) {
      toast.error("Failed to update plan status");
      // Rollback
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, is_available: currentVal } : p));
    } else {
      toast.success(`Plan is now ${newVal ? "available" : "unavailable"}`);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;

    const res = await deleteTiffinPlan(planId);
    if (res.success) {
      toast.success("Plan deleted successfully");
      loadData();
    } else {
      toast.error(res.error || "Failed to delete plan");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    setSubmitting(true);

    const items = itemsString
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");

    const planData: TiffinPlanData = {
      name,
      description,
      price_weekly: Number(priceWeekly),
      price_monthly: Number(priceMonthly),
      meal_type: mealType,
      items,
      is_available: editingPlan ? editingPlan.is_available : true,
    };

    let result;
    if (editingPlan && editingPlan.id) {
      result = await updateTiffinPlan(editingPlan.id, planData);
    } else {
      result = await createTiffinPlan(restaurantId, planData);
    }

    if (result.success) {
      toast.success(editingPlan ? "Plan updated!" : "Tiffin plan created!");
      setIsOpen(false);
      loadData();
    } else {
      toast.error(result.error || "Failed to save plan");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
          <p className="text-stone-500 font-medium">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 relative">
      {/* Header */}
      <header className="portal-glass flex flex-col gap-4 rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
            <Calendar size={14} />
            Subscription Service
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Tiffin subscriptions
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
            Create and manage weekly and monthly tiffin subscription packages for your customers.
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenNew}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700"
          >
            <Plus size={17} />
            New plan
          </button>
        </div>
      </header>

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="portal-card rounded-[24px] border border-dashed border-stone-200 bg-white/50 p-12 text-center">
          <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="font-bold text-stone-900 text-lg mb-1">No Tiffin subscription plans</h3>
          <p className="text-sm text-stone-500 mb-5 max-w-sm mx-auto">
            Get started by launching your first tiffin subscription box. Customers can choose weekly or monthly deliveries.
          </p>
          <button
            onClick={handleOpenNew}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Create first plan
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`portal-card rounded-[24px] border border-white/70 p-5 shadow-xl shadow-stone-900/5 flex flex-col justify-between transition hover:-translate-y-0.5 duration-200 ${
                plan.is_available ? "bg-white/80" : "bg-stone-50/70 opacity-80"
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      plan.meal_type === "Veg"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {plan.meal_type}
                  </span>
                  
                  {/* Availability toggle */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">
                      {plan.is_available ? "Available" : "Paused"}
                    </span>
                    <input
                      type="checkbox"
                      id={`avail-${plan.id}`}
                      checked={plan.is_available ?? true}
                      onChange={() => handleToggleAvailability(plan.id!, plan.is_available ?? true)}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor={`avail-${plan.id}`}
                      className="relative block w-8 h-4.5 bg-stone-200 peer-checked:bg-orange-500 rounded-full cursor-pointer transition-colors"
                    />
                    <div
                      className={`absolute w-3.5 h-3.5 bg-white rounded-full transition-transform pointer-events-none ${
                        plan.is_available ? "translate-x-4" : "translate-x-0.5"
                      }`}
                      style={{ marginTop: "-2px" }}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-1">{plan.name}</h3>
                {plan.description && (
                  <p className="text-stone-500 text-xs leading-relaxed mb-4 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {/* Items tags */}
                <div className="mb-4">
                  <h5 className="text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                    Menu Items Included:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {plan.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-stone-100 rounded-md text-[10px] text-stone-600 font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {/* Pricing section */}
                <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3.5 mb-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">
                      Weekly Tiffin
                    </span>
                    <span className="text-base font-extrabold text-orange-700">
                      ₹{plan.price_weekly}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-stone-400 block">
                      Monthly Tiffin
                    </span>
                    <span className="text-base font-extrabold text-orange-700">
                      ₹{plan.price_monthly}
                    </span>
                  </div>
                </div>

                {/* Edit & Delete Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition duration-200"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id!)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition duration-200"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Form Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-stone-100 transition"
            >
              <X size={18} className="text-stone-400 hover:text-stone-700" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-orange-600" size={24} />
              <h2 className="text-xl font-bold text-stone-900">
                {editingPlan ? "Edit Subscription" : "Add Tiffin Plan"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-600" htmlFor="plan-name">
                  Plan Name *
                </label>
                <input
                  id="plan-name"
                  type="text"
                  required
                  placeholder="e.g. Standard Veg Tiffin Plan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-600" htmlFor="plan-desc">
                  Description
                </label>
                <textarea
                  id="plan-desc"
                  rows={2}
                  placeholder="Details about kitchen fresh ingredients, schedule..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition resize-none"
                />
              </div>

              {/* Meal Type Radio selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-600">Meal Type</label>
                <div className="flex gap-2">
                  {["Veg", "Non-Veg"].map((type) => (
                    <label
                      key={type}
                      className={`flex-1 py-2 text-center rounded-xl border-2 cursor-pointer transition text-xs capitalize ${
                        mealType === type
                          ? "border-orange-500 bg-orange-50 text-orange-600 font-bold"
                          : "border-stone-200 hover:border-stone-300 text-stone-500 font-medium"
                      }`}
                    >
                      <input
                        type="radio"
                        name="meal_type"
                        value={type}
                        checked={mealType === type}
                        onChange={() => setMealType(type)}
                        className="hidden"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600" htmlFor="plan-pw">
                    Weekly Price (₹) *
                  </label>
                  <input
                    id="plan-pw"
                    type="number"
                    min="1"
                    required
                    value={priceWeekly}
                    onChange={(e) => setPriceWeekly(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-600" htmlFor="plan-pm">
                    Monthly Price (₹) *
                  </label>
                  <input
                    id="plan-pm"
                    type="number"
                    min="1"
                    required
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition"
                  />
                </div>
              </div>

              {/* Items included */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-600" htmlFor="plan-items">
                  Items Included (Comma-separated) *
                </label>
                <input
                  id="plan-items"
                  type="text"
                  required
                  placeholder="e.g. 4 Roti, Dal Fry, Rice, Seasonal Sabji"
                  value={itemsString}
                  onChange={(e) => setItemsString(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm transition"
                />
                <p className="text-[10px] text-stone-400">Separate items by typing a comma ( , )</p>
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-orange-500/20 transition duration-200"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {submitting ? "Saving plan..." : "Save subscription plan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
