'use server'

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

export async function getAllOrdersForAdmin() {
    const supabase = await createClient();

    // Check if user is admin (you can add role check here)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    // Fetch all orders with related data
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
