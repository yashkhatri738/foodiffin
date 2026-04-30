import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BellRing,
  ChefHat,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";

const settings = [
  { label: "Kitchen alerts", value: "Enabled", icon: BellRing },
  { label: "Payout method", value: "UPI verified", icon: CreditCard },
  { label: "Food safety", value: "Compliant", icon: ShieldCheck },
];

export default function AdminProfilePage() {
  return (
    <main className="portal-shell min-h-screen overflow-hidden bg-[#f7f3eb] p-3 text-stone-950 sm:p-5">
      <div className="portal-aurora portal-aurora-one" />
      <div className="portal-aurora portal-aurora-two" />

      <section className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col gap-4">
        <header className="portal-glass rounded-[28px] border border-white/70 p-5 shadow-xl shadow-stone-900/5">
          <Link
            href="/admin/dashboard"
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-white hover:text-orange-700"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                <Store size={14} />
                Admin profile
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Spice Garden Kitchen
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Manage restaurant identity, operational preferences, and
                partner verification details.
              </p>
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 text-sm font-black text-white shadow-xl shadow-stone-950/20 transition hover:-translate-y-0.5">
              <BadgeCheck size={18} />
              Verified partner
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="portal-card rounded-[30px] border border-white/75 bg-white/82 p-6 text-center shadow-xl shadow-stone-900/5">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-[34px] bg-stone-950 text-white shadow-2xl shadow-orange-500/20">
              <ChefHat size={44} />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight">
              Yash Sharma
            </h2>
            <p className="text-sm font-semibold text-stone-500">
              Owner and kitchen admin
            </p>

            <div className="mt-7 space-y-3 text-left">
              <div className="rounded-[22px] bg-[#eef8f4] p-4">
                <p className="flex items-center gap-2 text-sm font-black">
                  <Mail size={16} className="text-emerald-700" />
                  yash@foodiffin.com
                </p>
              </div>
              <div className="rounded-[22px] bg-[#fff1e8] p-4">
                <p className="flex items-center gap-2 text-sm font-black">
                  <Phone size={16} className="text-orange-700" />
                  +91 98765 43210
                </p>
              </div>
              <div className="rounded-[22px] bg-white p-4 shadow-inner shadow-stone-900/5">
                <p className="flex items-center gap-2 text-sm font-black">
                  <MapPin size={16} className="text-sky-700" />
                  Ahmedabad, Gujarat
                </p>
              </div>
            </div>
          </aside>

          <section className="grid gap-4">
            <div className="portal-card rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-xl shadow-stone-900/5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    Restaurant details
                  </h2>
                  <p className="text-sm text-stone-500">
                    Public-facing partner information.
                  </p>
                </div>
                <Store className="text-orange-700" size={22} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["Restaurant name", "Spice Garden Kitchen"],
                  ["Cuisine focus", "Homestyle Indian meals"],
                  ["Service hours", "8:00 AM - 10:30 PM"],
                  ["Delivery radius", "6.5 km"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] bg-stone-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">
                      {label}
                    </p>
                    <p className="mt-2 font-black text-stone-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {settings.map((item) => (
                <div
                  key={item.label}
                  className="portal-tilt rounded-[26px] border border-white/75 bg-white/82 p-5 shadow-xl shadow-stone-900/5"
                >
                  <item.icon className="mb-6 text-orange-700" size={22} />
                  <p className="text-sm font-black">{item.label}</p>
                  <p className="mt-1 text-xs font-semibold text-stone-500">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="portal-card rounded-[30px] border border-white/75 bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-orange-200">
                    <Clock size={17} />
                    Next profile review
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Scheduled for Friday
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Keep business hours, payout details, and kitchen documents
                    current to avoid order pauses.
                  </p>
                </div>
                <button className="h-11 rounded-2xl bg-white px-5 text-sm font-black text-stone-950 transition hover:-translate-y-0.5">
                  Update details
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
