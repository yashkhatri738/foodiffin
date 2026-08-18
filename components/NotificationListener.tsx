"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NotificationListener() {
  useEffect(() => {
    const supabase = createClient();
    let currentUserId: string | null = null;

    // Fetch user details initially
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        currentUserId = user.id;
      }
    });

    // Listen to authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        currentUserId = session.user.id;
      } else {
        currentUserId = null;
      }
    });

    // Subscribe to realtime orders updates
    const channel = supabase
      .channel("live-push-alerts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new;
          const oldOrder = payload.old;

          // Only notify if order belongs to the logged-in customer
          if (currentUserId && newOrder.user_id === currentUserId) {
            if (newOrder.status !== oldOrder.status) {
              let title = "Order Update";
              let msg = `Order status updated to: ${newOrder.status}`;

              if (newOrder.status === "confirmed") {
                title = "🍳 Order Confirmed";
                msg = "The kitchen has accepted and confirmed your fresh tiffin!";
              } else if (newOrder.status === "packed") {
                title = "📦 Food Packed";
                msg = "Your hot meal has been prepared and packed.";
              } else if (newOrder.status === "out_for_delivery") {
                title = "🚴 Out for Delivery";
                msg = "Rider has picked up your food and is on the way!";
              } else if (newOrder.status === "delivered") {
                title = "🎉 Order Delivered";
                msg = "Your meal was successfully delivered. Bon appétit!";
              } else if (newOrder.status === "cancelled") {
                title = "❌ Order Cancelled";
                msg = "The kitchen was unable to process and cancelled your order.";
              }

              toast(title, {
                description: msg,
                duration: 6000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
