import { getAllRestaurants } from "@/lib/restaurant.action";
import HomeClient, { type Restaurant } from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const restaurantResult = await getAllRestaurants();

  const restaurants = (
    restaurantResult.success && restaurantResult.data
      ? restaurantResult.data
      : []
  ) as Restaurant[];

  return <HomeClient restaurants={restaurants} />;
}
