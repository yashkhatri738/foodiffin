"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Heart,
  MapPin,
  PackageCheck,
  Utensils,
  AlertTriangle,
  Plus,
  Camera,
  Calendar,
  FileText,
  Gift,
  Star,
} from "lucide-react";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  updateNotifications,
  uploadAvatar,
  ProfileData,
} from "@/lib/profile.action";
import { getRestaurantById } from "@/lib/restaurant.action";

// Tab types
type TabType = "personal" | "preferences" | "addresses" | "notifications";

// Dietary options
const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian", emoji: "🥬" },
  { value: "non_vegetarian", label: "Non-Vegetarian", emoji: "🍖" },
  { value: "vegan", label: "Vegan", emoji: "🌱" },
  { value: "eggetarian", label: "Eggetarian", emoji: "🥚" },
  { value: "jain", label: "Jain", emoji: "☸️" },
  { value: "none", label: "No Preference", emoji: "🍽️" },
];

const ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Gluten",
];

const CUISINES = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Mexican",
  "Thai",
  "Continental",
  "Bengali",
  "Punjabi",
  "Mughlai",
  "Street Food",
  "Healthy Food",
];

const MEMBERSHIP_TIERS = {
  bronze: { color: "from-amber-600 to-amber-700", icon: "🥉", next: 500 },
  silver: { color: "from-slate-400 to-slate-500", icon: "🥈", next: 2000 },
  gold: { color: "from-yellow-400 to-amber-500", icon: "🥇", next: 5000 },
  platinum: { color: "from-purple-400 to-indigo-500", icon: "💎", next: null },
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [dietaryPref, setDietaryPref] = useState("none");

  const { register, handleSubmit, reset, watch } = useForm();

  useEffect(() => {
    async function load() {
      const [profileRes, restaurantRes] = await Promise.all([
        getProfile(),
        getRestaurantById(),
      ]);

      if (profileRes.success && profileRes.data) {
        const p = profileRes.data;
        setProfile(p);
        reset({
          full_name: p.full_name || "",
          phone: p.phone || "",
          bio: p.bio || "",
          date_of_birth: p.date_of_birth || "",
          gender: p.gender || "",
          email_notifications: p.email_notifications ?? true,
          sms_notifications: p.sms_notifications ?? true,
          push_notifications: p.push_notifications ?? true,
          order_updates: p.order_updates ?? true,
          offers_notifications: p.offers_notifications ?? true,
        });
        setDietaryPref(p.dietary_preference || "none");
        setSelectedAllergies(p.allergies || []);
        setSelectedCuisines(p.favorite_cuisines || []);
      }

      if (restaurantRes.success && restaurantRes.data) {
        setHasRestaurant(true);
        setRestaurantName(
          (restaurantRes.data as any).name || "Your Restaurant",
        );
      }

      setLoading(false);
    }
    load();
  }, [reset]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(formData);
    if (result.success && result.data) {
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: result.data! } : null,
      );
      toast.success("Avatar updated!");
    } else {
      toast.error(result.error || "Failed to upload avatar");
    }
    setUploadingAvatar(false);
  };

  const onSubmitPersonal = async (data: any) => {
    setSaving(true);
    const result = await updateProfile({
      full_name: data.full_name,
      phone: data.phone,
      bio: data.bio,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
    });
    if (result.success) toast.success("Profile updated!");
    else toast.error(result.error || "Failed to update");
    setSaving(false);
  };

  const onSubmitPreferences = async () => {
    setSaving(true);
    const result = await updatePreferences({
      dietary_preference: dietaryPref,
      allergies: selectedAllergies,
      favorite_cuisines: selectedCuisines,
    });
    if (result.success) toast.success("Preferences saved!");
    else toast.error(result.error || "Failed to save preferences");
    setSaving(false);
  };

  const onSubmitNotifications = async (data: any) => {
    setSaving(true);
    const result = await updateNotifications({
      email_notifications: data.email_notifications,
      sms_notifications: data.sms_notifications,
      push_notifications: data.push_notifications,
      order_updates: data.order_updates,
      offers_notifications: data.offers_notifications,
    });
    if (result.success) toast.success("Notification settings saved!");
    else toast.error(result.error || "Failed to save settings");
    setSaving(false);
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy],
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine],
    );
  };

  const tierInfo =
    MEMBERSHIP_TIERS[
    profile?.membership_tier as keyof typeof MEMBERSHIP_TIERS
    ] || MEMBERSHIP_TIERS.bronze;
  const pointsProgress = tierInfo.next
    ? ((profile?.loyalty_points || 0) / tierInfo.next) * 100
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-pulse">
            <Utensils className="text-white" size={28} />
          </div>
          <p className="text-stone-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 pt-8 pb-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm p-1 shadow-xl">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={112}
                    height={112}
                    className="w-full h-full rounded-[22px] object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-4xl font-bold text-white">
                    {(
                      profile?.full_name?.[0] ||
                      profile?.email?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-orange-600 hover:bg-orange-50 transition"
              >
                {uploadingAvatar ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {profile?.full_name || "Foodiffin User"}
                </h1>
                {profile?.email_verified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold text-white">
                    <BadgeCheck size={14} /> Verified
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm mb-3">{profile?.email}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <span className="text-lg">{tierInfo.icon}</span>
                <span className="font-semibold text-white capitalize">
                  {profile?.membership_tier || "Bronze"}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80 text-sm">
                  {profile?.loyalty_points || 0} points
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white">
                  {profile?.total_orders || 0}
                </p>
                <p className="text-xs text-white/70 font-medium">Orders</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-white">
                  {profile?.loyalty_points || 0}
                </p>
                <p className="text-xs text-white/70 font-medium">Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/5 p-2">
              {[
                { id: "personal", label: "Personal Info", icon: User },
                {
                  id: "preferences",
                  label: "Food Preferences",
                  icon: Utensils,
                },
                { id: "addresses", label: "My Addresses", icon: MapPin },
                { id: "notifications", label: "Notifications", icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${activeTab === tab.id ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25" : "text-stone-600 hover:bg-stone-50"}`}
                >
                  <tab.icon size={18} />
                  <span className="font-semibold text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Loyalty Card */}
            {/* <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierInfo.color} flex items-center justify-center text-xl`}
                >
                  {tierInfo.icon}
                </div>
                <div>
                  <p className="font-bold capitalize">
                    {profile?.membership_tier || "Bronze"} Member
                  </p>
                  <p className="text-xs text-white/60">
                    {profile?.loyalty_points || 0} total points
                  </p>
                </div>
              </div>
              {tierInfo.next && (
                <>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full bg-gradient-to-r ${tierInfo.color} rounded-full transition-all`}
                      style={{ width: `${Math.min(pointsProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    {tierInfo.next - (profile?.loyalty_points || 0)} points to
                    next tier
                  </p>
                </>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/60 mb-2">Benefits</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Gift size={14} className="text-orange-400" />
                    <span>Free delivery on orders above ₹300</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star size={14} className="text-orange-400" />
                    <span>Priority customer support</span>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Restaurant Partner Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Store size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">
                    {hasRestaurant ? "Partner Mode" : "Become a Partner"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {hasRestaurant ? restaurantName : "Start selling meals"}
                  </p>
                </div>
              </div>
              {hasRestaurant ? (
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition"
                >
                  Go to Dashboard <ChevronRight size={16} />
                </button>
              ) : (
                <Link
                  href="/onboarding"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition"
                >
                  Create Restaurant <ChevronRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/5 p-6 sm:p-8">
            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <form onSubmit={handleSubmit(onSubmitPersonal)}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      Personal Information
                    </h2>
                    <p className="text-sm text-stone-500">
                      Update your personal details
                    </p>
                  </div>
                  <BadgeCheck className="text-emerald-500" size={24} />
                </div>
                <div className="grid gap-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                        <User size={14} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                        {...register("full_name")}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                        <Mail size={14} />
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-stone-400 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                        <Phone size={14} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                        {...register("phone")}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                        <Calendar size={14} />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                        {...register("date_of_birth")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      <User size={14} />
                      Gender
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["male", "female", "other", "prefer_not_to_say"].map(
                        (gender) => (
                          <label
                            key={gender}
                            className={`px-4 py-2.5 rounded-xl border-2 cursor-pointer transition ${watch("gender") === gender ? "border-orange-500 bg-orange-50 text-orange-600" : "border-stone-200 hover:border-stone-300"}`}
                          >
                            <input
                              type="radio"
                              value={gender}
                              className="hidden"
                              {...register("gender")}
                            />
                            <span className="text-sm font-medium capitalize">
                              {gender.replace(/_/g, " ")}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      <FileText size={14} />
                      Bio
                    </label>
                    <textarea
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition resize-none"
                      {...register("bio")}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 transition"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      Food Preferences
                    </h2>
                    <p className="text-sm text-stone-500">
                      Help us personalize your experience
                    </p>
                  </div>
                  <Utensils className="text-orange-500" size={24} />
                </div>
                <div className="mb-8">
                  <h3 className="font-semibold text-stone-900 mb-3">
                    Dietary Preference
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DIETARY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDietaryPref(option.value)}
                        className={`p-4 rounded-xl border-2 text-left transition ${dietaryPref === option.value ? "border-orange-500 bg-orange-50" : "border-stone-200 hover:border-stone-300"}`}
                      >
                        <span className="text-2xl mb-2 block">
                          {option.emoji}
                        </span>
                        <span className="font-semibold text-sm text-stone-900">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="font-semibold text-stone-900 mb-1">
                    Allergies
                  </h3>
                  <p className="text-sm text-stone-500 mb-3">
                    Select any food allergies you have
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedAllergies.includes(allergy) ? "bg-red-100 text-red-700 border-2 border-red-300" : "bg-stone-100 text-stone-600 border-2 border-transparent hover:bg-stone-200"}`}
                      >
                        {selectedAllergies.includes(allergy) && (
                          <AlertTriangle size={12} className="inline mr-1" />
                        )}
                        {allergy}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="font-semibold text-stone-900 mb-1">
                    Favorite Cuisines
                  </h3>
                  <p className="text-sm text-stone-500 mb-3">
                    Select cuisines you love
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CUISINES.map((cuisine) => (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCuisines.includes(cuisine) ? "bg-orange-100 text-orange-700 border-2 border-orange-300" : "bg-stone-100 text-stone-600 border-2 border-transparent hover:bg-stone-200"}`}
                      >
                        {selectedCuisines.includes(cuisine) && (
                          <Heart
                            size={12}
                            className="inline mr-1 fill-current"
                          />
                        )}
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={onSubmitPreferences}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 transition"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      My Addresses
                    </h2>
                    <p className="text-sm text-stone-500">
                      Manage your delivery addresses
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition">
                    <Plus size={16} />
                    Add New
                  </button>
                </div>
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                    <MapPin size={28} className="text-stone-400" />
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-1">
                    No addresses saved
                  </h3>
                  <p className="text-sm text-stone-500 mb-4">
                    Add your first delivery address
                  </p>
                  <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition">
                    <Plus size={16} />
                    Add Address
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <form onSubmit={handleSubmit(onSubmitNotifications)}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      Notification Settings
                    </h2>
                    <p className="text-sm text-stone-500">
                      Manage how we contact you
                    </p>
                  </div>
                  <Bell className="text-orange-500" size={24} />
                </div>
                <div className="space-y-4">
                  {[
                    {
                      id: "order_updates",
                      label: "Order Updates",
                      desc: "Get notified about your order status",
                      icon: PackageCheck,
                    },
                    {
                      id: "email_notifications",
                      label: "Email Notifications",
                      desc: "Receive updates via email",
                      icon: Mail,
                    },
                    {
                      id: "sms_notifications",
                      label: "SMS Notifications",
                      desc: "Receive updates via text message",
                      icon: Phone,
                    },
                    {
                      id: "push_notifications",
                      label: "Push Notifications",
                      desc: "Receive push notifications on your device",
                      icon: Bell,
                    },
                    {
                      id: "offers_notifications",
                      label: "Offers & Promotions",
                      desc: "Get notified about deals and discounts",
                      icon: Gift,
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-stone-300 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                          <item.icon size={18} className="text-stone-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">
                            {item.label}
                          </p>
                          <p className="text-sm text-stone-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          {...register(item.id)}
                        />
                        <div className="w-12 h-7 bg-stone-200 peer-checked:bg-orange-500 rounded-full transition"></div>
                        <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition"></div>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 transition"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="h-12" />
    </main>
  );
}
