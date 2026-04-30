import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChefHat,
  Clock3,
  Flame,
  LayoutDashboard,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";

const stats = [
  {
    label: "Today's revenue",
    value: "₹18,420",
    delta: "+18.2%",
    icon: Wallet,
    tone: "from-emerald-500 to-teal-500",
  },
  {
    label: "Active orders",
    value: "46",
    delta: "+9 live",
    icon: ShoppingBag,
    tone: "from-orange-500 to-rose-500",
  },
  {
    label: "Avg prep time",
    value: "22m",
    delta: "-4m faster",
    icon: Clock3,
    tone: "from-sky-500 to-cyan-500",
  },
  {
    label: "Rating",
    value: "4.8",
    delta: "312 reviews",
    icon: Star,
    tone: "from-amber-400 to-yellow-500",
  },
];

const orders = [
  {
    id: "#FD-2841",
    customer: "Aarav Mehta",
    dish: "Paneer thali",
    time: "08:20 PM",
    status: "Cooking",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "#FD-2840",
    customer: "Nisha Rao",
    dish: "Mini tiffin combo",
    time: "08:14 PM",
    status: "Packing",
    color: "bg-sky-100 text-sky-700",
  },
  {
    id: "#FD-2839",
    customer: "Rohan Shah",
    dish: "Dal rice bowl",
    time: "08:06 PM",
    status: "Ready",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "#FD-2838",
    customer: "Meera Jain",
    dish: "Gujarati tiffin",
    time: "07:55 PM",
    status: "Rider assigned",
    color: "bg-violet-100 text-violet-700",
  },
];

const menuItems = [
  { name: "Homestyle thali", sold: 128, stock: "Strong", progress: "92%" },
  { name: "Paneer butter masala", sold: 96, stock: "Low by 9 PM", progress: "74%" },
  { name: "Veg pulao bowl", sold: 82, stock: "Strong", progress: "68%" },
];

const nav = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Orders", icon: PackageCheck },
  { label: "Menu", icon: Utensils },
  { label: "Customers", icon: MessageSquareText },
  { label: "Settings", icon: Settings },
];

export default function DashboardPage() {
  return (
    <main className="portal-shell min-h-screen overflow-hidden bg-[#f7f3eb] text-stone-950">
      <div className="portal-aurora portal-aurora-one" />
      <div className="portal-aurora portal-aurora-two" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 p-3 sm:p-5">
        <aside className="portal-glass hidden w-[250px] shrink-0 flex-col rounded-[28px] border border-white/70 p-4 shadow-2xl shadow-stone-900/10 lg:flex">
          <Link href="/" className="mb-7 flex items-center gap-3 px-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-white shadow-lg shadow-orange-500/20">
              <ChefHat size={22} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">
                Foodiffin
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                partner
              </span>
            </span>
          </Link>

          <nav className="space-y-2">
            {nav.map((item) => (
              <button
                key={item.label}
                className={`group flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-bold transition ${
                  item.active
                    ? "bg-stone-950 text-white shadow-xl shadow-stone-950/20"
                    : "text-stone-600 hover:bg-white/80 hover:text-stone-950"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto overflow-hidden rounded-[24px] bg-stone-950 p-4 text-white shadow-2xl shadow-orange-500/20">
            <div className="mb-8 inline-flex rounded-full bg-white/10 p-2 text-orange-200">
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-bold">Dinner rush mode is active</p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              Prioritize thalis, keep prep under 25 minutes, and highlight
              high-margin combos.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="portal-glass flex flex-col gap-4 rounded-[28px] border border-white/70 p-4 shadow-xl shadow-stone-900/5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                <Activity size={14} />
                Live Portal
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Restaurant command center
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Track orders, revenue, menu velocity, and kitchen timing from a
                single polished workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden h-11 items-center gap-2 rounded-2xl bg-white/80 px-4 text-sm font-medium text-stone-500 shadow-inner shadow-stone-900/5 sm:flex">
                <Search size={17} />
                Search orders
              </div>
              <button className="grid h-11 w-11 place-items-center rounded-2xl bg-white/85 text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
                <Bell size={18} />
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-orange-600 px-4 text-sm font-black text-white shadow-xl shadow-orange-600/25 transition hover:-translate-y-0.5 hover:bg-orange-700">
                <Plus size={18} />
                New dish
              </button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="portal-card portal-tilt rounded-[26px] border border-white/75 bg-white/80 p-5 shadow-xl shadow-stone-900/5"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${stat.tone} text-white shadow-lg`}
                  >
                    <stat.icon size={21} />
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {stat.delta}
                  </span>
                </div>
                <p className="mt-6 text-sm font-semibold text-stone-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-black tracking-tight">
                  {stat.value}
                </p>
              </article>
            ))}
          </div>

          <div className="grid flex-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="portal-card rounded-[30px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Order flow
                  </h2>
                  <p className="text-sm text-stone-500">
                    Live kitchen queue and delivery handoff.
                  </p>
                </div>
                <button className="inline-flex h-10 items-center gap-2 rounded-2xl bg-stone-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5">
                  View all
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {orders.map((order, index) => (
                  <div
                    key={order.id}
                    className="portal-row group grid gap-3 rounded-[22px] border border-stone-100 bg-white/75 p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-500/10 md:grid-cols-[0.8fr_1fr_0.7fr_auto]"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div>
                      <p className="font-black">{order.id}</p>
                      <p className="text-sm text-stone-500">{order.customer}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">
                        {order.dish}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-stone-500">
                        <Clock3 size={14} />
                        {order.time}
                      </p>
                    </div>
                    <span
                      className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-black ${order.color}`}
                    >
                      {order.status}
                    </span>
                    <button className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-100 text-stone-700 transition group-hover:bg-orange-600 group-hover:text-white">
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <aside className="flex flex-col gap-4">
              <section className="portal-spotlight overflow-hidden rounded-[30px] bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20">
                <div className="relative z-10">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-orange-100">
                      Peak forecast
                    </span>
                    <Flame className="text-orange-300" size={22} />
                  </div>
                  <p className="text-5xl font-black tracking-tight">8:45 PM</p>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    Expected second spike. Add two prep slots for paneer dishes
                    and pause low-stock bowls.
                  </p>
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                    <CalendarDays size={18} className="text-orange-200" />
                    <span className="text-sm font-bold">
                      32 preorders scheduled
                    </span>
                  </div>
                </div>
              </section>

              <section className="portal-card rounded-[30px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">
                      Menu velocity
                    </h2>
                    <p className="text-sm text-stone-500">Top movers today</p>
                  </div>
                  <TrendingUp size={20} className="text-emerald-600" />
                </div>

                <div className="space-y-5">
                  {menuItems.map((item) => (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black">{item.name}</p>
                          <p className="text-xs text-stone-500">
                            {item.sold} sold · {item.stock}
                          </p>
                        </div>
                        <span className="text-sm font-black text-orange-700">
                          {item.progress}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"
                          style={{ width: item.progress }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="portal-card grid gap-3 rounded-[30px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5 sm:grid-cols-2">
                <div className="rounded-[22px] bg-[#eef8f4] p-4">
                  <MapPin className="mb-4 text-emerald-700" size={20} />
                  <p className="text-2xl font-black">12</p>
                  <p className="text-xs font-semibold text-stone-500">
                    Riders nearby
                  </p>
                </div>
                <div className="rounded-[22px] bg-[#fff1e8] p-4">
                  <ChefHat className="mb-4 text-orange-700" size={20} />
                  <p className="text-2xl font-black">6</p>
                  <p className="text-xs font-semibold text-stone-500">
                    Kitchen stations
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
