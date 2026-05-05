"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  Save,
  Store,
  ChevronRight,
  Loader2,
  BadgeCheck,
  Bell,
  CalendarDays,
  Heart,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { getProfile, updateProfile } from "@/lib/profile.action";
import { getRestaurantById } from "@/lib/restaurant.action";

interface ProfileForm {
  full_name: string;
  phone: string;
}

type ProfileData = {
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

type RestaurantData = {
  name?: string | null;
};

const perks = [
  { label: "Priority support", value: "Active", icon: ShieldCheck },
  { label: "Meal reminders", value: "Dinner at 8 PM", icon: Bell },
  { label: "Saved kitchens", value: "12 favorites", icon: Heart },
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");

  const { register, handleSubmit, reset, formState } = useForm<ProfileForm>();

  useEffect(() => {
    async function load() {
      const [profileRes, restaurantRes] = await Promise.all([
        getProfile(),
        getRestaurantById(),
      ]);

      if (profileRes.success && profileRes.data) {
        const p = profileRes.data as ProfileData;
        reset({ full_name: p.full_name || "", phone: p.phone || "" });
        setEmail(p.email || "");
      }

      if (restaurantRes.success && restaurantRes.data) {
        setHasRestaurant(true);
        setRestaurantName(
          (restaurantRes.data as RestaurantData).name || "Your Restaurant",
        );
      }

      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    const result = await updateProfile(data);
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="user-portal-shell min-h-screen">
        <div className="fd-profile-loader">
          <Loader2 className="animate-spin" size={32} color="#e8590c" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="user-portal-shell min-h-screen overflow-hidden p-3 text-stone-950 sm:p-5">
      <div className="user-portal-glow user-portal-glow-one" />
      <div className="user-portal-glow user-portal-glow-two" />

      <section className="relative mx-auto flex max-w-6xl flex-col gap-4">
        <header className="user-glass rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-white hover:text-orange-700"
          >
            <ArrowLeft size={17} />
            Home
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                <Sparkles size={14} />
                User mode
              </div>
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Your Foodiffin profile
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
                Keep your account ready for faster checkout, saved kitchens, and
                smooth restaurant partner switching.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[20px] bg-stone-950 p-3 text-white shadow-lg shadow-orange-500/20">
                <div className="mb-4 flex items-center justify-between">
                  <PackageCheck className="text-orange-200" size={20} />
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold">
                    Live
                  </span>
                </div>
                <p className="text-xl font-bold">3 orders</p>
                <p className="text-xs font-medium text-white/55">
                  Ready to reorder this week
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
          <aside className="flex flex-col gap-4">
            <section className="user-card rounded-[24px] border border-white/75 bg-white/82 p-5 text-center shadow-xl shadow-stone-900/5">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-gradient-to-br from-orange-600 to-emerald-500 text-3xl font-bold text-white shadow-lg shadow-orange-500/20">
                {(email?.[0] || "U").toUpperCase()}
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-tight">
                {formState.defaultValues?.full_name || "Foodiffin User"}
              </h2>
              <p className="text-sm font-semibold text-stone-500">{email}</p>

              <div className="mt-6 grid gap-2.5 text-left">
                <Link
                  href="/orders"
                  className="rounded-[18px] bg-gradient-to-r from-orange-500 to-orange-600 p-3 text-white transition hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <PackageCheck size={15} />
                    My Orders
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/80">
                    View order history
                  </p>
                </Link>

                {perks.map((perk) => (
                  <div
                    key={perk.label}
                    className="rounded-[18px] bg-stone-50 p-3 transition hover:bg-white hover:shadow-lg hover:shadow-orange-500/10"
                  >
                    <p className="flex items-center gap-2 text-sm font-bold">
                      <perk.icon size={15} className="text-orange-700" />
                      {perk.label}
                    </p>
                    <p className="mt-1 text-xs font-medium text-stone-500">
                      {perk.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="flex flex-col gap-4">
            <div className="user-card rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Account details
                  </h2>
                  <p className="text-sm text-stone-500">
                    Update the details used for orders and support.
                  </p>
                </div>
                <BadgeCheck size={22} className="text-emerald-600" />
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="fd-profile-form"
              >
                <div className="fd-profile-field">
                  <label htmlFor="full_name">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    {...register("full_name", { required: "Name is required" })}
                  />
                  {formState.errors.full_name && (
                    <span className="fd-profile-error">
                      {formState.errors.full_name.message}
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="fd-profile-field">
                    <label htmlFor="email-display">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      id="email-display"
                      type="email"
                      value={email}
                      disabled
                      className="fd-profile-disabled"
                    />
                    <span className="fd-profile-hint">
                      Email cannot be changed
                    </span>
                  </div>

                  <div className="fd-profile-field">
                    <label htmlFor="phone">
                      <Phone size={16} />
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      {...register("phone")}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="fd-profile-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            <div className="user-card rounded-[24px] border border-white/75 bg-stone-950 p-5 text-white shadow-lg shadow-stone-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-3 inline-flex rounded-xl bg-white/10 p-2.5 text-orange-200">
                    <Store size={22} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {hasRestaurant
                      ? "Partner mode ready"
                      : "Start selling meals"}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                    {hasRestaurant
                      ? `${restaurantName} is connected. Switch into admin mode to manage orders, menu, and kitchen flow.`
                      : "Create a restaurant profile and open your kitchen for Foodiffin customers."}
                  </p>
                </div>
                {hasRestaurant ? (
                  <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-stone-950 transition hover:-translate-y-0.5"
                  >
                    Admin Mode
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <Link
                    href="/onboarding"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700"
                  >
                    Create Restaurant
                    <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
