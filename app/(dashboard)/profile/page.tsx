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
} from "lucide-react";
import { getProfile, updateProfile } from "@/lib/supabase/profile.action";
import { getRestaurant } from "@/lib/supabase/restaurant.action";

interface ProfileForm {
  full_name: string;
  phone: string;
}

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
        getRestaurant(),
      ]);

      if (profileRes.success && profileRes.data) {
        const p = profileRes.data as any;
        reset({ full_name: p.full_name || "", phone: p.phone || "" });
        setEmail(p.email || "");
      }

      if (restaurantRes.success && restaurantRes.data) {
        setHasRestaurant(true);
        setRestaurantName((restaurantRes.data as any).name);
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
      <div className="fd-profile-root">
        <div className="fd-profile-loader">
          <Loader2 className="animate-spin" size={32} color="#e8590c" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-profile-root">
      {/* Header */}
      <div className="fd-profile-header">
        <div className="fd-profile-header-inner">
          <Link href="/" className="fd-profile-back">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <div className="fd-profile-header-title">
            <h1>My Profile</h1>
            <p>Manage your account details</p>
          </div>
        </div>
      </div>

      <div className="fd-profile-content">
        {/* Profile Card */}
        <div className="fd-profile-card">
          <div className="fd-profile-card-header">
            <div className="fd-profile-avatar">
              <span>{(email?.[0] || "U").toUpperCase()}</span>
            </div>
            <div className="fd-profile-info">
              <h2>{formState.defaultValues?.full_name || "User"}</h2>
              <p>{email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="fd-profile-form">
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
              <span className="fd-profile-hint">Email cannot be changed</span>
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

        {/* Restaurant Section */}
        <div className="fd-profile-card fd-profile-restaurant-card">
          <div className="fd-profile-restaurant-icon">
            <Store size={28} />
          </div>

          {hasRestaurant ? (
            <>
              <h3>Your Restaurant</h3>
              <p className="fd-profile-restaurant-name">{restaurantName}</p>
              <p className="fd-profile-restaurant-sub">
                Your restaurant is set up. Click below to update details.
              </p>
              <Link href="/onboarding" className="fd-profile-restaurant-btn">
                Manage Restaurant
                <ChevronRight size={18} />
              </Link>
            </>
          ) : (
            <>
              <h3>Add Your Restaurant</h3>
              <p className="fd-profile-restaurant-sub">
                Set up your restaurant profile to start receiving orders. Add
                your restaurant name, images, contact info, and more.
              </p>
              <Link
                href="/onboarding"
                className="fd-profile-restaurant-btn fd-profile-restaurant-btn-primary"
              >
                Get Started
                <ChevronRight size={18} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
