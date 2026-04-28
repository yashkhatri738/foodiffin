"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  uploadRestaurantImage,
  addImageToRestaurant,
  removeImageFromRestaurant,
} from "@/lib/supabase/restaurant.action";

interface RestaurantForm {
  name: string;
  description: string;
  email: string;
  phone: string;
  country: string;
  address: string;
}

export default function OnboardingPage() {
  const router = useRouter();
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
      const res = await getRestaurant();
      if (res.success && res.data) {
        const r = res.data as any;
        setRestaurantId(r.id);
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
          const newId = (result.data as any).id;
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
      <div className="fd-profile-root">
        <div className="fd-profile-loader">
          <Loader2 className="animate-spin" size={32} color="#e8590c" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-profile-root">
      {/* Header */}
      <div className="fd-onboard-header">
        <div className="fd-onboard-header-inner">
          <Link href="/profile" className="fd-profile-back">
            <ArrowLeft size={18} />
            <span>Back to Profile</span>
          </Link>
          <div className="fd-onboard-header-title">
            <div className="fd-onboard-icon">
              <Store size={24} />
            </div>
            <div>
              <h1>{isEdit ? "Manage Restaurant" : "Restaurant Onboarding"}</h1>
              <p>
                {isEdit
                  ? "Update your restaurant details and images"
                  : "Set up your restaurant to start receiving orders"}
              </p>
            </div>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="fd-onboard-steps">
          <div className="fd-onboard-step fd-onboard-step-active">
            <div className="fd-onboard-step-dot">
              {isEdit ? <Check size={12} /> : "1"}
            </div>
            <span>Details</span>
          </div>
          <div className="fd-onboard-step-line" />
          <div
            className={`fd-onboard-step ${restaurantId ? "fd-onboard-step-active" : ""}`}
          >
            <div className="fd-onboard-step-dot">
              {images.length > 0 ? <Check size={12} /> : "2"}
            </div>
            <span>Images</span>
          </div>
          <div className="fd-onboard-step-line" />
          <div
            className={`fd-onboard-step ${isEdit && images.length > 0 ? "fd-onboard-step-active" : ""}`}
          >
            <div className="fd-onboard-step-dot">
              {isEdit && images.length > 0 ? <Check size={12} /> : "3"}
            </div>
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div className="fd-onboard-content">
        {/* Restaurant Details Form */}
        <div className="fd-profile-card">
          <h3 className="fd-onboard-section-title">
            <Store size={20} />
            Restaurant Details
          </h3>

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
        <div className="fd-profile-card">
          <h3 className="fd-onboard-section-title">
            <ImagePlus size={20} />
            Restaurant Images
          </h3>

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
          <div className="fd-onboard-success">
            <Check size={20} />
            <div>
              <strong>Your restaurant is all set!</strong>
              <p>
                You can update your details or images anytime from your profile.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
