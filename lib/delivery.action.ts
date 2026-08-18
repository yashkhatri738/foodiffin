"use server";

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

export interface DeliveryOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  delivery_cost_share?: number;
  address: {
    full_name: string;
    phone: string;
    address_line1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  restaurants: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  profiles: {
    full_name: string;
    phone: string;
  };
}

// Fetch all orders ready for delivery (packed) and not yet assigned
export async function getAvailableDeliveryOrders(): Promise<{
  success: boolean;
  data?: DeliveryOrder[];
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
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        payment_method,
        payment_status,
        delivery_cost_share,
        address,
        restaurants (
          id,
          name,
          address,
          phone
        ),
        profiles!user_id (
          full_name,
          phone
        )
      `)
      .eq("status", "packed")
      .is("delivery_partner_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as any[] };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to fetch open deliveries",
    };
  }
}

// Accept a delivery task
export async function acceptDeliveryOrder(
  orderId: string
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
      .from("orders")
      .update({
        delivery_partner_id: user.id,
        status: "out_for_delivery",
      })
      .eq("id", orderId)
      .is("delivery_partner_id", null);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/delivery-partner/orders");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to accept order",
    };
  }
}

// Complete a delivery task
export async function completeDeliveryOrder(
  orderId: string
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
      .from("orders")
      .update({
        status: "delivered",
        payment_status: "paid", // auto settle payment on delivery
      })
      .eq("id", orderId)
      .eq("delivery_partner_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/delivery-partner/orders");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to complete delivery",
    };
  }
}

// Fetch currently accepted active orders for the delivery partner
export async function getDeliveryPartnerActiveOrders(): Promise<{
  success: boolean;
  data?: DeliveryOrder[];
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
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        payment_method,
        payment_status,
        delivery_cost_share,
        address,
        restaurants (
          id,
          name,
          address,
          phone
        ),
        profiles!user_id (
          full_name,
          phone
        )
      `)
      .eq("delivery_partner_id", user.id)
      .eq("status", "out_for_delivery");

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as any[] };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to get active deliveries",
    };
  }
}

// Fetch past completed delivery history for the delivery partner
export async function getDeliveryPartnerHistory(): Promise<{
  success: boolean;
  data?: DeliveryOrder[];
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
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        payment_method,
        payment_status,
        delivery_cost_share,
        address,
        restaurants (
          id,
          name,
          address,
          phone
        ),
        profiles!user_id (
          full_name,
          phone
        )
      `)
      .eq("delivery_partner_id", user.id)
      .eq("status", "delivered")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as any[] };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to get history logs",
    };
  }
}

// Update rider live tracking coordinates
export async function updateRiderLiveLocation(
  latitude: number,
  longitude: number
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
      .from("profiles")
      .update({
        live_latitude: latitude,
        live_longitude: longitude,
        last_location_update: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to update live coordinates",
    };
  }
}
