"use server";

import { createClient } from "./supabase/server";

export interface PayoutRecord {
  id: string;
  created_at: string;
  total_amount: number;
  platform_commission_amount: number;
  delivery_cost_share: number;
  net_payout_amount: number;
  payout_status: string;
  customer_name: string;
}

export interface FinancialSummaryData {
  grossSales: number;
  commissions: number;
  estimatedCosts: number;
  netProfit: number;
  dailyData: {
    date: string;
    revenue: number;
    profit: number;
    costs: number;
  }[];
  recentPayouts: PayoutRecord[];
}

export async function getFinancialSummary(
  startDateStr?: string,
  endDateStr?: string
): Promise<{ success: boolean; data?: FinancialSummaryData; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // 1. Get restaurant for this admin
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!restaurant) {
      return { success: false, error: "No restaurant found for this user." };
    }

    // Determine date boundaries
    let query = supabase
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        platform_commission_amount,
        delivery_cost_share,
        net_payout_amount,
        payout_status,
        profiles!user_id (
          full_name
        ),
        order_items (
          quantity,
          price,
          dishes (
            cost_price
          )
        )
      `)
      .eq("restaurant_id", restaurant.id)
      .eq("payment_status", "paid")
      .neq("status", "cancelled");

    if (startDateStr) {
      query = query.gte("created_at", startDateStr);
    }
    if (endDateStr) {
      query = query.lte("created_at", endDateStr);
    }

    const { data: orders, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    let grossSales = 0;
    let commissions = 0;
    let estimatedCosts = 0;
    let netProfit = 0;

    const dailyGroups: Record<string, { revenue: number; profit: number; costs: number }> = {};
    const recentPayouts: PayoutRecord[] = [];

    orders?.forEach((order: any) => {
      const orderAmount = order.total_amount || 0;
      
      // Dynamic fallbacks for fields in case schema migration has not run yet
      const platformComm = order.platform_commission_amount !== null && order.platform_commission_amount !== undefined
        ? order.platform_commission_amount
        : Math.round(orderAmount * 0.15); // Default 15% commission fallback
        
      const deliveryShare = order.delivery_cost_share !== null && order.delivery_cost_share !== undefined
        ? order.delivery_cost_share
        : 30; // Default ₹30 delivery share fallback
        
      const netPayout = order.net_payout_amount !== null && order.net_payout_amount !== undefined
        ? order.net_payout_amount
        : orderAmount - platformComm - deliveryShare;

      grossSales += orderAmount;
      commissions += (platformComm + deliveryShare);

      // Sum item cost prices
      let orderCost = 0;
      order.order_items?.forEach((item: any) => {
        const costPrice = item.dishes?.cost_price || Math.round(item.price * 0.35); // Default 35% cost price fallback
        orderCost += (item.quantity || 1) * costPrice;
      });

      estimatedCosts += orderCost;
      
      const orderProfit = netPayout - orderCost;
      netProfit += orderProfit;

      // Group by Day (YYYY-MM-DD)
      const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).split("/").reverse().join("-"); // Format YYYY-MM-DD

      if (!dailyGroups[orderDate]) {
        dailyGroups[orderDate] = { revenue: 0, profit: 0, costs: 0 };
      }
      dailyGroups[orderDate].revenue += orderAmount;
      dailyGroups[orderDate].profit += orderProfit;
      dailyGroups[orderDate].costs += (orderCost + platformComm + deliveryShare);

      // Push to payout log
      recentPayouts.push({
        id: order.id,
        created_at: order.created_at,
        total_amount: orderAmount,
        platform_commission_amount: platformComm,
        delivery_cost_share: deliveryShare,
        net_payout_amount: netPayout,
        payout_status: order.payout_status || "processed",
        customer_name: order.profiles?.full_name || "Guest Customer",
      });
    });

    // Convert daily groups to sorted array
    const dailyData = Object.entries(dailyGroups)
      .map(([date, vals]) => ({
        date,
        revenue: Math.round(vals.revenue),
        profit: Math.round(vals.profit),
        costs: Math.round(vals.costs),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      success: true,
      data: {
        grossSales: Math.round(grossSales),
        commissions: Math.round(commissions),
        estimatedCosts: Math.round(estimatedCosts),
        netProfit: Math.round(netProfit),
        dailyData,
        recentPayouts: recentPayouts.reverse().slice(0, 15), // Top 15 recent payouts
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Failed to compile financial ledger.",
    };
  }
}
