"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
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
  BadgeCheck,
  Clock3,
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

interface RestaurantForm {
  name: string;
  description: string;
  email: string;
  phone: string;
  country: string;
  address: string;
}

type RestaurantData = Partial<RestaurantForm> & {
  id?: string;
  images?: string[];
};

export default function OnboardingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  const { register, handleSubmit, reset, formState } =
    useForm<RestaurantForm>();

  useEffect(() => {
    async function load() {
      const res = await getRestaurantById();
      if (res.success && res.data) {
        const r = res.data as RestaurantData;
        setRestaurantId(r.id || null);
        setImages(r.images || []);
        setIsEdit(true);
        reset({
          name: r.name || "",
          description: r.description || "",
          email: r.email || "",
          phone: r.phone || "",
          country: r.country || "",
          address: r.address || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: RestaurantForm) => {
    setSaving(true);
    try {
      if (isEdit && restaurantId) {
        const result = await updateRestaurant(restaurantId, data);
        if (result.success) {
          toast.success("Restaurant updated successfully!");
        } else {
          toast.error(result.error || "Failed to update");
        }
      } else {
        const result = await createRestaurant(data);
        if (result.success && result.data) {
          const newId = (result.data as RestaurantData).id;
          if (!newId) {
            toast.error("Restaurant created, but no id was returned");
            setSaving(false);
            return;
          }
          setRestaurantId(newId);
          setIsEdit(true);
          toast.success("Restaurant created! You can now add images.");
        } else {
          toast.error(result.error || "Failed to create restaurant");
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
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

  if (loading) {
    return (
      <div className="user-portal-shell min-h-screen">
        <div className="fd-profile-loader">
          <Loader2 className="animate-spin" size={32} color="#e8590c" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="user-portal-shell min-h-screen overflow-hidden p-3 text-stone-950 sm:p-5">
      <div className="user-portal-glow user-portal-glow-one" />
      <div className="user-portal-glow user-portal-glow-two" />

      <section className="relative mx-auto flex max-w-6xl flex-col gap-4">
        <header className="user-glass rounded-[30px] border border-white/70 p-5 shadow-xl shadow-stone-900/5 sm:p-7">
          <Link
            href="/profile"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-white hover:text-orange-700"
          >
            <ArrowLeft size={18} />
            Profile
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                <Sparkles size={14} />
                Partner setup
              </div>
              <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                {isEdit ? "Tune your restaurant profile" : "Launch your kitchen"}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
                {isEdit
                  ? "Update your details, gallery, and customer-facing story in one focused flow."
                  : "Add the essentials customers need before they order from your kitchen."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[24px] bg-stone-950 p-4 text-white shadow-2xl shadow-orange-500/20">
                <div className="mb-6 flex items-center justify-between">
                  <Store className="text-orange-200" size={22} />
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                    {isEdit ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-2xl font-black">
                  {images.length || 0} images
                </p>
                <p className="text-xs font-semibold text-white/55">
                  Gallery assets ready
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <div className="user-step-card user-step-card-active">
              <div className="user-step-dot">
                {isEdit ? <Check size={13} /> : "1"}
              </div>
              <div>
                <p className="font-black">Details</p>
                <p className="text-xs text-stone-500">Kitchen identity</p>
              </div>
            </div>
            <div className={`user-step-card ${restaurantId ? "user-step-card-active" : ""}`}>
              <div className="user-step-dot">
                {images.length > 0 ? <Check size={13} /> : "2"}
              </div>
              <div>
                <p className="font-black">Gallery</p>
                <p className="text-xs text-stone-500">Food photos</p>
              </div>
            </div>
            <div
              className={`user-step-card ${
                isEdit && images.length > 0 ? "user-step-card-active" : ""
              }`}
            >
              <div className="user-step-dot">
                {isEdit && images.length > 0 ? <Check size={13} /> : "3"}
              </div>
              <div>
                <p className="font-black">Ready</p>
                <p className="text-xs text-stone-500">Portal enabled</p>
              </div>
            </div>
          </div>
        </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        {/* Restaurant Details Form */}
        <div className="user-card rounded-[30px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-tight">
                Restaurant details
              </h3>
              <p className="text-sm text-stone-500">
                Public information used on your restaurant listing.
              </p>
            </div>
            <BadgeCheck size={22} className="text-emerald-600" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="fd-onboard-form">
            <div className="fd-onboard-grid">
              <div className="fd-profile-field">
                <label htmlFor="r-name">
                  <Store size={16} />
                  Restaurant Name *
                </label>
                <input
                  id="r-name"
                  type="text"
                  placeholder="e.g. Spice Garden Kitchen"
                  {...register("name", {
                    required: "Restaurant name is required",
                  })}
                />
                {formState.errors.name && (
                  <span className="fd-profile-error">
                    {formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="fd-profile-field">
                <label htmlFor="r-email">
                  <Mail size={16} />
                  Contact Email
                </label>
                <input
                  id="r-email"
                  type="email"
                  placeholder="restaurant@example.com"
                  {...register("email")}
                />
              </div>

              <div className="fd-profile-field">
                <label htmlFor="r-phone">
                  <Phone size={16} />
                  Contact Number
                </label>
                <input
                  id="r-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                />
              </div>

              <div className="fd-profile-field">
                <label htmlFor="r-country">
                  <Globe size={16} />
                  Country
                </label>
                <input
                  id="r-country"
                  type="text"
                  placeholder="India"
                  {...register("country")}
                />
              </div>
            </div>

            <div className="fd-profile-field">
              <label htmlFor="r-address">
                <MapPin size={16} />
                Full Address
              </label>
              <input
                id="r-address"
                type="text"
                placeholder="123 Main Street, City, State, PIN"
                {...register("address")}
              />
            </div>

            <div className="fd-profile-field">
              <label htmlFor="r-desc">
                <FileText size={16} />
                Description
              </label>
              <textarea
                id="r-desc"
                rows={4}
                placeholder="Tell customers about your restaurant — cuisine type, specialties, story..."
                {...register("description")}
              />
            </div>

            <button
              type="submit"
              className="fd-profile-save-btn"
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isEdit ? (
                <Check size={18} />
              ) : (
                <Store size={18} />
              )}
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Restaurant"
                  : "Create Restaurant"}
            </button>
          </form>
        </div>

        {/* Images Section */}
        <aside className="flex flex-col gap-4">
        <div className="user-card rounded-[30px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-tight">
                Restaurant images
              </h3>
              <p className="text-sm text-stone-500">
                Upload clean, bright photos of your food.
              </p>
            </div>
            <ImagePlus size={22} className="text-orange-700" />
          </div>

          {!restaurantId ? (
            <div className="fd-onboard-images-placeholder">
              <ImagePlus size={40} strokeWidth={1.5} />
              <p>Save your restaurant details first to upload images</p>
            </div>
          ) : (
            <>
              {/* Upload area */}
              <div
                className="fd-onboard-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading ? (
                  <>
                    <Loader2
                      size={32}
                      className="animate-spin"
                      color="#e8590c"
                    />
                    <p>Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload size={32} strokeWidth={1.5} />
                    <p>Click to upload images</p>
                    <span>PNG, JPG up to 5MB</span>
                  </>
                )}
              </div>

              {/* Image grid */}
              {images.length > 0 && (
                <div className="fd-onboard-images-grid">
                  {images.map((img, idx) => (
                    <div key={idx} className="fd-onboard-image-card">
                      <Image
                        src={img}
                        alt={`Restaurant image ${idx + 1}`}
                        fill
                        className="object-cover rounded-xl"
                        sizes="200px"
                      />
                      <button
                        onClick={() => handleRemoveImage(img)}
                        className="fd-onboard-image-remove"
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Success banner */}
        {isEdit && images.length > 0 && (
          <div className="user-card rounded-[30px] border border-emerald-200 bg-emerald-50/90 p-5 text-emerald-800 shadow-xl shadow-emerald-900/5">
            <Check size={22} />
            <div>
              <strong>Your restaurant is all set!</strong>
              <p>
                You can update your details or images anytime from your profile.
              </p>
            </div>
          </div>
        )}
          <div className="user-card rounded-[30px] border border-white/75 bg-stone-950 p-5 text-white shadow-2xl shadow-stone-950/20">
            <Clock3 className="mb-6 text-orange-200" size={24} />
            <h3 className="text-xl font-black tracking-tight">
              Approval checklist
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Complete details and add at least one image before switching into
              full admin operations.
            </p>
          </div>
        </aside>
      </div>
      </section>
    </main>
  );
}
