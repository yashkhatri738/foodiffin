"use server";

import { createClient } from "./supabase/server";
import { supabaseAdmin } from "./supabase";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface RiderSignupInput {
  fullName: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  password?: string;
}

// Register a delivery partner
export async function registerDeliveryPartner(
  input: RiderSignupInput
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // 1. Create standard auth user using admin client with metadata role = delivery_partner
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password || "Rider@12345", // fallback default password
        email_confirm: true,
        user_metadata: {
          role: "delivery_partner",
          full_name: input.fullName,
        },
      });

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message ?? "Auth creation failed" };
    }

    const userId = authUser.user.id;

    // 2. Explicitly insert profile row in profiles table with delivery partner fields
    // This prevents any foreign key errors on the orders table
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        full_name: input.fullName,
        phone: input.phone,
        role: "delivery_partner",
        vehicle_type: input.vehicleType,
        vehicle_number: input.vehicleNumber,
        bank_name: input.bankName,
        bank_account_no: input.bankAccountNo,
        bank_ifsc: input.bankIfsc,
        is_online: true,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      // rollback auth user on profile failure
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { success: false, error: "Profile initialization failed: " + profileError.message };
    }

    return { success: true, data: { email: input.email } };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to register delivery partner",
    };
  }
}

// Toggle Online / Offline status
export async function updateRiderStatus(
  isOnline: boolean
): Promise<ActionResult> {
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
        is_online: isOnline,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/delivery-partner/profile");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to update online status",
    };
  }
}

// Update settings
export async function updateRiderProfileSettings(input: {
  vehicleType: string;
  vehicleNumber: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
}): Promise<ActionResult> {
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
        vehicle_type: input.vehicleType,
        vehicle_number: input.vehicleNumber,
        bank_name: input.bankName,
        bank_account_no: input.bankAccountNo,
        bank_ifsc: input.bankIfsc,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/delivery-partner/profile");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to update settings",
    };
  }
}
