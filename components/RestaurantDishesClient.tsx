"use client";

import { useState, useMemo } from "react";
import { ChefHat, SlidersHorizontal, X } from "lucide-react";
import DishCard, { type DishData } from "@/components/DishCard";

interface Props {
  dishes: DishData[];
  categories: string[];
  restaurantId: string;
  restaurantName: string;
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
}: Props) {
  const maxPrice = dishes.length ? Math.max(...dishes.map((d) => d.price)) : 500;
  const minPrice = dishes.length ? Math.min(...dishes.map((d) => d.price)) : 0;

  const spiceLevels = Array.from(
    new Set(dishes.map((d) => d.spice_level).filter(Boolean)),
  ) as string[];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceMin: minPrice,
    priceMax: maxPrice,
    vegOnly: null,
    spiceLevels: [],
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

  return (
    <div>
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
        {/* Sidebar header */}
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

        {/* Sidebar body */}
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

        {/* Sticky apply button */}
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
    </div>
  );
}