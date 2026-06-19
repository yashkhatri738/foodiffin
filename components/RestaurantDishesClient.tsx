"use client";

import { useState, useMemo } from "react";
import {
  ChefHat,
  SlidersHorizontal,
  X,
  Calendar,
  Wallet,
  CreditCard,
  Loader2,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import DishCard, { type DishData } from "@/components/DishCard";
import { type TiffinPlanData, subscribeToTiffinPlan } from "@/lib/tiffin.action";
import { getUserAddress } from "@/lib/address.action";
import { toast } from "sonner";

interface Props {
  dishes: DishData[];
  categories: string[];
  restaurantId: string;
  restaurantName: string;
  tiffinPlans?: TiffinPlanData[];
}

interface Filters {
  categories: string[];
  priceMin: number;
  priceMax: number;
  vegOnly: boolean | null; // null = all, true = veg, false = non-veg
  spiceLevels: string[];
}

export default function RestaurantDishesClient({
  dishes,
  categories,
  restaurantId,
  restaurantName,
  tiffinPlans = [],
}: Props) {
  const maxPrice = dishes.length ? Math.max(...dishes.map((d) => d.price)) : 500;
  const minPrice = dishes.length ? Math.min(...dishes.map((d) => d.price)) : 0;

  const spiceLevels = Array.from(
    new Set(dishes.map((d) => d.spice_level).filter(Boolean)),
  ) as string[];

  const [activeTab, setActiveTab] = useState<"dishes" | "tiffins">(
    tiffinPlans.length > 0 ? "tiffins" : "dishes"
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceMin: minPrice,
    priceMax: maxPrice,
    vegOnly: null,
    spiceLevels: [],
  });

  // Tiffin Subscription Form States
  const [selectedPlan, setSelectedPlan] = useState<TiffinPlanData | null>(null);
  const [duration, setDuration] = useState<"weekly" | "monthly">("weekly");
  const [price, setPrice] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState<string>("lunch");
  const [startDate, setStartDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("cash");
  const [submitting, setSubmitting] = useState(false);

  // Address check state
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    address_type: "home",
  });
  
  // Manual address fallback state
  const [manualAddress, setManualAddress] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    postal_code: "",
  });

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.priceMin > minPrice || filters.priceMax < maxPrice,
    filters.vegOnly !== null,
    filters.spiceLevels.length > 0,
  ].filter(Boolean).length;

  const resetFilters = () =>
    setFilters({
      categories: [],
      priceMin: minPrice,
      priceMax: maxPrice,
      vegOnly: null,
      spiceLevels: [],
    });

  const toggleCategory = (cat: string) =>
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));

  const toggleSpice = (level: string) =>
    setFilters((f) => ({
      ...f,
      spiceLevels: f.spiceLevels.includes(level)
        ? f.spiceLevels.filter((s) => s !== level)
        : [...f.spiceLevels, level],
    }));

  const filteredDishes = useMemo(() => {
    return dishes.filter((d) => {
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(d.category ?? "")
      )
        return false;
      if (d.price < filters.priceMin || d.price > filters.priceMax)
        return false;
      if (filters.vegOnly === true && !d.is_veg) return false;
      if (filters.vegOnly === false && d.is_veg) return false;
      if (
        filters.spiceLevels.length > 0 &&
        !filters.spiceLevels.includes(d.spice_level ?? "")
      )
        return false;
      return true;
    });
  }, [dishes, filters]);

  const filteredCategories = Array.from(
    new Set(filteredDishes.map((d) => d.category).filter(Boolean)),
  ) as string[];

  // Modal handlers
  const handleOpenSubscribeModal = async (plan: TiffinPlanData) => {
    setSelectedPlan(plan);
    setDuration("weekly");
    setPrice(plan.price_weekly);
    setDeliveryTime("lunch");
    setStartDate("");
    setPaymentMethod("cash");
    setSubmitting(false);

    // Fetch user address dynamically
    setIsLoadingAddress(true);
    try {
      const addrRes = await getUserAddress();
      if (addrRes.data) {
        setAddressDetails({
          full_name: addrRes.data.full_name || "",
          phone: addrRes.data.phone || "",
          address_line1: addrRes.data.address_line1 || "",
          address_line2: addrRes.data.address_line2 || "",
          city: addrRes.data.city || "",
          state: addrRes.data.state || "",
          postal_code: addrRes.data.postal_code || "",
          address_type: addrRes.data.address_type || "home",
        });
      } else {
        setAddressDetails({
          full_name: "",
          phone: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          postal_code: "",
          address_type: "home",
        });
      }
    } catch (e) {
      console.error("Failed to load user address:", e);
    }
    setAddressLoaded(true);
    setIsLoadingAddress(false);
  };

  const handleCloseSubscribeModal = () => {
    setSelectedPlan(null);
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedPlan.id) return;

    // Validate and formulate address
    let finalAddress: any = null;
    if (addressDetails.address_line1) {
      finalAddress = {
        full_name: addressDetails.full_name,
        phone: addressDetails.phone,
        address_line1: addressDetails.address_line1,
        address_line2: addressDetails.address_line2,
        city: addressDetails.city,
        state: addressDetails.state,
        postal_code: addressDetails.postal_code,
        address_type: addressDetails.address_type,
      };
    } else {
      if (
        !manualAddress.full_name ||
        !manualAddress.phone ||
        !manualAddress.address_line1 ||
        !manualAddress.city ||
        !manualAddress.postal_code
      ) {
        toast.error("Please enter a valid delivery address.");
        return;
      }
      finalAddress = {
        full_name: manualAddress.full_name,
        phone: manualAddress.phone,
        address_line1: manualAddress.address_line1,
        city: manualAddress.city,
        postal_code: manualAddress.postal_code,
        address_type: "home",
      };
    }

    setSubmitting(true);

    const calculatedEndDate = new Date(startDate);
    if (duration === "weekly") {
      calculatedEndDate.setDate(calculatedEndDate.getDate() + 7);
    } else {
      calculatedEndDate.setDate(calculatedEndDate.getDate() + 30);
    }

    const inputData = {
      planId: selectedPlan.id,
      restaurantId,
      startDate,
      endDate: calculatedEndDate.toISOString().split("T")[0],
      deliveryTime,
      address: finalAddress,
      paymentMethod,
      duration,
    };

    const res = await subscribeToTiffinPlan(inputData);
    if (res.success) {
      toast.success(`Successfully subscribed to ${selectedPlan.name}!`);
      handleCloseSubscribeModal();
    } else {
      toast.error(res.error || "Please sign in to order a subscription plan.");
    }
    setSubmitting(false);
  };

  return (
    <div>
      {/* ── Tabs selection at top ── */}
      {tiffinPlans.length > 0 && (
        <div className="mb-8 flex border-b border-stone-200">
          <button
            onClick={() => setActiveTab("tiffins")}
            className={`pb-4 px-6 text-sm font-semibold tracking-tight transition border-b-2 -mb-[2px] ${
              activeTab === "tiffins"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Tiffin Plans ({tiffinPlans.length})
          </button>
          <button
            onClick={() => setActiveTab("dishes")}
            className={`pb-4 px-6 text-sm font-semibold tracking-tight transition border-b-2 -mb-[2px] ${
              activeTab === "dishes"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Dishes Menu ({dishes.length})
          </button>
        </div>
      )}

      {activeTab === "dishes" ? (
        <>
          {/* ── Header row ── */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-orange-600">
                Menu
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-stone-800">
                All Dishes
              </h2>
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="relative flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Backdrop ── */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Filter Sidebar ── */}
          <aside
            className={`fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-white shadow-2xl transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-stone-100 p-5">
              <h3 className="text-base font-bold text-stone-800">Filters</h3>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-medium text-orange-500 hover:text-orange-700"
                  >
                    Reset all
                  </button>
                )}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Food type */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Food Type
                </p>
                <div className="flex gap-2">
                  {(
                    [
                      { label: "All", value: null },
                      { label: "🥦 Veg", value: true },
                      { label: "🍗 Non-Veg", value: false },
                    ] as { label: string; value: boolean | null }[]
                  ).map(({ label, value }) => (
                    <button
                      key={label}
                      onClick={() => setFilters((f) => ({ ...f, vegOnly: value }))}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        filters.vegOnly === value
                          ? value === true
                            ? "border-green-500 bg-green-50 text-green-600"
                            : value === false
                              ? "border-red-400 bg-red-50 text-red-600"
                              : "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-stone-200 text-stone-500 hover:border-stone-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Price Range
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={minPrice}
                      max={filters.priceMax}
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          priceMin: Math.min(Number(e.target.value), f.priceMax),
                        }))
                      }
                      className="w-full rounded-lg border border-stone-200 py-2 pl-6 pr-2 text-sm focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                  <span className="text-stone-400 text-sm">–</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={filters.priceMin}
                      max={maxPrice}
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          priceMax: Math.max(Number(e.target.value), f.priceMin),
                        }))
                      }
                      className="w-full rounded-lg border border-stone-200 py-2 pl-6 pr-2 text-sm focus:border-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition ${
                          filters.categories.includes(cat)
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-stone-200 text-stone-500 hover:border-stone-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Spice level */}
              {spiceLevels.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Spice Level
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {spiceLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => toggleSpice(level)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition ${
                          filters.spiceLevels.includes(level)
                            ? "border-red-400 bg-red-50 text-red-600"
                            : "border-stone-200 text-stone-500 hover:border-stone-300"
                        }`}
                      >
                        {level === "mild"
                          ? "🌶 Mild"
                          : level === "medium"
                            ? "🌶🌶 Medium"
                            : level === "hot"
                              ? "🌶🌶🌶 Hot"
                              : level}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-stone-100 bg-white p-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-95"
              >
                Show {filteredDishes.length} dish
                {filteredDishes.length !== 1 ? "es" : ""}
              </button>
            </div>
          </aside>

          {/* ── Dishes grid ── */}
          {filteredDishes.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
              <ChefHat className="mx-auto mb-3 text-orange-300" size={36} />
              <h3 className="text-base font-semibold text-stone-600">
                {dishes.length === 0
                  ? "No dishes yet"
                  : "No dishes match your filters"}
              </h3>
              <p className="mt-1 text-sm text-stone-400">
                {dishes.length === 0
                  ? "This kitchen hasn't added any dishes yet. Check back soon!"
                  : "Try adjusting or resetting your filters."}
              </p>
              {dishes.length > 0 && activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-700"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <>
              {filteredCategories.length > 0
                ? filteredCategories.map((cat) => (
                    <div key={cat} className="mb-8">
                      <h3 className="mb-3 text-base font-semibold text-stone-700 capitalize">
                        {cat}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredDishes
                          .filter((d) => d.category === cat)
                          .map((dish) => (
                            <DishCard
                              key={dish.id}
                              dish={dish}
                              restaurantId={restaurantId}
                              restaurantName={restaurantName}
                            />
                          ))}
                      </div>
                    </div>
                  ))
                : null}

              {filteredDishes.filter((d) => !d.category).length > 0 && (
                <div className={filteredCategories.length > 0 ? "mb-8" : ""}>
                  {filteredCategories.length > 0 && (
                    <h3 className="mb-3 text-base font-semibold text-stone-700">
                      Others
                    </h3>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredDishes
                      .filter((d) => !d.category)
                      .map((dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          restaurantId={restaurantId}
                          restaurantName={restaurantName}
                        />
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* ── Tiffin plans tab view ── */
        <div>
          <div className="mb-5">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-orange-600">
              Fresh Subscriptions
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-800">
              Tiffin Meal Services
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Select a meal plan below to get daily kitchen-fresh tiffins delivered to your doorstep.
            </p>
          </div>

          {tiffinPlans.filter((p) => p.is_available).length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
              <Calendar className="mx-auto mb-3 text-orange-300" size={36} />
              <h3 className="text-base font-semibold text-stone-600">
                No active tiffin plans
              </h3>
              <p className="mt-1 text-sm text-stone-400">
                This kitchen hasn't registered any available tiffin subscriptions yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tiffinPlans
                .filter((p) => p.is_available)
                .map((plan) => (
                  <article
                    key={plan.id}
                    className="group relative rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header tags */}
                      <div className="flex justify-between items-center mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            plan.meal_type === "Veg"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {plan.meal_type === "Veg" ? "🥦 Veg" : "🍗 Non-Veg"}
                        </span>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                          Best Seller
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-650 transition mb-1">
                        {plan.name}
                      </h3>

                      {plan.description && (
                        <p className="text-stone-500 text-xs leading-relaxed mb-4 line-clamp-3">
                          {plan.description}
                        </p>
                      )}

                      {/* Items */}
                      <div className="mb-4">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">
                          Items Included:
                        </span>
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
                      {/* Pricing row */}
                      <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3.5 mb-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-stone-400 block">
                            Weekly Pack
                          </span>
                          <span className="text-base font-extrabold text-stone-800">
                            ₹{plan.price_weekly}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-stone-400 block">
                            Monthly Pack
                          </span>
                          <span className="text-base font-extrabold text-orange-600">
                            ₹{plan.price_monthly}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenSubscribeModal(plan)}
                        className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-650 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition duration-200 active:scale-95"
                      >
                        Subscribe Now
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Subscribe Dialog Modal ─── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseSubscribeModal}
          />

          <div className="relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleCloseSubscribeModal}
              className="absolute top-5 right-5 p-1 rounded-full hover:bg-stone-100 transition"
            >
              <X size={18} className="text-stone-400 hover:text-stone-700" />
            </button>

            <div className="flex flex-col mb-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-0.5">
                <Calendar size={12} />
                Meal Subscription Checkout
              </span>
              <h2 className="text-xl font-extrabold text-stone-900 leading-tight">
                {selectedPlan.name}
              </h2>
            </div>

            <form onSubmit={handleSubscribeSubmit} className="space-y-4">
              {/* Plan price weekly vs monthly selector */}
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Select Pack Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDuration("weekly");
                      setPrice(selectedPlan.price_weekly);
                    }}
                    className={`py-2 rounded-xl border-2 text-xs font-bold transition flex flex-col items-center justify-center ${
                      duration === "weekly"
                        ? "border-orange-500 bg-orange-50/50 text-orange-650"
                        : "border-stone-250 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <span>Weekly Pack</span>
                    <span className="font-extrabold text-sm mt-0.5">₹{selectedPlan.price_weekly}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDuration("monthly");
                      setPrice(selectedPlan.price_monthly);
                    }}
                    className={`py-2 rounded-xl border-2 text-xs font-bold transition flex flex-col items-center justify-center ${
                      duration === "monthly"
                        ? "border-orange-500 bg-orange-50/50 text-orange-650"
                        : "border-stone-250 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <span>Monthly Pack</span>
                    <span className="font-extrabold text-sm mt-0.5">₹{selectedPlan.price_monthly}</span>
                  </button>
                </div>
              </div>

              {/* Delivery time slots */}
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Delivery Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["lunch", "dinner", "both"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDeliveryTime(slot)}
                      className={`py-1.5 border-2 rounded-xl text-xs font-bold capitalize transition ${
                        deliveryTime === slot
                          ? "border-orange-500 bg-orange-50/50 text-orange-650"
                          : "border-stone-250 text-stone-500 hover:border-stone-300"
                      }`}
                    >
                      {slot === "both" ? "Lunch & Dinner" : slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-stone-600" htmlFor="start-date">
                  Subscription Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-xs transition"
                />
              </div>

              {/* Delivery address display or manual entry */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-600 block">
                  Delivery Address
                </label>

                {isLoadingAddress ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-stone-400">
                    <Loader2 className="animate-spin" size={14} />
                    Checking for saved addresses...
                  </div>
                ) : addressDetails.address_line1 ? (
                  <div className="rounded-xl border border-orange-100 bg-orange-50/10 p-3 text-xs space-y-1 relative">
                    <div className="flex justify-between">
                      <span className="font-bold text-stone-850">{addressDetails.full_name}</span>
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[8px] uppercase font-bold">
                        {addressDetails.address_type}
                      </span>
                    </div>
                    <p className="text-stone-600">{addressDetails.address_line1}</p>
                    {addressDetails.address_line2 && <p className="text-stone-500">{addressDetails.address_line2}</p>}
                    <p className="text-stone-500">
                      {addressDetails.city}, {addressDetails.state} - {addressDetails.postal_code}
                    </p>
                    <p className="text-stone-605 font-medium">Phone: {addressDetails.phone}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Receiver's Full Name *"
                      required
                      value={manualAddress.full_name}
                      onChange={(e) => setManualAddress(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs outline-none focus:border-orange-500 transition"
                    />
                    <input
                      type="tel"
                      placeholder="Receiver's Phone Number *"
                      required
                      pattern="^[0-9]{10}$"
                      value={manualAddress.phone}
                      onChange={(e) => setManualAddress(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs outline-none focus:border-orange-500 transition"
                    />
                    <input
                      type="text"
                      placeholder="Address line 1 (Flat, Street) *"
                      required
                      value={manualAddress.address_line1}
                      onChange={(e) => setManualAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                      className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs outline-none focus:border-orange-500 transition"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City *"
                        required
                        value={manualAddress.city}
                        onChange={(e) => setManualAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs outline-none focus:border-orange-500 transition"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code *"
                        required
                        pattern="^[0-9]{6}$"
                        value={manualAddress.postal_code}
                        onChange={(e) => setManualAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs outline-none focus:border-orange-500 transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment selection */}
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-1.5 border-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMethod === "cash"
                        ? "border-orange-500 bg-orange-50/50 text-orange-650"
                        : "border-stone-250 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <Wallet size={12} />
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`py-1.5 border-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMethod === "online"
                        ? "border-orange-500 bg-orange-50/50 text-orange-650"
                        : "border-stone-250 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <CreditCard size={12} />
                    Online Payment
                  </button>
                </div>
              </div>

              {/* Submit btn */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3 bg-stone-900 hover:bg-stone-850 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Activating Plan...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} className="text-orange-500" />
                    Confirm Subscription (₹{price})
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}