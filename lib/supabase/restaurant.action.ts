"use server";

import { createClient } from "./server";

type ActionResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function getRestaurant(): Promise<ActionResult> {
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
