import Link from "next/link";
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
  {
    name: "Paneer butter masala",
    sold: 96,
    stock: "Low by 9 PM",
    progress: "74%",
  },
  { name: "Veg pulao bowl", sold: 82, stock: "Strong", progress: "68%" },
];

export default function DashboardPage() {
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
            Restaurant command center
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-600">
            Track orders, revenue, menu velocity, and kitchen timing from a
            single workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-xl bg-white/80 px-4 text-sm font-medium text-stone-500 shadow-inner shadow-stone-900/5 sm:flex">
            <Search size={16} />
            Search orders
          </div>
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
            <button className="inline-flex h-9 items-center gap-2 rounded-xl bg-stone-950 px-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              View all
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className="portal-row group grid gap-3 rounded-[18px] border border-stone-100 bg-white/75 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-lg hover:shadow-orange-500/10 md:grid-cols-[0.8fr_1fr_0.7fr_auto]"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div>
                  <p className="font-bold">{order.id}</p>
                  <p className="text-sm text-stone-500">{order.customer}</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{order.dish}</p>
                  <p className="flex items-center gap-1 text-sm text-stone-500">
                    <Clock3 size={13} />
                    {order.time}
                  </p>
                </div>
                <span
                  className={`h-fit w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${order.color}`}
                >
                  {order.status}
                </span>
                <button className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-stone-700 transition group-hover:bg-orange-600 group-hover:text-white">
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Right side */}
        <aside className="flex flex-col gap-4">
          {/* Peak forecast */}
          <section className="portal-spotlight overflow-hidden rounded-[24px] bg-stone-950 p-5 text-white shadow-xl shadow-stone-950/20">
            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-100">
                  Peak forecast
                </span>
                <Flame className="text-orange-300" size={20} />
              </div>
              <p className="text-4xl font-bold tracking-tight">8:45 PM</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Expected second spike. Add two prep slots for paneer dishes and
                pause low-stock bowls.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 p-2.5">
                <CalendarDays size={16} className="text-orange-200" />
                <span className="text-sm font-semibold">
                  32 preorders scheduled
                </span>
              </div>
            </div>
          </section>

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
              {menuItems.map((item) => (
                <div key={item.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        {item.sold} sold · {item.stock}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-orange-700">
                      {item.progress}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"
                      style={{ width: item.progress }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick stats */}
          <section className="portal-card grid gap-3 rounded-[24px] border border-white/75 bg-white/82 p-4 shadow-xl shadow-stone-900/5 sm:grid-cols-2">
            <div className="rounded-[18px] bg-[#eef8f4] p-3.5">
              <MapPin className="mb-3 text-emerald-700" size={18} />
              <p className="text-xl font-bold">12</p>
              <p className="text-xs font-medium text-stone-500">
                Riders nearby
              </p>
            </div>
            <div className="rounded-[18px] bg-[#fff1e8] p-3.5">
              <ChefHat className="mb-3 text-orange-700" size={18} />
              <p className="text-xl font-bold">6</p>
              <p className="text-xs font-medium text-stone-500">
                Kitchen stations
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
