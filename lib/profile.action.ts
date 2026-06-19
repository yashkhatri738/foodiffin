"use server";

import { createClient } from "./supabase/server";

type ActionResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

// Types for Profile
export interface ProfileData {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    bio: string | null;
    date_of_birth: string | null;
    gender: string | null;
    dietary_preference: string;
    allergies: string[] | null;
    favorite_cuisines: string[] | null;
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    order_updates: boolean;
    offers_notifications: boolean;
    total_orders: number;
    loyalty_points: number;
    membership_tier: string;
    email_verified: boolean;
    phone_verified: boolean;
    profile_completed: boolean;
    language_preference: string;
    currency_preference: string;
    email?: string;
    created_at: string;
    updated_at: string;
}

export async function getProfile(): Promise<ActionResult<ProfileData>> {
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
            data: { ...data, email: user.email } as ProfileData,
        };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to get profile" };
    }
}

export async function updateProfile(formData: {
    full_name?: string;
    phone?: string;
    bio?: string;
    date_of_birth?: string;
    gender?: string;
}): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (formData.full_name !== undefined) updateData.full_name = formData.full_name;
        if (formData.phone !== undefined) updateData.phone = formData.phone;
        if (formData.bio !== undefined) updateData.bio = formData.bio;
        if (formData.date_of_birth !== undefined) updateData.date_of_birth = formData.date_of_birth;
        if (formData.gender !== undefined) updateData.gender = formData.gender;

        const { error } = await supabase
            .from("profiles")
            .update(updateData)
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

export async function updatePreferences(formData: {
    dietary_preference?: string;
    allergies?: string[];
    favorite_cuisines?: string[];
}): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (formData.dietary_preference !== undefined) updateData.dietary_preference = formData.dietary_preference;
        if (formData.allergies !== undefined) updateData.allergies = formData.allergies;
        if (formData.favorite_cuisines !== undefined) updateData.favorite_cuisines = formData.favorite_cuisines;

        const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to update preferences",
        };
    }
}

export async function updateNotifications(formData: {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    push_notifications?: boolean;
    order_updates?: boolean;
    offers_notifications?: boolean;
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
                ...formData,
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
            error: err?.message ?? "Failed to update notifications",
        };
    }
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult<string>> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        if (!file.type.startsWith("image/")) {
            return { success: false, error: "Only image files are allowed" };
        }

        if (file.size > 2 * 1024 * 1024) {
            return { success: false, error: "Image must be less than 2MB" };
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: true,
            });

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        // Update profile with new avatar URL
        await supabase
            .from("profiles")
            .update({
                avatar_url: publicUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        return { success: true, data: publicUrl };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to upload avatar" };
    }
}
