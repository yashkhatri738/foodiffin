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
        latitude?: number;
        longitude?: number;
    };
    items: OrderItem[];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // returns distance in km
}

export async function createOrder(orderData: CreateOrderData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    try {
        // Fetch restaurant latitude/longitude for distance metrics
        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("latitude, longitude")
            .eq("id", orderData.restaurant_id)
            .maybeSingle();

        // Calculate distance
        let distanceKm = 3.5; // fallback default
        const custLat = (orderData.address as any).latitude;
        const custLon = (orderData.address as any).longitude;
        const restLat = restaurant?.latitude;
        const restLon = restaurant?.longitude;

        if (custLat && custLon && restLat && restLon) {
            distanceKm = calculateDistance(
                parseFloat(custLat),
                parseFloat(custLon),
                parseFloat(restLat),
                parseFloat(restLon)
            );
        }

        // Distance payout logic: Base ₹30 for first 2 km, then ₹10 per additional km
        let deliveryCostShare = 30;
        if (distanceKm > 2) {
            deliveryCostShare += Math.round((distanceKm - 2) * 10);
        }

        const foodSubtotal = orderData.total_amount;
        const platformCommPct = 15.0; // 15% Platform cut
        const platformCommAmount = Math.round((foodSubtotal * platformCommPct) / 100);
        const grandTotal = foodSubtotal + deliveryCostShare;
        const netPayoutAmount = foodSubtotal - platformCommAmount;

        // Create the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                restaurant_id: orderData.restaurant_id,
                total_amount: grandTotal, // Customer pays food subtotal + delivery fee
                payment_method: orderData.payment_method,
                payment_status: 'pending',
                address: orderData.address,
                status: 'pending',
                platform_commission_pct: platformCommPct,
                platform_commission_amount: platformCommAmount,
                delivery_cost_share: deliveryCostShare,
                net_payout_amount: netPayoutAmount,
                payout_status: 'pending'
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
        name,
        latitude,
        longitude
      ),
      delivery_partner:profiles!delivery_partner_id (
        id,
        full_name,
        phone,
        live_latitude,
        live_longitude
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
