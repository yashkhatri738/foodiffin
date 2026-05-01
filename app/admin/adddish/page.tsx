"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Upload,
  X,
  ImagePlus,
  DollarSign,
  Clock,
  Flame,
  Info,
} from "lucide-react";
import {
  createDish,
  updateDish,
  getDishById,
  uploadDishImage,
  type DishFormData,
} from "@/lib/dish.action";
import { getRestaurantForAdmin } from "@/lib/restaurant.action";
import Image from "next/image";

const categories = [
  "Thali",
  "Rice Bowl",
  "Curry",
  "Snacks",
  "Dessert",
  "Beverage",
  "Bread",
  "Other",
];

const spiceLevels = ["Mild", "Medium", "Hot", "Extra Hot"];

export default function AddDishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dishId = searchParams.get("id");
  const isEditMode = !!dishId;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const { register, handleSubmit, reset, setValue, formState } =
    useForm<DishFormData>();

  useEffect(() => {
    async function loadData() {
      // Get restaurant ID
      const resRes = await getRestaurantForAdmin();
      if (resRes.success && resRes.data) {
        setRestaurantId((resRes.data as any).id);
      }

      // Load dish data if editing
      if (isEditMode && dishId) {
        const dishRes = await getDishById(dishId);
        if (dishRes.success && dishRes.data) {
          const dish = dishRes.data as any;
          reset({
            name: dish.name,
            description: dish.description || "",
            price: dish.price,
            category: dish.category || "",
            is_available: dish.is_available ?? true,
            is_veg: dish.is_veg ?? true,
            preparation_time: dish.preparation_time || undefined,
            calories: dish.calories || undefined,
            spice_level: dish.spice_level || "",
          });
          setImageUrl(dish.image_url || "");
        }
      }
      setLoading(false);
    }
    loadData();
  }, [dishId, isEditMode, reset]);

  const onSubmit = async (data: DishFormData) => {
    if (!restaurantId) {
      toast.error("Restaurant not found");
      return;
    }

    setSaving(true);
    const dishData: DishFormData = {
      ...data,
      image_url: imageUrl || undefined,
      price: Number(data.price),
      preparation_time: data.preparation_time
        ? Number(data.preparation_time)
        : undefined,
      calories: data.calories ? Number(data.calories) : undefined,
    };

    const result = isEditMode
      ? await updateDish(dishId!, dishData)
      : await createDish(restaurantId, dishData);

    if (result.success) {
      toast.success(
        isEditMode ? "Dish updated successfully!" : "Dish created successfully!"
      );
      router.push("/admin/dashboard");
    } else {
      toast.error(result.error || "Failed to save dish");
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    const uploadRes = await uploadDishImage(formData);
    if (uploadRes.success && uploadRes.data) {
      setImageUrl(uploadRes.data);
      toast.success("Image uploaded!");
    } else {
      toast.error(uploadRes.error || "Upload failed");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={32} color="#e8590c" />
          <p className="text-sm text-stone-500">Loading dish...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <header className="portal-glass rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
          <ImagePlus size={14} />
          {isEditMode ? "Edit Dish" : "New Dish"}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isEditMode ? "Update dish details" : "Add a new dish"}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
          {isEditMode
            ? "Edit dish information and availability"
            : "Create a new menu item for your restaurant"}
        </p>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
      >
        {/* Main Form */}
        <div className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
          <h2 className="mb-4 text-lg font-bold tracking-tight">
            Dish Information
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div className="fd-profile-field">
              <label htmlFor="name">
                <Info size={16} />
                Dish Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Paneer Butter Masala"
                {...register("name", { required: "Dish name is required" })}
              />
              {formState.errors.name && (
                <span className="fd-profile-error">
                  {formState.errors.name.message}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="fd-profile-field">
              <label htmlFor="description">
                <Info size={16} />
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe your dish..."
                {...register("description")}
              />
            </div>

            {/* Price & Prep Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="fd-profile-field">
                <label htmlFor="price">
                  <DollarSign size={16} />
                  Price (₹) *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="99.00"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" },
                  })}
                />
                {formState.errors.price && (
                  <span className="fd-profile-error">
                    {formState.errors.price.message}
                  </span>
                )}
              </div>

              <div className="fd-profile-field">
                <label htmlFor="preparation_time">
                  <Clock size={16} />
                  Prep Time (min)
                </label>
                <input
                  id="preparation_time"
                  type="number"
                  placeholder="20"
                  {...register("preparation_time")}
                />
              </div>
            </div>

            {/* Category & Spice Level */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="fd-profile-field">
                <label htmlFor="category">Category</label>
                <select id="category" {...register("category")}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fd-profile-field">
                <label htmlFor="spice_level">
                  <Flame size={16} />
                  Spice Level
                </label>
                <select id="spice_level" {...register("spice_level")}>
                  <option value="">Select spice level</option>
                  {spiceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calories */}
            <div className="fd-profile-field">
              <label htmlFor="calories">Calories</label>
              <input
                id="calories"
                type="number"
                placeholder="350"
                {...register("calories")}
              />
            </div>

            {/* Toggles */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <input
                  id="is_veg"
                  type="checkbox"
                  className="h-5 w-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                  defaultChecked={true}
                  {...register("is_veg")}
                />
                <label
                  htmlFor="is_veg"
                  className="text-sm font-semibold text-stone-700"
                >
                  Vegetarian
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <input
                  id="is_available"
                  type="checkbox"
                  className="h-5 w-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                  defaultChecked={true}
                  {...register("is_available")}
                />
                <label
                  htmlFor="is_available"
                  className="text-sm font-semibold text-stone-700"
                >
                  Available
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <aside className="flex flex-col gap-4">
          <div className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
            <h2 className="mb-4 text-lg font-bold tracking-tight">
              Dish Image
            </h2>

            {imageUrl ? (
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={imageUrl}
                  alt="Dish"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                className="fd-onboard-upload-area cursor-pointer"
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
                      size={28}
                      className="animate-spin"
                      color="#e8590c"
                    />
                    <p>Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload size={28} strokeWidth={1.5} />
                    <p>Click to upload image</p>
                    <span>PNG, JPG up to 5MB</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="fd-profile-save-btn w-full"
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Dish"
                : "Create Dish"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Cancel
          </button>
        </aside>
      </form>
    </section>
  );
}