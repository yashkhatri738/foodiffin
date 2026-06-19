"use server";

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface TiffinPlanData {
  id?: string;
  name: string;
  description?: string;
  price_weekly: number;
  price_monthly: number;
  meal_type: string; // "Veg" | "Non-Veg"
  items: string[];
  is_available?: boolean;
}

// Get all plans for a restaurant
export async function getTiffinPlansByRestaurant(
  restaurantId: string
): Promise<ActionResult<TiffinPlanData[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tiffin_plans")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as TiffinPlanData[] };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to get tiffin plans",
    };
  }
}

// Create a new tiffin plan
export async function createTiffinPlan(
  restaurantId: string,
  formData: TiffinPlanData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("tiffin_plans")
      .insert({
        restaurant_id: restaurantId,
        name: formData.name,
        description: formData.description || null,
        price_weekly: formData.price_weekly,
        price_monthly: formData.price_monthly,
        meal_type: formData.meal_type || "Veg",
        items: formData.items || [],
        is_available: formData.is_available ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/subscriptions");
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to create tiffin plan",
    };
  }
}

// Update an existing tiffin plan
export async function updateTiffinPlan(
  planId: string,
  formData: TiffinPlanData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("tiffin_plans")
      .update({
        name: formData.name,
        description: formData.description || null,
        price_weekly: formData.price_weekly,
        price_monthly: formData.price_monthly,
        meal_type: formData.meal_type,
        items: formData.items,
        is_available: formData.is_available ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/subscriptions");
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to update tiffin plan",
    };
  }
}

// Delete a tiffin plan
export async function deleteTiffinPlan(planId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("tiffin_plans")
      .delete()
      .eq("id", planId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/subscriptions");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to delete tiffin plan",
    };
  }
}

// Toggle plan availability
export async function toggleTiffinPlanAvailability(
  planId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("tiffin_plans")
      .update({
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/subscriptions");
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to toggle availability",
    };
  }
}

export interface TiffinSubscriptionInput {
  planId: string;
  restaurantId: string;
  startDate: string;
  endDate: string;
  deliveryTime: string; // 'lunch' | 'dinner' | 'both'
  address: any;
  paymentMethod: "online" | "cash";
  duration: "weekly" | "monthly";
}

// Subscribe user to a tiffin plan
export async function subscribeToTiffinPlan(
  input: TiffinSubscriptionInput
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please log in to subscribe to tiffin plans." };
    }

    // 1. Fetch tiffin plan to securely determine the price
    const { data: plan, error: planError } = await supabase
      .from("tiffin_plans")
      .select("*")
      .eq("id", input.planId)
      .single();

    if (planError || !plan) {
      return { success: false, error: "Tiffin plan not found" };
    }

    const price = input.duration === "weekly" ? plan.price_weekly : plan.price_monthly;

    // 2. Fetch or create virtual dish representation for stats compatibility
    let virtualDishId = null;
    const virtualDishName = `Tiffin: ${plan.name} (${input.duration})`;
    const { data: existingDish } = await supabase
      .from("dishes")
      .select("id")
      .eq("restaurant_id", input.restaurantId)
      .eq("name", virtualDishName)
      .maybeSingle();

    if (existingDish) {
      virtualDishId = existingDish.id;
    } else {
      const { data: newDish, error: dishError } = await supabase
        .from("dishes")
        .insert({
          restaurant_id: input.restaurantId,
          name: virtualDishName,
          description: plan.description || "Tiffin subscription meal box",
          price: price,
          category: "Tiffin",
          is_available: true,
          is_veg: plan.meal_type === "Veg",
        })
        .select()
        .single();

      if (dishError) {
        return { success: false, error: "Failed to initialize subscription item: " + dishError.message };
      }
      virtualDishId = newDish.id;
    }

    // 3. Create core order record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        restaurant_id: input.restaurantId,
        total_amount: price,
        payment_method: input.paymentMethod,
        payment_status: input.paymentMethod === "online" ? "paid" : "pending",
        address: input.address,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      return { success: false, error: "Failed to place order: " + orderError.message };
    }

    // 4. Create order item details
    const { error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        dish_id: virtualDishId,
        quantity: 1,
        price: price,
      });

    if (itemError) {
      // rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      return { success: false, error: "Failed to record order item: " + itemError.message };
    }

    // 5. Create tiffin subscription record
    const { data: subscription, error: subError } = await supabase
      .from("tiffin_subscriptions")
      .insert({
        user_id: user.id,
        plan_id: input.planId,
        restaurant_id: input.restaurantId,
        start_date: input.startDate,
        end_date: input.endDate,
        delivery_time: input.deliveryTime,
        address: input.address,
        payment_status: input.paymentMethod === "online" ? "paid" : "pending",
        status: "active",
      })
      .select()
      .single();

    if (subError) {
      // rollback order and order item
      await supabase.from("orders").delete().eq("id", order.id);
      return { success: false, error: "Failed to create subscription calendar: " + subError.message };
    }

    revalidatePath("/profile");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/orders");
    
    return { success: true, data: subscription };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to subscribe to tiffin plan",
    };
  }
}
