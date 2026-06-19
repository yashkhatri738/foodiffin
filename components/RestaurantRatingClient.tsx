"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitRestaurantRating } from "@/lib/rating.action";

interface RatingProps {
  restaurantId: string;
}

export default function RestaurantRatingClient({ restaurantId }: RatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleRatingSubmit = async (selectedRating: number) => {
    setRating(selectedRating);
    setSubmitting(true);

    const result = await submitRestaurantRating(restaurantId, selectedRating);
    if (result.success && result.data) {
      toast.success(`Thank you for rating! Restaurant rating is now ${result.data.newAverage}★`);
    } else {
      toast.error(result.error || "Failed to submit rating");
      setRating(0); // reset if failed
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-stone-200 bg-white shadow-sm max-w-sm">
      <div>
        <h4 className="font-bold text-stone-900 text-sm">Love this kitchen?</h4>
        <p className="text-xs text-stone-500 mt-0.5">
          Submit your rating to help other subscribers choose their daily meals.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {submitting ? (
          <div className="flex items-center gap-2 text-orange-600 text-xs font-semibold py-1">
            <Loader2 className="animate-spin" size={16} />
            Submitting rating...
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const active = hoverRating ? starValue <= hoverRating : starValue <= rating;
              return (
                <button
                  key={starValue}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleRatingSubmit(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform duration-150 hover:scale-125 focus:outline-none"
                >
                  <Star
                    size={26}
                    className={`stroke-2 cursor-pointer transition-colors ${
                      active ? "fill-amber-400 text-amber-500" : "text-stone-300 hover:text-amber-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}

        {rating > 0 && !submitting && (
          <span className="text-xs font-bold text-stone-600">
            Rated {rating} / 5
          </span>
        )}
      </div>
    </div>
  );
}
