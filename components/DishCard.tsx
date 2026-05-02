"use client";

import Image from "next/image";
import { ChefHat, Clock3, Leaf, Minus, Plus } from "lucide-react";
import { useCart } from "./CartContext";

export interface DishData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  is_available?: boolean;
  is_veg?: boolean;
  image_url?: string | null;
  preparation_time?: number | null;
  calories?: number | null;
  spice_level?: string | null;
}

interface DishCardProps {
  dish: DishData;
  restaurantId: string;
  restaurantName: string;
}

export default function DishCard({
  dish,
  restaurantId,
  restaurantName,
}: DishCardProps) {
  const { getQuantity, addItem, increment, decrement } = useCart();
  const qty = getQuantity(dish.id);
  const unavailable = dish.is_available === false;

  const handleAdd = () => {
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image_url,
      restaurantId,
      restaurantName,
    });
  };

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* ── Image area ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-orange-50">
            <ChefHat size={32} className="text-orange-300" />
          </div>
        )}

        {/* Veg / Non-veg badge */}
        <div
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            dish.is_veg
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-red-50 text-red-600 ring-1 ring-red-200"
          }`}
        >
          {dish.is_veg ? "VEG" : "NON-VEG"}
        </div>

        {/* + / qty controls — top right */}
        {!unavailable && (
          <div className="absolute right-2 top-2">
            {qty === 0 ? (
              <button
                onClick={handleAdd}
                aria-label="Add to cart"
                className="grid h-7 w-7 place-items-center rounded-full bg-orange-600 text-white shadow-md transition hover:scale-110 hover:bg-orange-700 active:scale-95"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5 shadow-md ring-1 ring-orange-200">
                <button
                  onClick={() => decrement(dish.id)}
                  aria-label="Decrease"
                  className="grid h-5 w-5 place-items-center rounded-full bg-orange-100 text-orange-700 transition hover:bg-orange-600 hover:text-white"
                >
                  <Minus size={10} strokeWidth={2.5} />
                </button>
                <span className="min-w-[14px] text-center text-xs font-bold text-orange-600">
                  {qty}
                </span>
                <button
                  onClick={() => increment(dish.id)}
                  aria-label="Increase"
                  className="grid h-5 w-5 place-items-center rounded-full bg-orange-100 text-orange-700 transition hover:bg-orange-600 hover:text-white"
                >
                  <Plus size={10} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Unavailable overlay */}
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-600">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-snug text-stone-800">
            {dish.name}
          </h4>
          <span className="shrink-0 text-sm font-bold text-orange-600">
            ₹{dish.price}
          </span>
        </div>

        {dish.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-400">
            {dish.description}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
          {dish.preparation_time && (
            <span className="flex items-center gap-1">
              <Clock3 size={11} />
              {dish.preparation_time} min
            </span>
          )}
          {dish.calories && (
            <span className="flex items-center gap-1">
              <Leaf size={11} />
              {dish.calories} kcal
            </span>
          )}
          {dish.spice_level && (
            <span className="capitalize rounded-full bg-orange-50 px-2 py-0.5 font-medium text-orange-600">
              {dish.spice_level}
            </span>
          )}
        </div>

        {/* In-cart quantity strip at bottom of card */}
        {qty > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
            <span className="text-xs text-stone-500">In cart</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => decrement(dish.id)}
                aria-label="Decrease"
                className="grid h-6 w-6 place-items-center rounded-full bg-white text-orange-600 shadow-sm ring-1 ring-orange-200 transition hover:bg-orange-600 hover:text-white"
              >
                <Minus size={11} />
              </button>
              <span className="min-w-[16px] text-center text-sm font-bold text-orange-600">
                {qty}
              </span>
              <button
                onClick={() => increment(dish.id)}
                aria-label="Increase"
                className="grid h-6 w-6 place-items-center rounded-full bg-white text-orange-600 shadow-sm ring-1 ring-orange-200 transition hover:bg-orange-600 hover:text-white"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
