"use server";

import { createClient } from "./supabase/server";

type ActionResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

export interface DishFormData {
    name: string;
    description?: string;
    price: number;
    category?: string;
    is_available?: boolean;
    is_veg?: boolean;
    image_url?: string;
    preparation_time?: number;
    calories?: number;
    spice_level?: string;
    tags?: string[];
}

// Get all dishes for a restaurant
export async function getDishesByRestaurant(
    restaurantId: string
): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("dishes")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("created_at", { ascending: false });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to get dishes",
        };
    }
}

// Get single dish by ID
export async function getDishById(dishId: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("dishes")
            .select("*")
            .eq("id", dishId)
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to get dish",
        };
    }
}

// Create a new dish
export async function createDish(
    restaurantId: string,
    formData: DishFormData
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
            .from("dishes")
            .insert({
                restaurant_id: restaurantId,
                name: formData.name,
                description: formData.description || null,
                price: formData.price,
                category: formData.category || null,
                is_available: formData.is_available ?? true,
                is_veg: formData.is_veg ?? true,
                image_url: formData.image_url || null,
                preparation_time: formData.preparation_time || null,
                calories: formData.calories || null,
                spice_level: formData.spice_level || null,
                tags: formData.tags || [],
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to create dish",
        };
    }
}

// Update an existing dish
export async function updateDish(
    dishId: string,
    formData: DishFormData
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
            .from("dishes")
            .update({
                name: formData.name,
                description: formData.description || null,
                price: formData.price,
                category: formData.category || null,
                is_available: formData.is_available ?? true,
                is_veg: formData.is_veg ?? true,
                image_url: formData.image_url || null,
                preparation_time: formData.preparation_time || null,
                calories: formData.calories || null,
                spice_level: formData.spice_level || null,
                tags: formData.tags || [],
                updated_at: new Date().toISOString(),
            })
            .eq("id", dishId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to update dish",
        };
    }
}

// Delete a dish
export async function deleteDish(dishId: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Not authenticated" };
        }

        const { error } = await supabase
            .from("dishes")
            .delete()
            .eq("id", dishId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to delete dish",
        };
    }
}

// Toggle dish availability
export async function toggleDishAvailability(
    dishId: string,
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
            .from("dishes")
            .update({
                is_available: isAvailable,
                updated_at: new Date().toISOString(),
            })
            .eq("id", dishId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return {
            success: false,
            error: err?.message ?? "Failed to toggle availability",
        };
    }
}

// Upload dish image
export async function uploadDishImage(
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
            .from("dish-images")
            .upload(fileName, file);

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("dish-images").getPublicUrl(fileName);

        return { success: true, data: publicUrl };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to upload image" };
    }
}
