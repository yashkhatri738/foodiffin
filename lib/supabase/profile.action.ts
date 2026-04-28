"use server";

import { createClient } from "./server";

type ActionResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function getProfile(): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: { ...data, email: user.email },
        };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to get profile" };
    }
}

export async function updateProfile(formData: {
    full_name: string;
    phone: string;
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
                full_name: formData.full_name,
                phone: formData.phone,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to update profile",
        };
    }
}
