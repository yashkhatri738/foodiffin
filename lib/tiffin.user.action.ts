"use server";

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

export interface UserSubscription {
  id: string;
  start_date: string;
  end_date: string;
  status: "active" | "paused" | "completed" | "cancelled";
  delivery_time: "lunch" | "dinner" | "both";
  address: any;
  payment_status: string;
  created_at: string;
  tiffin_plans: {
    name: string;
    description: string;
    meal_type: string;
    items: string[];
  };
  restaurants: {
    name: string;
    id: string;
  };
}

export async function getUserActiveSubscriptions(): Promise<{
  success: boolean;
  data?: UserSubscription[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("tiffin_subscriptions")
      .select(`
        id,
        start_date,
        end_date,
        status,
        delivery_time,
        address,
        payment_status,
        created_at,
        tiffin_plans (
          name,
          description,
          meal_type,
          items
        ),
        restaurants (
          id,
          name
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as any[] };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to load active subscriptions",
    };
  }
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  newStatus: "active" | "paused" | "cancelled"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("tiffin_subscriptions")
      .update({ status: newStatus })
      .eq("id", subscriptionId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/subscriptions");
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to update subscription",
    };
  }
}
