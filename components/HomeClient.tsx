"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Bell,
  ChefHat,
  Clock3,
  Heart,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  User,
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

const categories = ["All", "Tiffin", "Thali", "Lunch", "Dinner", "Healthy"];

const highlights = [
  { label: "Fresh kitchens", value: "120+", icon: ChefHat },
  { label: "Avg delivery", value: "32m", icon: Truck },
  { label: "Starting at", value: "₹99", icon: BadgeIndianRupee },
];

const steps = [
  {
    title: "Pick a kitchen",
    text: "Browse verified home chefs and restaurant partners near you.",
    icon: Store,
  },
  {
    title: "Choose your plan",
    text: "Order once or set a weekly tiffin schedule that fits your day.",
    icon: PackageCheck,
  },
  {
    title: "Eat fresh",
    text: "Track prep, delivery, and saved favorites from your profile.",
    icon: ShoppingBag,
  },
];

export default function HomeClient({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const haystack = [
        restaurant.name,
        restaurant.description,
        restaurant.country,
        restaurant.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      const matchesCategory =
        activeCategory === "All" || haystack.includes(activeCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, restaurants, searchQuery]);

  const featuredRestaurants =
    filteredRestaurants.length > 0
      ? filteredRestaurants
      : restaurants.slice(0, 6);

  return (
    <main className="home-shell min-h-screen overflow-hidden text-stone-950">
      <div className="home-glow home-glow-one" />
      <div className="home-glow home-glow-two" />

      <nav className="home-nav sticky top-0 z-50 border-b border-white/60">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-stone-950 text-white shadow-xl shadow-orange-500/20">
              <ChefHat size={23} />
            </span>
            <span className="text-xl font-black tracking-tight">
              <span className="text-orange-600">Food</span>iffin
            </span>
          </Link>

          <div className="ml-5 hidden items-center gap-1 lg:flex">
            <a href="#restaurants" className="home-nav-link">
              Kitchens
            </a>
            <a href="#plans" className="home-nav-link">
              Plans
            </a>
            <a href="#how-it-works" className="home-nav-link">
              How it works
            </a>
          </div>

          <div className="ml-auto hidden h-12 min-w-[280px] items-center gap-2 rounded-2xl bg-white/80 px-4 shadow-inner shadow-stone-900/5 md:flex">
            <Search size={18} className="text-stone-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400"
              placeholder="Search kitchens, thalis, cities"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="grid h-7 w-7 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-900"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <Link
            href="/profile"
            className="hidden h-12 items-center gap-2 rounded-2xl bg-white/85 px-4 text-sm font-black text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white sm:flex"
          >
            <User size={18} />
            Profile
          </Link>
          <Link
            href="/onboarding"
            className="hidden h-12 items-center gap-2 rounded-2xl bg-orange-600 px-4 text-sm font-black text-white shadow-xl shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700 sm:flex"
          >
            <Store size={18} />
            Partner
          </Link>
          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="ml-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/85 text-stone-800 shadow-sm sm:ml-0 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mx-auto grid max-w-7xl gap-2 px-4 pb-4 sm:px-6 lg:hidden">
            <a href="#restaurants" className="home-mobile-link">
              Kitchens
            </a>
            <a href="#plans" className="home-mobile-link">
              Plans
            </a>
            <Link href="/profile" className="home-mobile-link">
              Profile
            </Link>
            <Link href="/onboarding" className="home-mobile-link">
              Partner setup
            </Link>
          </div>
        )}
      </nav>

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-12">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-700 shadow-sm">
            <Sparkles size={14} />
            Fresh daily tiffins
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
            Home-style meals from kitchens you can trust.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
            Foodiffin brings fresh thalis, tiffin plans, and comfort meals from
            verified local kitchens to your door without the daily food puzzle.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#restaurants"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-stone-950 px-6 text-sm font-black text-white shadow-2xl shadow-stone-950/20 transition hover:-translate-y-0.5"
            >
              Explore kitchens
              <ArrowRight size={18} />
            </a>
            <Link
              href="/profile"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/85 px-6 text-sm font-black text-stone-900 shadow-xl shadow-stone-900/5 transition hover:-translate-y-0.5 hover:bg-white"
            >
              My food portal
              <User size={18} />
            </Link>
          </div>

          <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="home-card rounded-[24px] border border-white/75 bg-white/78 p-4 shadow-xl shadow-stone-900/5"
              >
                <item.icon className="mb-4 text-orange-700" size={21} />
                <p className="text-2xl font-black">{item.value}</p>
                <p className="text-xs font-bold text-stone-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[560px]">
          <div className="home-hero-frame absolute inset-0 overflow-hidden rounded-[42px] shadow-2xl shadow-stone-950/20">
            <Image
              src="/Hero.jpg"
              alt="Fresh Indian tiffin meal"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/12 to-transparent" />
          </div>

          <div className="absolute bottom-5 left-5 right-5 rounded-[30px] border border-white/20 bg-white/18 p-4 text-white shadow-2xl backdrop-blur-xl sm:left-8 sm:right-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-100">
                  Tonight&apos;s pick
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Comfort thali with dal, sabzi, rice, roti
                </h2>
              </div>
              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">
                Hot
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <span className="home-hero-chip">
                <Clock3 size={16} />
                28 min
              </span>
              <span className="home-hero-chip">
                <Star size={16} />
                4.8 rated
              </span>
              <span className="home-hero-chip">
                <ShieldCheck size={16} />
                Verified
              </span>
            </div>
          </div>

          <div className="home-float-card absolute -left-2 top-8 hidden rounded-[24px] bg-white p-4 shadow-2xl shadow-orange-500/15 sm:block">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                <Bell size={20} />
              </span>
              <div>
                <p className="text-sm font-black">Lunch reminder</p>
                <p className="text-xs font-semibold text-stone-500">
                  Tiffin arrives at 12:45 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="restaurants" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-orange-700">
              <Store size={14} />
              Nearby kitchens
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              Order from local favorites
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`h-11 shrink-0 rounded-2xl px-4 text-sm font-black transition ${
                  activeCategory === category
                    ? "bg-stone-950 text-white shadow-xl shadow-stone-950/20"
                    : "bg-white/75 text-stone-600 hover:bg-white hover:text-stone-950"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex h-13 items-center gap-2 rounded-[24px] border border-white/75 bg-white/80 px-4 shadow-inner shadow-stone-900/5 md:hidden">
          <Search size={18} className="text-stone-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-13 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400"
            placeholder="Search kitchens"
          />
        </div>

        {featuredRestaurants.length === 0 ? (
          <div className="home-card rounded-[34px] border border-white/75 bg-white/82 p-10 text-center shadow-xl shadow-stone-900/5">
            <ChefHat className="mx-auto mb-4 text-orange-700" size={34} />
            <h3 className="text-2xl font-black">No kitchens yet</h3>
            <p className="mt-2 text-sm text-stone-500">
              Add a restaurant from partner setup and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredRestaurants.slice(0, 6).map((restaurant, index) => (
              <article
                key={restaurant.id}
                className="home-card group overflow-hidden rounded-[32px] border border-white/75 bg-white/82 shadow-xl shadow-stone-900/5"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative aspect-[1.35] overflow-hidden bg-stone-100">
                  {restaurant.images?.[0] ? (
                    <Image
                      src={restaurant.images[0]}
                      alt={restaurant.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <Image
                      src="/hero2.jpg"
                      alt={restaurant.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  )}
                  <button className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/85 text-stone-800 shadow-lg backdrop-blur transition hover:bg-white hover:text-rose-600">
                    <Heart size={18} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black tracking-tight">
                        {restaurant.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-stone-500">
                        <MapPin size={15} />
                        {restaurant.country || restaurant.address || "Near you"}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                      4.8
                    </span>
                  </div>

                  <p className="line-clamp-2 min-h-11 text-sm leading-6 text-stone-600">
                    {restaurant.description ||
                      "Fresh home-style meals, packed hot and made for everyday comfort."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-3 py-2 text-xs font-black text-stone-700">
                      <Clock3 size={15} />
                      25-35 min
                    </span>
                    <button className="inline-flex h-10 items-center gap-2 rounded-2xl bg-orange-600 px-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700">
                      View
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="plans" className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="home-card rounded-[34px] bg-stone-950 p-7 text-white shadow-2xl shadow-stone-950/20">
          <Sparkles className="mb-10 text-orange-200" size={28} />
          <h2 className="text-3xl font-black tracking-tight">
            Tiffin plans that flex with your week.
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Subscribe for breakfast, lunch, dinner, or a custom routine. Pause
            anytime from your profile.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Daily", "₹99", "One fresh meal"],
            ["Weekly", "₹649", "Save on 7 meals"],
            ["Family", "₹1,899", "Shared meal box"],
          ].map(([name, price, detail]) => (
            <div
              key={name}
              className="home-card rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-xl shadow-stone-900/5"
            >
              <p className="text-sm font-black uppercase tracking-[0.15em] text-orange-700">
                {name}
              </p>
              <p className="mt-5 text-4xl font-black tracking-tight">{price}</p>
              <p className="mt-2 text-sm font-semibold text-stone-500">
                {detail}
              </p>
              <button className="mt-8 h-11 w-full rounded-2xl bg-stone-950 text-sm font-black text-white transition hover:-translate-y-0.5">
                Select
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Simple enough for every day
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="home-card rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-xl shadow-stone-900/5"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                  <step.icon size={22} />
                </span>
                <span className="text-sm font-black text-stone-300">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6">
        <div className="home-card flex flex-col gap-4 rounded-[30px] border border-white/75 bg-white/72 p-5 shadow-xl shadow-stone-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-white">
              <ChefHat size={21} />
            </span>
            <div>
              <p className="font-black">Foodiffin</p>
              <p className="text-xs font-semibold text-stone-500">
                Fresh meals, happy bellies.
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-stone-500">
            © {new Date().getFullYear()} Foodiffin
          </p>
        </div>
      </footer>
    </main>
  );
}
