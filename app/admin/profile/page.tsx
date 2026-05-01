"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Store,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  ImagePlus,
  X,
  Loader2,
  Save,
  Upload,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import {
  getRestaurantForAdmin,
  updateRestaurantAsAdmin,
  uploadRestaurantImage,
  addImageToRestaurant,
  removeImageFromRestaurant,
} from "@/lib/restaurant.action";

interface RestaurantForm {
  name: string;
  description: string;
  phone: string;
  country: string;
  address: string;
}

type RestaurantData = Partial<RestaurantForm> & {
  id?: string;
  email?: string;
  images?: string[];
};

export default function AdminProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantEmail, setRestaurantEmail] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState } =
    useForm<RestaurantForm>();

  useEffect(() => {
    async function load() {
      const res = await getRestaurantForAdmin();
      if (res.success && res.data) {
        const r = res.data as RestaurantData;
        setRestaurantId(r.id || null);
        setRestaurantEmail(r.email || "");
        setImages(r.images || []);
        reset({
          name: r.name || "",
          description: r.description || "",
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
    if (!restaurantId) return;
    setSaving(true);
    const result = await updateRestaurantAsAdmin(restaurantId, data);
    if (result.success) {
      toast.success("Restaurant updated successfully!");
    } else {
      toast.error(result.error || "Failed to update");
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
      <div className="portal-shell min-h-screen">
        <div className="fd-profile-loader">
          <Loader2 className="animate-spin" size={32} color="#e8590c" />
          <p>Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="portal-shell min-h-screen">
        <div className="fd-profile-loader">
          <Store size={32} className="text-stone-400" />
          <p>No restaurant found for this account.</p>
          <Link
            href="/admin/dashboard"
            className="mt-2 text-sm font-semibold text-orange-600 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <header className="portal-glass rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              <Sparkles size={14} />
              Admin profile
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {formState.defaultValues?.name || "Your Restaurant"}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
              Manage your restaurant details, images, and public listing
              information.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2 text-sm font-bold text-white">
            <BadgeCheck size={16} />
            Partner
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Restaurant Form */}
        <div className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Restaurant details
              </h2>
              <p className="text-sm text-stone-500">
                Update your public listing information.
              </p>
            </div>
            <Store size={20} className="text-orange-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="fd-onboard-form">
            <div className="fd-onboard-grid">
              <div className="fd-profile-field">
                <label htmlFor="r-name">
                  <Store size={16} />
                  Restaurant Name
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
                <label htmlFor="r-email-display">
                  <Mail size={16} />
                  Restaurant Email
                </label>
                <input
                  id="r-email-display"
                  type="email"
                  value={restaurantEmail}
                  disabled
                  className="fd-profile-disabled"
                />
                <span className="fd-profile-hint">Email cannot be changed</span>
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
                rows={3}
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
              ) : (
                <Save size={18} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Images Section */}
        <aside className="flex flex-col gap-4">
          <div className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Restaurant images
                </h2>
                <p className="text-sm text-stone-500">
                  Upload photos of your food and kitchen.
                </p>
              </div>
              <ImagePlus size={20} className="text-orange-700" />
            </div>

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
                  <Loader2 size={28} className="animate-spin" color="#e8590c" />
                  <p>Uploading...</p>
                </>
              ) : (
                <>
                  <Upload size={28} strokeWidth={1.5} />
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
                      className="rounded-xl object-cover"
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

            {images.length === 0 && (
              <p className="mt-3 text-center text-xs text-stone-400">
                No images uploaded yet
              </p>
            )}
          </div>

          {/* Quick info card */}
          <div className="portal-card rounded-[24px] border border-white/75 bg-stone-950 p-4 text-white shadow-lg shadow-stone-950/20">
            <Store className="mb-4 text-orange-200" size={22} />
            <h3 className="text-base font-bold tracking-tight">
              Listing preview
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-white/60">
              Your restaurant details and images are shown to customers on the
              home page. Keep them updated for more orders.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-orange-200">
              <ImagePlus size={14} />
              {images.length} image{images.length !== 1 ? "s" : ""} uploaded
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
