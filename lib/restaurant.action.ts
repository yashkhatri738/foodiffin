"use server";

import { sendRestaurantCredentials } from "@/lib/email";
import { createClient } from "./supabase/server";
import { supabaseAdmin } from "./supabase";

type ActionResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function getRestaurantById(): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("restaurants")
            .select("*")
            .eq("owner_id", user.id)
            .maybeSingle();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to get restaurant",
        };
    }
}

export async function createRestaurant(formData: {
    name: string;
    description: string;
    email: string;
    phone: string;
    country: string;
    address: string;
}): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data, error } = await supabase
            .from("restaurants")
            .insert({
                owner_id: user.id,
                name: formData.name,
                description: formData.description,
                email: formData.email,
                phone: formData.phone,
                country: formData.country,
                address: formData.address,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        // Generate a random password for the restaurant admin account
        const password = generatePassword();

        // Create a Supabase auth user for the restaurant admin
        const { data: adminUser, error: adminError } =
            await supabaseAdmin.auth.admin.createUser({
                email: formData.email,
                password,
                email_confirm: true,
                user_metadata: {
                    role: "restaurant_admin",
                    restaurant_id: (data as any).id,
                    restaurant_name: formData.name,
                },
            });

        if (adminError) {
            // Roll back restaurant row so state stays consistent
            await supabaseAdmin
                .from("restaurants")
                .delete()
                .eq("id", (data as any).id);
            return {
                success: false,
                error: `Failed to create admin account: ${adminError.message}`,
            };
        }

        // Send credentials email
        console.log(`[Restaurant Admin] Email: ${formData.email} | Password: ${password}`);
        try {
            await sendRestaurantCredentials({
                restaurantName: formData.name,
                email: formData.email,
                password,
            });
        } catch {
            // Email failure is non-fatal — restaurant + user already created
        }

        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to create restaurant",
        };
    }
}

export async function updateRestaurant(
    restaurantId: string,
    formData: {
        name: string;
        description: string;
        email: string;
        phone: string;
        country: string;
        address: string;
    }
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
            .from("restaurants")
            .update({
                ...formData,
                updated_at: new Date().toISOString(),
            })
            .eq("id", restaurantId)
            .eq("owner_id", user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to update restaurant",
        };
    }
}

export async function uploadRestaurantImage(
    formData: FormData
): Promise<ActionResult<string>> {
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

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("restaurant-images")
            .upload(fileName, file);

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("restaurant-images").getPublicUrl(fileName);

        return { success: true, data: publicUrl };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to upload image" };
    }
}

export async function addImageToRestaurant(
    restaurantId: string,
    imageUrl: string
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Get current images
        const { data: restaurant, error: fetchError } = await supabase
            .from("restaurants")
            .select("images")
            .eq("id", restaurantId)
            .eq("owner_id", user.id)
            .single();

        if (fetchError) {
            return { success: false, error: fetchError.message };
        }

        const currentImages = restaurant?.images || [];
        const updatedImages = [...currentImages, imageUrl];

        const { error } = await supabase
            .from("restaurants")
            .update({ images: updatedImages, updated_at: new Date().toISOString() })
            .eq("id", restaurantId)
            .eq("owner_id", user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to add image" };
    }
}

export async function removeImageFromRestaurant(
    restaurantId: string,
    imageUrl: string
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { data: restaurant, error: fetchError } = await supabase
            .from("restaurants")
            .select("images")
            .eq("id", restaurantId)
            .eq("owner_id", user.id)
            .single();

        if (fetchError) {
            return { success: false, error: fetchError.message };
        }

        const currentImages = restaurant?.images || [];
        const updatedImages = currentImages.filter(
            (img: string) => img !== imageUrl
        );

        const { error } = await supabase
            .from("restaurants")
            .update({ images: updatedImages, updated_at: new Date().toISOString() })
            .eq("id", restaurantId)
            .eq("owner_id", user.id);

        if (error) {
            return { success: false, error: error.message };
        }

        // Also delete from storage
        const path = imageUrl.split("/restaurant-images/")[1];
        if (path) {
            await supabase.storage.from("restaurant-images").remove([path]);
        }

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to remove image",
        };
    }
}

export async function getAllRestaurants(): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("restaurants")
            .select("*");

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data };
    } catch (error: any) {
        console.error("Error fetching restaurants:", error);
        return {
            success: false,
            error: error?.message ?? "Failed to fetch restaurants",
        };
    }
}

// ── Admin helpers ────────────────────────────────────────────────────────────

export async function getRestaurantForAdmin(): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const restaurantId = user.user_metadata?.restaurant_id;

        // Try admin metadata first, then fall back to owner_id
        if (restaurantId) {
            const { data, error } = await supabase
                .from("restaurants")
                .select("*")
                .eq("id", restaurantId)
                .single();

            if (error) return { success: false, error: error.message };
            return { success: true, data };
        }

        // Fallback: owner lookup
        const { data, error } = await supabase
            .from("restaurants")
            .select("*")
            .eq("owner_id", user.id)
            .maybeSingle();

        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to get restaurant",
        };
    }
}

export async function updateRestaurantAsAdmin(
    restaurantId: string,
    formData: {
        name: string;
        description: string;
        phone: string;
        country: string;
        address: string;
    }
): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify the user is allowed to edit this restaurant
        const metaId = user.user_metadata?.restaurant_id;
        const isOwner = !metaId; // owner doesn't have restaurant_id in metadata

        const query = supabase
            .from("restaurants")
            .update({
                name: formData.name,
                description: formData.description,
                phone: formData.phone,
                country: formData.country,
                address: formData.address,
                updated_at: new Date().toISOString(),
            })
            .eq("id", restaurantId);

        // Scope to correct user
        if (isOwner) {
            query.eq("owner_id", user.id);
        }

        const { error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to update restaurant",
        };
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generatePassword(length = 12): string {
    const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((b) => chars[b % chars.length])
        .join("");
}
