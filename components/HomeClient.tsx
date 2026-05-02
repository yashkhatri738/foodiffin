"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  Clock3,
  Heart,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";

export type Restaurant = {
  id: string;
  name: string;
  description?: string | null;
  images?: string[] | null;
  country?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export default function HomeClient({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return restaurants;
    return restaurants.filter((r) =>
      [r.name, r.description, r.country, r.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [restaurants, searchQuery]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-50 text-stone-800">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-[600px] h-[400px] w-[400px] rounded-full bg-amber-100/40 blur-3xl" />

      {/* ─── Hero Section ─── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        {/* Left: Text */}
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-600">
            <span className="h-1 w-1 rounded-full bg-orange-500" />
            #1 Food Delivery
          </div>

          <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            We Offer <span className="text-orange-600">Delicious</span> Food And
            Quick Service
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base">
            Fresh home-style meals from verified local kitchens delivered to
            your doorstep. Tiffin subscriptions starting at just ₹99.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <a
              href="#restaurants"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-700"
            >
              Order Now
              <ArrowRight size={15} />
            </a>
            <Link
              href="/profile"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-orange-200"
            >
              My Profile
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-8 flex gap-6">
            <div>
              <p className="text-2xl font-bold text-stone-800">120+</p>
              <p className="text-xs text-stone-400">Kitchens</p>
            </div>
            <div className="h-10 w-px bg-stone-200" />
            <div>
              <p className="text-2xl font-bold text-orange-600">₹99</p>
              <p className="text-xs text-stone-400">Starting at</p>
            </div>
            <div className="h-10 w-px bg-stone-200" />
            <div>
              <p className="text-2xl font-bold text-stone-800">32m</p>
              <p className="text-xs text-stone-400">Avg delivery</p>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative">
          <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-3xl shadow-lg">
            <Image
              src="/Hero.jpg"
              alt="Delicious home-style food"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5" />
          </div>
          {/* Float badge top-right */}
          <div className="absolute -right-1 top-8 hidden rounded-xl border border-stone-100 bg-white px-3 py-2 shadow-md sm:block">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-amber-500" fill="#f59e0b" />
              <span className="text-xs font-medium text-stone-600">
                4.8 Rating
              </span>
            </div>
          </div>
          {/* Float badge bottom-left */}
          <div className="absolute -left-1 bottom-10 hidden rounded-xl border border-stone-100 bg-white px-3 py-2 shadow-md sm:block">
            <div className="flex items-center gap-2">
              <Clock3 size={14} className="text-emerald-500" />
              <span className="text-xs font-medium text-stone-600">
                30 min delivery
              </span>
            </div>
          </div>
          {/* Decorative blob */}
          <div className="absolute -bottom-4 -right-4 -z-10 h-48 w-48 rounded-full bg-orange-100/60 blur-2xl" />
        </div>
      </section>

      {/* ─── Restaurant Grid ─── */}
      <section
        id="restaurants"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
              Nearby kitchens
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-800 sm:text-3xl">
              Popular Restaurants
            </h2>
          </div>
          {/* Mobile search */}
          <div className="flex h-9 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 sm:hidden">
            <Search size={14} className="text-stone-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
              placeholder="Search kitchens"
            />
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <ChefHat className="mx-auto mb-3 text-orange-400" size={32} />
            <h3 className="text-lg font-semibold text-stone-700">
              No kitchens found
            </h3>
            <p className="mt-1 text-sm text-stone-400">
              Try a different search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurant/${restaurant.id}`}
                className="group overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md block"
              >
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
                    <Image
                      src="/hero2.jpg"
                      alt={restaurant.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                  <button className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-stone-500 shadow-sm backdrop-blur transition hover:text-rose-500">
                    <Heart size={14} />
                  </button>
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-amber-700 shadow-sm backdrop-blur">
                    <Star size={10} fill="#d97706" /> 4.8
                  </div>
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-semibold text-stone-800">
                    {restaurant.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400">
                    <MapPin size={11} />
                    {restaurant.address || restaurant.country || "Near you"}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-400">
                    {restaurant.description ||
                      "Fresh meals, made with love and care."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Clock3 size={11} /> 25-35 min
                    </span>
                    <span className="rounded-lg bg-orange-600 px-3 py-1 text-xs font-medium text-white transition group-hover:bg-orange-700">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Footer ─── */}
      <footer id="about" className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6">
        <div className="flex flex-col gap-2 rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-600 text-white">
              <ChefHat size={14} />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-700">Foodiffin</p>
              <p className="text-[11px] text-stone-400">
                Fresh meals, happy bellies.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-stone-400">
            © {new Date().getFullYear()} Foodiffin. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
