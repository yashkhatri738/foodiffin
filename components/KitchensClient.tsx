"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChefHat,
  Clock3,
  Heart,
  MapPin,
  Search,
  Star,
  Sparkles,
} from "lucide-react";
import { type Restaurant } from "@/components/HomeClient";

export default function KitchensClient({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;
    
    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((r) =>
        [r.name, r.description, r.country, r.address]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    // Rating filter
    if (minRating !== null) {
      result = result.filter((r) => {
        const rating = (r as any).average_rating || 4.8;
        return rating >= minRating;
      });
    }

    return result;
  }, [restaurants, searchQuery, minRating]);

  return (
    <main className="relative min-h-screen bg-stone-50 text-stone-850 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-orange-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-80 h-[350px] w-[350px] rounded-full bg-amber-100/30 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
            <Sparkles size={13} className="text-orange-500" />
            Verified Partners
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight sm:text-5xl">
            Our Culinary Kitchens
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm text-stone-500 leading-relaxed sm:text-base">
            Explore and subscribe to home-style daily tiffin kitchens, preparing food with fresh and organic ingredients.
          </p>
        </header>

        {/* Filter Toolbar */}
        <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
          <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-stone-200 px-4.5 py-2.5 transition focus-within:border-orange-500">
            <Search size={16} className="text-stone-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
              placeholder="Search by kitchen name, address, description..."
            />
          </div>

          {/* Rating filter selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
              Filter by:
            </span>
            <button
              onClick={() => setMinRating(null)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                minRating === null
                  ? "bg-orange-600 text-white shadow-sm shadow-orange-600/10"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Kitchens
            </button>
            <button
              onClick={() => setMinRating(4.8)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                minRating === 4.8
                  ? "bg-orange-600 text-white shadow-sm shadow-orange-600/10"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Star size={11} fill="currentColor" className={minRating === 4.8 ? "text-amber-300" : "text-amber-500"} />
              Top Rated (4.8+)
            </button>
            <button
              onClick={() => setMinRating(4.5)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                minRating === 4.5
                  ? "bg-orange-600 text-white shadow-sm shadow-orange-600/10"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Star size={11} fill="currentColor" className={minRating === 4.5 ? "text-amber-300" : "text-amber-500"} />
              High Rated (4.5+)
            </button>
          </div>
        </section>

        {/* Results count info */}
        <div className="mb-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Showing {filteredRestaurants.length} active kitchen{filteredRestaurants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid List */}
        {filteredRestaurants.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white py-16 px-4 text-center max-w-lg mx-auto shadow-sm">
            <ChefHat className="mx-auto mb-4 text-orange-300 animate-pulse" size={44} />
            <h3 className="text-lg font-bold text-stone-800">
              No kitchens match your selection
            </h3>
            <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
              We couldn't find any partner kitchens matching your search keywords or rating filter criteria. Try resetting filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setMinRating(null);
              }}
              className="mt-5 inline-flex h-9 items-center justify-center rounded-xl bg-stone-900 px-4 text-xs font-bold text-white transition hover:bg-stone-850"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRestaurants.map((restaurant) => {
              const rating = (restaurant as any).average_rating || 4.8;
              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-350 hover:shadow-xl hover:shadow-orange-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      {restaurant.images?.[0] ? (
                        <Image
                          src={restaurant.images[0]}
                          alt={restaurant.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-orange-400 to-amber-500 transition duration-500 group-hover:scale-105" />
                      )}
                      
                      <button className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-stone-500 shadow-sm backdrop-blur transition hover:text-rose-500">
                        <Heart size={14} />
                      </button>
                      
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 shadow-sm backdrop-blur">
                        <Star size={11} fill="#d97706" className="text-amber-500" />
                        {rating}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4">
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-orange-600 transition truncate">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                        <MapPin size={12} className="text-orange-500" />
                        {restaurant.address || restaurant.country || "Local Delivery Area"}
                      </p>
                      
                      {restaurant.description && (
                        <p className="mt-2 text-xs leading-relaxed text-stone-500 line-clamp-3">
                          {restaurant.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footing */}
                  <div className="border-t border-stone-100 p-4 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-stone-450">
                      <Clock3 size={13} className="text-stone-400" /> 
                      20-30 min delivery
                    </span>
                    
                    <span className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white transition group-hover:bg-orange-700">
                      View Menu
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
