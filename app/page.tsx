import { getAllRestaurants } from "@/lib/restaurant.action";
import HomeClient, { type Restaurant } from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await getAllRestaurants();
  const restaurants = (
    result.success && result.data ? result.data : []
  ) as Restaurant[];

  return <HomeClient restaurants={restaurants} />;
}
