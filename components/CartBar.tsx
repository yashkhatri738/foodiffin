"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartBar() {
  const { items, totalItems, totalPrice, increment, decrement, clear } =
    useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
      <div className="overflow-hidden rounded-2xl bg-stone-900 text-white shadow-2xl ring-1 ring-white/10">
        {/* ── Items list ── */}
        <div className="max-h-52 divide-y divide-stone-800 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.dishId}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              {/* Thumbnail */}
              {item.image_url ? (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-stone-700">
                  <ShoppingBag size={13} className="text-stone-400" />
                </div>
              )}

              {/* Name & restaurant */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-stone-100">
                  {item.name}
                </p>
                <p className="truncate text-[10px] text-stone-500">
                  {item.restaurantName}
                </p>
              </div>

              {/* Price */}
              <span className="shrink-0 text-xs font-semibold text-orange-400">
                ₹{item.price * item.quantity}
              </span>

              {/* Qty controls */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => decrement(item.dishId)}
                  aria-label="Decrease"
                  className="grid h-5 w-5 place-items-center rounded-full bg-stone-700 text-stone-300 transition hover:bg-orange-600 hover:text-white"
                >
                  <Minus size={10} strokeWidth={2.5} />
                </button>
                <span className="min-w-[16px] text-center text-xs font-bold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => increment(item.dishId)}
                  aria-label="Increase"
                  className="grid h-5 w-5 place-items-center rounded-full bg-stone-700 text-stone-300 transition hover:bg-orange-600 hover:text-white"
                >
                  <Plus size={10} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer bar ── */}
        <div className="flex items-center gap-3 border-t border-stone-800 bg-stone-950/60 px-4 py-3">
          {/* Summary */}
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-orange-400" />
            <span className="text-sm font-semibold">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </span>
          </div>

          <span className="text-stone-600">·</span>
          <span className="text-sm font-bold text-orange-400">
            ₹{totalPrice}
          </span>

          {/* Clear */}
          <button
            onClick={clear}
            aria-label="Clear cart"
            className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-stone-400 transition hover:bg-stone-800 hover:text-rose-400"
          >
            <Trash2 size={12} />
            Clear
          </button>

          {/* Checkout */}
          <button className="rounded-xl bg-orange-600 px-5 py-1.5 text-xs font-bold text-white transition hover:bg-orange-700 active:scale-95">
            Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
