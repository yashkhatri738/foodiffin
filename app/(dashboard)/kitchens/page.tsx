import { getAllRestaurants } from "@/lib/restaurant.action";
import { type Restaurant } from "@/components/HomeClient";
import KitchensClient from "@/components/KitchensClient";

export const dynamic = "force-dynamic";

export default async function KitchensPage() {
  const restaurantResult = await getAllRestaurants();
  const restaurants = (
    restaurantResult.success && restaurantResult.data
      ? restaurantResult.data
      : []
  ) as Restaurant[];

  return <KitchensClient restaurants={restaurants} />;
}
