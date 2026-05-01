"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Search,
  Grid,
  List,
  ChefHat,
  DollarSign,
  Clock,
  Flame,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getDishesByRestaurant,
  deleteDish,
  toggleDishAvailability,
} from "@/lib/dish.action";
import { getRestaurantForAdmin } from "@/lib/restaurant.action";

type Dish = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  is_available: boolean;
  is_veg: boolean;
  image_url?: string;
  preparation_time?: number;
  spice_level?: string;
  created_at: string;
};

export default function DishesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    loadDishes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredDishes(
        dishes.filter(
          (dish) =>
            dish.name.toLowerCase().includes(query) ||
            dish.category?.toLowerCase().includes(query) ||
            dish.description?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredDishes(dishes);
    }
  }, [searchQuery, dishes]);

  const loadDishes = async () => {
    const resRes = await getRestaurantForAdmin();
    if (resRes.success && resRes.data) {
      const restaurantId = (resRes.data as any).id;
      const dishRes = await getDishesByRestaurant(restaurantId);
      if (dishRes.success && dishRes.data) {
        setDishes(dishRes.data as Dish[]);
        setFilteredDishes(dishRes.data as Dish[]);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (dishId: string, dishName: string) => {
    if (!confirm(`Are you sure you want to delete "${dishName}"?`)) return;

    const result = await deleteDish(dishId);
    if (result.success) {
      toast.success("Dish deleted successfully!");
      setDishes((prev) => prev.filter((d) => d.id !== dishId));
    } else {
      toast.error(result.error || "Failed to delete dish");
    }
  };

  const handleToggleAvailability = async (dish: Dish) => {
    const result = await toggleDishAvailability(dish.id, !dish.is_available);
    if (result.success) {
      toast.success(
        dish.is_available ? "Dish marked unavailable" : "Dish marked available"
      );
      setDishes((prev) =>
        prev.map((d) =>
          d.id === dish.id ? { ...d, is_available: !d.is_available } : d
        )
      );
    } else {
      toast.error(result.error || "Failed to update availability");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={32} color="#e8590c" />
          <p className="text-sm text-stone-500">Loading dishes...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <header className="portal-glass flex flex-col gap-4 rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
            <ChefHat size={14} />
            Menu Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your Dishes
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-600">
            Manage your menu items, pricing, and availability
          </p>
        </div>

        <Link
          href="/admin/adddish"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700"
        >
          <Plus size={17} />
          Add Dish
        </Link>
      </header>

      {/* Controls */}
      <div className="portal-card flex flex-col gap-3 rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2">
          <Search size={16} className="text-stone-400" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              viewMode === "grid"
                ? "bg-orange-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              viewMode === "table"
                ? "bg-orange-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredDishes.length === 0 ? (
        <div className="portal-card flex flex-col items-center justify-center rounded-[24px] border border-white/75 bg-white/82 p-12 text-center shadow-xl shadow-stone-900/5">
          <ChefHat size={48} className="mb-4 text-stone-300" />
          <h3 className="text-lg font-bold text-stone-700">
            {searchQuery ? "No dishes found" : "No dishes yet"}
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {searchQuery
              ? "Try a different search term"
              : "Start by adding your first dish to the menu"}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/adddish"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              <Plus size={17} />
              Add Your First Dish
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDishes.map((dish) => (
            <article
              key={dish.id}
              className="portal-card group relative overflow-hidden rounded-[20px] border border-white/75 bg-white/82 shadow-xl shadow-stone-900/5 transition hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                {dish.image_url ? (
                  <Image
                    src={dish.image_url}
                    alt={dish.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ChefHat size={48} className="text-stone-300" />
                  </div>
                )}
                {!dish.is_available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                    <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-800">{dish.name}</h3>
                      <span
                        className={`h-2 w-2 rounded-full ${dish.is_veg ? "bg-green-600" : "bg-red-600"}`}
                      />
                    </div>
                    {dish.category && (
                      <p className="text-xs text-stone-500">{dish.category}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    ₹{dish.price}
                  </p>
                </div>

                {dish.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-stone-600">
                    {dish.description}
                  </p>
                )}

                <div className="mb-3 flex flex-wrap gap-2 text-xs text-stone-500">
                  {dish.preparation_time && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {dish.preparation_time}m
                    </span>
                  )}
                  {dish.spice_level && (
                    <span className="flex items-center gap-1">
                      <Flame size={12} />
                      {dish.spice_level}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/adddish?id=${dish.id}`)}
                    className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 text-sm font-semibold text-white transition hover:bg-orange-700"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(dish)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      dish.is_available
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {dish.is_available ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id, dish.name)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700 transition hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="portal-card overflow-hidden rounded-[24px] border border-white/75 bg-white/82 shadow-xl shadow-stone-900/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-600">
                    Dish
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-600">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-stone-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-stone-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDishes.map((dish) => (
                  <tr
                    key={dish.id}
                    className="transition hover:bg-orange-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-stone-100">
                          {dish.image_url ? (
                            <Image
                              src={dish.image_url}
                              alt={dish.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ChefHat size={20} className="text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-stone-800">
                              {dish.name}
                            </p>
                            <span
                              className={`h-2 w-2 rounded-full ${dish.is_veg ? "bg-green-600" : "bg-red-600"}`}
                            />
                          </div>
                          {dish.preparation_time && (
                            <p className="text-xs text-stone-500">
                              {dish.preparation_time}m prep
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {dish.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-orange-600">
                      ₹{dish.price}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          dish.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dish.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/adddish?id=${dish.id}`)
                          }
                          className="flex h-8 items-center gap-1 rounded-lg bg-orange-100 px-3 text-xs font-semibold text-orange-700 transition hover:bg-orange-200"
                        >
                          <Edit size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(dish)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            dish.is_available
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {dish.is_available ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id, dish.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 transition hover:bg-red-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
