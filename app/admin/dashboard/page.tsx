import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForAdmin } from "@/lib/restaurant.action";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChefHat,
  Clock3,
  Flame,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return { label: "Pending", color: "bg-amber-100 text-amber-700" };
    case "confirmed":
      return { label: "Confirmed", color: "bg-blue-100 text-blue-700" };
    case "packed":
      return { label: "Packing", color: "bg-sky-100 text-sky-700" };
    case "out_for_delivery":
      return { label: "Out for Delivery", color: "bg-violet-100 text-violet-700" };
    case "delivered":
      return { label: "Delivered", color: "bg-emerald-100 text-emerald-700" };
    case "cancelled":
      return { label: "Cancelled", color: "bg-red-100 text-red-700" };
    default:
      return { label: status, color: "bg-stone-100 text-stone-700" };
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const restaurantRes = await getRestaurantForAdmin();
  if (!restaurantRes.success || !restaurantRes.data) {
    redirect("/onboarding");
  }

  const restaurant = restaurantRes.data as { id: string; name: string };

  // Fetch unified analytics from database view
  const { data: analytics } = await supabase
    .from("restaurant_dashboard_analytics")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .single();

  const totalRevenue = analytics?.total_revenue || 0;
  const totalOrdersCount = analytics?.total_orders_count || 0;
  const activeOrdersCount = analytics?.active_orders_count || 0;
  const avgPrepTime = analytics?.avg_prep_time || 20;
  const averageRating = analytics?.average_rating || 4.8;
  const ratingCount = analytics?.rating_count || 0;

  // Fetch recent orders list for display (last 4 orders)
  const { data: displayOrdersData } = await supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total_amount,
      status,
      profiles (
        full_name
      ),
      order_items (
        id,
        quantity,
        dishes (
          name
        )
      )
    `)
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const displayOrders = displayOrdersData || [];

  // Calculate Menu Velocity from all orders of the restaurant
  const { data: allOrders } = await supabase
    .from("orders")
    .select(`
      status,
      order_items (
        quantity,
        dishes (
          name
        )
      )
    `)
    .eq("restaurant_id", restaurant.id);

  // Menu Velocity
  const velocityMap: Record<string, { name: string; sold: number }> = {};
  allOrders?.forEach(order => {
    if (order.status === "cancelled") return;
    order.order_items?.forEach((item: any) => {
      const dishName = item.dishes?.name;
      if (dishName) {
        if (!velocityMap[dishName]) {
          velocityMap[dishName] = { name: dishName, sold: 0 };
        }
        velocityMap[dishName].sold += item.quantity;
      }
    });
  });

  const menuVelocity = Object.values(velocityMap)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3);

  const maxSold = menuVelocity.length > 0 ? Math.max(...menuVelocity.map(d => d.sold)) : 1;

  // Count today's orders
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: dbTodayCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", todayStart.toISOString());

  const todayCount = dbTodayCount || 0;

  // Fetch dishes list to count total dishes
  const { data: dishesData } = await supabase
    .from("dishes")
    .select("id")
    .eq("restaurant_id", restaurant.id);
  const dishes = dishesData || [];

  // Setup Stats Array
  const stats = [
    {
      label: "Total revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      delta: `${totalOrdersCount} orders`,
      icon: Wallet,
      tone: "from-emerald-500 to-teal-500",
    },
    {
      label: "Active orders",
      value: String(activeOrdersCount),
      delta: activeOrdersCount > 0 ? "live now" : "no live orders",
      icon: ShoppingBag,
      tone: "from-orange-500 to-rose-500",
    },
    {
      label: "Avg prep time",
      value: `${avgPrepTime}m`,
      delta: "dish average",
      icon: Clock3,
      tone: "from-sky-500 to-cyan-500",
    },
    {
      label: "Rating",
      value: String(averageRating),
      delta: `${ratingCount} review${ratingCount !== 1 ? "s" : ""}`,
      icon: Star,
      tone: "from-amber-400 to-yellow-500",
    },
  ];

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4">
      {/* Header */}
      <header className="portal-glass flex flex-col gap-4 rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
            <Activity size={14} />
            Live Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {restaurant.name} dashboard
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-600">
            Track orders, revenue, menu velocity, and kitchen timing from a
            single workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/orders">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/85 px-4 text-sm font-bold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
              <Search size={16} />
              Search orders
            </button>
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-xl bg-white/85 text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
            <Bell size={17} />
          </button>
          <Link href="/admin/adddish">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700">
              <Plus size={17} />
              New dish
            </button>
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="portal-card portal-tilt rounded-[20px] border border-white/75 bg-white/80 p-4 shadow-xl shadow-stone-900/5"
          >
            <div className="flex items-start justify-between">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${stat.tone} text-white shadow-md`}
              >
                <stat.icon size={19} />
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                {stat.delta}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-stone-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      {/* Orders + Side panels */}
      <div className="grid flex-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        {/* Order flow */}
        <section className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Order flow</h2>
              <p className="text-sm text-stone-500">
                Live kitchen queue and delivery handoff.
              </p>
            </div>
            <Link href="/admin/orders">
              <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-stone-950 px-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                View all
                <ArrowUpRight size={15} />
              </button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {displayOrders.length === 0 ? (
              <div className="py-12 text-center text-stone-500">
                <ShoppingBag className="mx-auto text-stone-300 mb-3" size={32} />
                No orders registered yet
              </div>
            ) : (
              displayOrders.map((order, index) => {
                const badge = getStatusBadge(order.status);
                // Get main dish name
                const itemsCount = order.order_items?.length || 0;
                const mainItem = order.order_items?.[0] as any;
                const dishLabel = mainItem?.dishes?.name
                  ? `${mainItem.dishes.name}${itemsCount > 1 ? ` + ${itemsCount - 1} other items` : ""}`
                  : "General meal";

                const formattedTime = new Date(order.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={order.id}
                    className="portal-row group grid gap-3 rounded-[18px] border border-stone-100 bg-white/75 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-lg hover:shadow-orange-500/10 md:grid-cols-[0.8fr_1fr_0.7fr_auto]"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div>
                      <p className="font-bold">#FD-{order.id.slice(0, 5).toUpperCase()}</p>
                      <p className="text-sm text-stone-500">
                        {(Array.isArray(order.profiles)
                          ? (order.profiles[0] as any)?.full_name
                          : (order.profiles as any)?.full_name) || "Guest Customer"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{dishLabel}</p>
                      <p className="flex items-center gap-1 text-sm text-stone-500">
                        <Clock3 size={13} />
                        {formattedTime}
                      </p>
                    </div>
                    <span
                      className={`h-fit w-fit rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <Link href="/admin/orders">
                      <button className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-stone-700 transition group-hover:bg-orange-600 group-hover:text-white">
                        <ArrowUpRight size={16} />
                      </button>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right side */}
        <aside className="flex flex-col gap-4">
          {/* Peak forecast */}
          {/* <section className="portal-spotlight overflow-hidden rounded-[24px] bg-stone-950 p-5 text-white shadow-xl shadow-stone-950/20">
            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-100">
                  Peak forecast
                </span>
                <Flame className="text-orange-300" size={20} />
              </div>
              <p className="text-4xl font-bold tracking-tight">8:45 PM</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Peak dinner traffic. Optimize tiffin boxes packing pipelines and ensure ready tags are updated live.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 p-2.5">
                <CalendarDays size={16} className="text-orange-200" />
                <span className="text-sm font-semibold">
                  {todayCount} completed & live preorders
                </span>
              </div>
            </div>
          </section> */}

          {/* Menu velocity */}
          <section className="portal-card rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight">
                  Menu velocity
                </h2>
                <p className="text-sm text-stone-500">Top movers today</p>
              </div>
              <TrendingUp size={18} className="text-emerald-600" />
            </div>

            <div className="space-y-4">
              {menuVelocity.length === 0 ? (
                <div className="py-6 text-center text-stone-400 text-xs">
                  No sales recorded yet
                </div>
              ) : (
                menuVelocity.map((item) => {
                  const progressPct = Math.round((item.sold / maxSold) * 100);
                  return (
                    <div key={item.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="text-xs text-stone-500">
                            {item.sold} items sold
                          </p>
                        </div>
                        <span className="text-sm font-bold text-orange-700">
                          {progressPct}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Quick stats */}
          <section className="portal-card grid gap-3 rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:grid-cols-2">
            <div className="rounded-[18px] bg-[#eef8f4] p-3.5">
              <MapPin className="mb-3 text-emerald-700" size={18} />
              <p className="text-xl font-bold">{allOrders?.length || 0}</p>
              <p className="text-xs font-medium text-stone-500">
                All-time orders
              </p>
            </div>
            <div className="rounded-[18px] bg-[#fff1e8] p-3.5">
              <ChefHat className="mb-3 text-orange-700" size={18} />
              <p className="text-xl font-bold">{dishes?.length || 0}</p>
              <p className="text-xs font-medium text-stone-500">
                Menu dishes
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
