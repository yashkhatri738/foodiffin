"use server";

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function submitRestaurantRating(
  restaurantId: string,
  rating: number
): Promise<ActionResult<{ newAverage: number }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to rate the restaurant." };
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5." };
    }

    // Fetch current rating details from the restaurants table
    const { data: restaurant, error: fetchErr } = await supabase
      .from("restaurants")
      .select("rating_sum, rating_count")
      .eq("id", restaurantId)
      .single();

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    const currentSum = Number(restaurant.rating_sum || 0);
    const currentCount = Number(restaurant.rating_count || 0);

    const newCount = currentCount + 1;
    const newSum = currentSum + rating;
    const newAverage = Number((newSum / newCount).toFixed(1));

    // Update the restaurant fields directly
    const { error: updateErr } = await supabase
      .from("restaurants")
      .update({
        rating_sum: newSum,
        rating_count: newCount,
        average_rating: newAverage,
      })
      .eq("id", restaurantId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath(`/restaurant/${restaurantId}`);
    revalidatePath(`/admin/dashboard`);
    return { success: true, data: { newAverage } };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to submit rating",
    };
  }
}
