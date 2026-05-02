import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChefHat,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { getRestaurantByIdPublic } from "@/lib/restaurant.action";
import { getDishesByRestaurant } from "@/lib/dish.action";
import { type DishData } from "@/components/DishCard";
import RestaurantDishesClient from "@/components/RestaurantDishesClient";

export const dynamic = "force-dynamic";


export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [restaurantResult, dishesResult] = await Promise.all([
    getRestaurantByIdPublic(id),
    getDishesByRestaurant(id),
  ]);

  if (!restaurantResult.success || !restaurantResult.data) {
    notFound();
  }

  const restaurant = restaurantResult.data as {
    id: string;
    name: string;
    description?: string | null;
    images?: string[] | null;
    country?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };

  const dishes = (
    dishesResult.success && dishesResult.data ? dishesResult.data : []
  ) as DishData[];

  const heroImage = restaurant.images?.[0] ?? null;

  const categories = Array.from(
    new Set(dishes.map((d) => d.category).filter(Boolean)),
  ) as string[];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      {/* ─── Hero ─── */}
      <section className="relative h-72 w-full overflow-hidden sm:h-96">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={restaurant.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-orange-400 to-amber-500" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/30"
        >
          <ArrowLeft size={13} />
          Back
        </Link>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end gap-4">
              {/* Thumbnail */}
              <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-lg sm:block">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-orange-600">
                    <ChefHat size={28} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white drop-shadow sm:text-4xl">
                  {restaurant.name}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-white/80">
                  {(restaurant.address || restaurant.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {restaurant.address || restaurant.country}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star
                      size={12}
                      fill="currentColor"
                      className="text-amber-400"
                    />
                    <span className="text-amber-300 font-medium">4.8</span>
                    &nbsp;rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={12} />
                    25–35 min delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* ─── Details strip ─── */}
        <div className="mb-8 flex flex-wrap gap-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          {restaurant.description && (
            <p className="w-full text-sm leading-relaxed text-stone-500">
              {restaurant.description}
            </p>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Phone size={14} className="text-orange-500" />
              {restaurant.phone}
            </div>
          )}
          {restaurant.email && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Mail size={14} className="text-orange-500" />
              {restaurant.email}
            </div>
          )}
        </div>

        {/* ─── Dishes ─── */}
        <RestaurantDishesClient
          dishes={dishes}
          categories={categories}
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
        />
      </div>
    </main>
  );
}
