"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  ImagePlus,
  X,
  Loader2,
  Check,
  Upload,
  Clock,
  CreditCard,
  Building2,
  Utensils,
  Palette,
  ChefHat,
  Truck,
  Wifi,
  Car,
  Leaf,
  Sparkles,
} from "lucide-react";
import {
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  uploadRestaurantImage,
  addImageToRestaurant,
  removeImageFromRestaurant,
} from "@/lib/restaurant.action";

// Step definitions
const STEPS = [
  {
    id: 1,
    title: "Basic Info",
    description: "Restaurant identity",
    icon: Store,
  },
  { id: 2, title: "Location", description: "Address details", icon: MapPin },
  { id: 3, title: "Contact", description: "Communication", icon: Phone },
  { id: 4, title: "Hours", description: "Operating times", icon: Clock },
  { id: 5, title: "Features", description: "Services offered", icon: Utensils },
  { id: 6, title: "Gallery", description: "Food photos", icon: ImagePlus },
];

const CUISINE_TYPES = [
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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type RestaurantData = {
  id?: string;
  name?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  cuisine_types?: string[];
  pure_veg?: boolean;
  has_parking?: boolean;
  has_wifi?: boolean;
  accepts_card?: boolean;
  accepts_upi?: boolean;
  accepts_cash?: boolean;
  operating_hours?: Record<
    string,
    { open: string; close: string; closed: boolean }
  >;
  images?: string[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Form states
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [features, setFeatures] = useState({
    pure_veg: false,
    has_parking: false,
    has_wifi: false,
  });
  const [payments, setPayments] = useState({
    accepts_card: true,
    accepts_upi: true,
    accepts_cash: true,
  });
  const [operatingHours, setOperatingHours] = useState<
    Record<string, { open: string; close: string; closed: boolean }>
  >(
    Object.fromEntries(
      DAYS.map((day) => [
        day,
        { open: "09:00", close: "22:00", closed: false },
      ]),
    ),
  );

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    trigger,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    async function load() {
      const res = await getRestaurantById();
      if (res.success && res.data) {
        const r = res.data as RestaurantData;
        setRestaurantId(r.id || null);
        setImages(r.images || []);
        setIsEdit(true);
        setSelectedCuisines(r.cuisine_types || []);
        setFeatures({
          pure_veg: r.pure_veg || false,
          has_parking: r.has_parking || false,
          has_wifi: r.has_wifi || false,
        });
        setPayments({
          accepts_card: r.accepts_card ?? true,
          accepts_upi: r.accepts_upi ?? true,
          accepts_cash: r.accepts_cash ?? true,
        });
        if (r.operating_hours) setOperatingHours(r.operating_hours);
        reset({
          name: r.name || "",
          tagline: r.tagline || "",
          description: r.description || "",
          email: r.email || "",
          phone: r.phone || "",
          country: r.country || "India",
          address: r.address || "",
          city: r.city || "",
          state: r.state || "",
          pincode: r.pincode || "",
        });
        // Mark steps as completed based on data
        const completed: number[] = [];
        if (r.name) completed.push(1);
        if (r.address || r.city) completed.push(2);
        if (r.phone || r.email) completed.push(3);
        completed.push(4); // Hours always has defaults
        completed.push(5); // Features always has defaults
        if ((r.images?.length || 0) > 0) completed.push(6);
        setCompletedSteps(completed);
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine],
    );
  };

  const updateHours = (
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean,
  ) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const saveStep = async () => {
    setSaving(true);
    const data = getValues();

    const restaurantData = {
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      email: data.email,
      phone: data.phone,
      country: data.country,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      cuisine_types: selectedCuisines,
      pure_veg: features.pure_veg,
      has_parking: features.has_parking,
      has_wifi: features.has_wifi,
      accepts_card: payments.accepts_card,
      accepts_upi: payments.accepts_upi,
      accepts_cash: payments.accepts_cash,
      operating_hours: operatingHours,
    };

    try {
      if (isEdit && restaurantId) {
        const result = await updateRestaurant(restaurantId, restaurantData);
        if (result.success) {
          toast.success("Progress saved!");
          if (!completedSteps.includes(currentStep)) {
            setCompletedSteps((prev) => [...prev, currentStep]);
          }
        } else {
          toast.error(result.error || "Failed to save");
        }
      } else {
        const result = await createRestaurant(restaurantData);
        if (result.success && result.data) {
          const newId = (result.data as RestaurantData).id;
          if (newId) {
            setRestaurantId(newId);
            setIsEdit(true);
            setCompletedSteps([1]);
            toast.success("Restaurant created!");
          }
        } else {
          toast.error(result.error || "Failed to create");
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const nextStep = async () => {
    // Validate current step
    let valid = true;
    if (currentStep === 1) {
      valid = await trigger(["name"]);
      if (!valid) {
        toast.error("Please fill in the restaurant name");
        return;
      }
    }
    await saveStep();
    if (currentStep < STEPS.length) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurantId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await uploadRestaurantImage(formData);
    if (uploadRes.success && uploadRes.data) {
      const addRes = await addImageToRestaurant(restaurantId, uploadRes.data);
      if (addRes.success) {
        setImages((prev) => [...prev, uploadRes.data!]);
        if (!completedSteps.includes(6))
          setCompletedSteps((prev) => [...prev, 6]);
        toast.success("Image uploaded!");
      } else {
        toast.error("Failed to link image");
      }
    } else {
      toast.error(uploadRes.error || "Upload failed");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (!restaurantId) return;
    const res = await removeImageFromRestaurant(restaurantId, imageUrl);
    if (res.success) {
      setImages((prev) => prev.filter((img) => img !== imageUrl));
      toast.success("Image removed");
    } else {
      toast.error("Failed to remove image");
    }
  };

  const finishOnboarding = async () => {
    await saveStep();
    toast.success("Restaurant setup complete!");
    router.push("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-pulse">
            <ChefHat className="text-white" size={28} />
          </div>
          <p className="text-stone-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 pt-8 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ChefHat className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {isEdit ? "Edit Restaurant" : "Launch Your Kitchen"}
              </h1>
              <p className="text-white/80 text-sm">
                {isEdit
                  ? "Update your restaurant details"
                  : "Set up your restaurant in a few simple steps"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16">
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/5 p-4 mb-6">
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              return (
                <button
                  key={step.id}
                  onClick={() =>
                    (isEdit || isCompleted) && setCurrentStep(step.id)
                  }
                  disabled={!isEdit && !isCompleted && step.id !== currentStep}
                  className={`flex-1 min-w-[100px] flex flex-col items-center gap-2 p-3 rounded-xl transition ${
                    isActive
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                      : isCompleted
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-stone-50 text-stone-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-white/20"
                        : isCompleted
                          ? "bg-emerald-200"
                          : "bg-stone-200"
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <Check size={16} />
                    ) : (
                      <step.icon size={16} />
                    )}
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="h-2 bg-stone-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{
                width: `${(completedSteps.length / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-900/5 p-6 sm:p-8 mb-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Store className="text-orange-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Basic Information
                  </h2>
                  <p className="text-sm text-stone-500">
                    Tell us about your restaurant
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    <Store size={14} />
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spice Garden Kitchen"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-stone-200 focus:border-orange-500 focus:ring-orange-500/20"} focus:ring-2 outline-none transition`}
                    {...register("name", { required: true })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      Restaurant name is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    <Sparkles size={14} />
                    Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Authentic flavors from grandma's kitchen"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    {...register("tagline")}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    <FileText size={14} />
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell customers about your restaurant, cuisine specialties, and what makes you unique..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition resize-none"
                    {...register("description")}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                    <Utensils size={14} />
                    Cuisine Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_TYPES.map((cuisine) => (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          selectedCuisines.includes(cuisine)
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Location Details
                  </h2>
                  <p className="text-sm text-stone-500">
                    Where is your restaurant located?
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                    <MapPin size={14} />
                    Full Address
                  </label>
                  <input
                    type="text"
                    placeholder="Shop No, Building Name, Street"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    {...register("address")}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      <Building2 size={14} />
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                      {...register("city")}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                      {...register("state")}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 400001"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                      {...register("pincode")}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                      <Globe size={14} />
                      Country
                    </label>
                    <input
                      type="text"
                      placeholder="India"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                      {...register("country")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Phone className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Contact Information
                  </h2>
                  <p className="text-sm text-stone-500">
                    How can customers reach you?
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
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
                      <Mail size={14} />
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="restaurant@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                      {...register("email")}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Tip:</strong> Your contact details will be visible
                    to customers. Make sure they are accurate and monitored
                    regularly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Operating Hours */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Operating Hours
                  </h2>
                  <p className="text-sm text-stone-500">
                    When is your kitchen open?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className={`p-4 rounded-xl border transition ${operatingHours[day]?.closed ? "bg-stone-50 border-stone-200" : "bg-white border-stone-200"}`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!operatingHours[day]?.closed}
                            onChange={(e) =>
                              updateHours(day, "closed", !e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-stone-200 peer-checked:bg-orange-500 rounded-full transition"></div>
                          <div className="absolute w-5 h-5 bg-white rounded-full left-0.5 top-0.5 peer-checked:translate-x-5 transition shadow"></div>
                        </label>
                        <span
                          className={`font-semibold ${operatingHours[day]?.closed ? "text-stone-400" : "text-stone-900"}`}
                        >
                          {day}
                        </span>
                      </div>
                      {!operatingHours[day]?.closed && (
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={operatingHours[day]?.open || "09:00"}
                            onChange={(e) =>
                              updateHours(day, "open", e.target.value)
                            }
                            className="px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                          />
                          <span className="text-stone-400">to</span>
                          <input
                            type="time"
                            value={operatingHours[day]?.close || "22:00"}
                            onChange={(e) =>
                              updateHours(day, "close", e.target.value)
                            }
                            className="px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                          />
                        </div>
                      )}
                      {operatingHours[day]?.closed && (
                        <span className="text-sm text-stone-400 italic">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Features */}
          {currentStep === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Utensils className="text-rose-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Features & Payment
                  </h2>
                  <p className="text-sm text-stone-500">
                    What services do you offer?
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-stone-900 mb-3">
                    Restaurant Features
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "pure_veg",
                        label: "Pure Vegetarian",
                        icon: Leaf,
                        desc: "100% veg kitchen",
                      },
                      {
                        id: "has_parking",
                        label: "Parking Available",
                        icon: Car,
                        desc: "Parking space",
                      },
                      {
                        id: "has_wifi",
                        label: "Free Wi-Fi",
                        icon: Wifi,
                        desc: "Internet access",
                      },
                    ].map((feature) => (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() =>
                          setFeatures((prev) => ({
                            ...prev,
                            [feature.id]:
                              !prev[feature.id as keyof typeof prev],
                          }))
                        }
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          features[feature.id as keyof typeof features]
                            ? "border-orange-500 bg-orange-50"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <feature.icon
                          className={
                            features[feature.id as keyof typeof features]
                              ? "text-orange-500"
                              : "text-stone-400"
                          }
                          size={24}
                        />
                        <p className="font-semibold text-stone-900 mt-2">
                          {feature.label}
                        </p>
                        <p className="text-xs text-stone-500">{feature.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-stone-900 mb-3">
                    Accepted Payment Methods
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "accepts_card",
                        label: "Cards",
                        desc: "Credit/Debit",
                      },
                      {
                        id: "accepts_upi",
                        label: "UPI",
                        desc: "Google Pay, PhonePe",
                      },
                      {
                        id: "accepts_cash",
                        label: "Cash",
                        desc: "Cash on delivery",
                      },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() =>
                          setPayments((prev) => ({
                            ...prev,
                            [method.id]: !prev[method.id as keyof typeof prev],
                          }))
                        }
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          payments[method.id as keyof typeof payments]
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <CreditCard
                          className={
                            payments[method.id as keyof typeof payments]
                              ? "text-emerald-500"
                              : "text-stone-400"
                          }
                          size={24}
                        />
                        <p className="font-semibold text-stone-900 mt-2">
                          {method.label}
                        </p>
                        <p className="text-xs text-stone-500">{method.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Gallery */}
          {currentStep === 6 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <ImagePlus className="text-amber-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    Restaurant Gallery
                  </h2>
                  <p className="text-sm text-stone-500">
                    Upload appetizing photos of your food
                  </p>
                </div>
              </div>

              {!restaurantId ? (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl">
                  <ImagePlus
                    size={48}
                    className="mx-auto text-stone-300 mb-4"
                  />
                  <p className="text-stone-500">
                    Please complete previous steps first to upload images
                  </p>
                </div>
              ) : (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-orange-400 rounded-2xl p-8 text-center cursor-pointer transition group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2
                          size={40}
                          className="animate-spin text-orange-500 mb-3"
                        />
                        <p className="text-stone-600">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-stone-100 group-hover:bg-orange-100 flex items-center justify-center mb-4 transition">
                          <Upload
                            size={28}
                            className="text-stone-400 group-hover:text-orange-500 transition"
                          />
                        </div>
                        <p className="font-semibold text-stone-900 mb-1">
                          Click to upload images
                        </p>
                        <p className="text-sm text-stone-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden group"
                        >
                          <Image
                            src={img}
                            alt={`Image ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="200px"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              onClick={() => handleRemoveImage(img)}
                              className="p-2 bg-white rounded-xl text-red-500 hover:bg-red-50 transition"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            {currentStep === STEPS.length ? (
              <button
                onClick={finishOnboarding}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 transition"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Finish Setup
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 transition"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Next"
                )}
                {!saving && <ArrowRight size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Completion Status */}
        {completedSteps.length === STEPS.length && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Check size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your restaurant is ready!</h3>
                <p className="text-white/80">
                  All steps completed. You can now start receiving orders.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="h-12" />
    </main>
  );
}
