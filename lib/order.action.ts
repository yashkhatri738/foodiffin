'use server'

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

export interface OrderItem {
    dish_id: string;
    quantity: number;
    price: number;
}

export interface CreateOrderData {
    restaurant_id: string;
    total_amount: number;
    payment_method: 'online' | 'cash';
    address: {
        full_name: string;
        phone: string;
        address_line1: string;
        address_line2?: string;
        landmark?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        address_type: string;
    };
    items: OrderItem[];
}

export async function createOrder(orderData: CreateOrderData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        // Create the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                restaurant_id: orderData.restaurant_id,
                total_amount: orderData.total_amount,
                payment_method: orderData.payment_method,
                payment_status: orderData.payment_method === 'cash' ? 'pending' : 'pending',
                address: orderData.address,
                status: 'pending',
            })
            .select()
            .single();

        if (orderError) {
            return { error: orderError.message };
        }

        // Create order items
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            dish_id: item.dish_id,
            quantity: item.quantity,
            price: item.price,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            // Rollback: delete the order if items insertion fails
            await supabase.from('orders').delete().eq('id', order.id);
            return { error: itemsError.message };
        }

        revalidatePath('/orders');
        return { data: order, success: true };
    } catch (error) {
        return { error: 'Failed to create order' };
    }
}

export async function getUserOrders() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }

    return { data };
}
