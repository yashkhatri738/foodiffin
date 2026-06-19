'use server'

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

export async function getAllOrdersForAdmin() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Fetch user's restaurant ID
    let restaurantId = user.user_metadata?.restaurant_id;
    if (!restaurantId) {
        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_id", user.id)
            .maybeSingle();
        
        if (restaurant) {
            restaurantId = restaurant.id;
        }
    }

    if (!restaurantId) {
        return { data: [] }; // Return empty list instead of throwing an error
    }

    // Fetch all orders for this specific restaurant
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            profiles (
                full_name,
                phone
            ),
            restaurants (
                id,
                name
            ),
            order_items (
                *,
                dishes (
                    name,
                    image_url
                )
            )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }

    return { data: orders };
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    if (!orderId || !status) {
        return { error: 'Missing orderId or status' };
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return { error: 'Invalid status' };
    }

    // Update order status
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/orders');
    return { data, success: true };
}
