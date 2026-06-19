import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if they have a restaurant
  let restaurantId = user.user_metadata?.restaurant_id;

  if (!restaurantId) {
    // Fallback: check database where owner_id = user.id
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
    redirect("/profile");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
