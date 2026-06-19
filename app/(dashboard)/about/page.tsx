import Link from "next/link";
import {
  ChefHat,
  Heart,
  Clock,
  ShieldCheck,
  Leaf,
  Calendar,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";

export const metadata = {
  title: "About Us | Foodiffin",
  description: "Learn about Foodiffin's mission to deliver kitchen-fresh home-style subscription tiffins, support local chefs, and provide healthy meals.",
};

export default function AboutPage() {
  const pillars = [
    {
      title: "Verified Hygiene",
      desc: "All our kitchen partners follow meticulous health standards. Every kitchen is audited to guarantee sanitation.",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      title: "Fresh Ingredients",
      desc: "Meals are made daily from scratch using organic vegetables, fresh spices, and zero chemical preservatives.",
      icon: Leaf,
      color: "bg-orange-50 text-orange-700 border-orange-100",
    },
    {
      title: "Flexible Scheduling",
      desc: "Pause or shift tiffins at your convenience. Select lunch delivery, dinner delivery, or daily combinations.",
      icon: Calendar,
      color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: "Sustainable Loop",
      desc: "We prioritize eco-friendly reusable tiffin packing routines to reduce single-use plastic boxes and packaging waste.",
      icon: Clock,
      color: "bg-purple-50 text-purple-700 border-purple-100",
    },
  ];

  return (
    <main className="relative min-h-screen bg-stone-50 text-stone-800 py-16 overflow-hidden">
      {/* Decorative Aurora background */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-orange-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-96 h-[500px] w-[500px] rounded-full bg-amber-100/30 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
            <Sparkles size={14} className="text-orange-500" />
            Our Story
          </div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight sm:text-6xl leading-none">
            Fresh Home Meals, <br />
            <span className="text-orange-650">Delivered With Care</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base text-stone-500 leading-relaxed sm:text-lg">
            Foodiffin is a community-first dining network, linking independent home-chefs and local kitchens with professionals looking for fresh, hot, and healthy tiffin packages.
          </p>
        </section>

        {/* Vision Panel */}
        <section className="mb-16 rounded-[32px] border border-white/60 bg-white/70 backdrop-blur-md p-8 sm:p-12 shadow-xl shadow-stone-900/5 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight sm:text-3xl mb-4">
              Connecting Local Kitchens with Happy Bellies
            </h2>
            <div className="space-y-4 text-sm text-stone-605 leading-relaxed">
              <p>
                We believe that eating healthy shouldn't feel like a chore. Fast food chain deliveries are heavily processed, and cooking fresh meals every single day is difficult.
              </p>
              <p>
                Foodiffin solves this problem. We provide local kitchen partners with custom billing, operations, and menu velocity metrics, while offering customers subscription schedules packed with nutritious home recipes.
              </p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl aspect-video sm:aspect-square flex items-center justify-center p-8 text-white shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0" />
            <div className="z-10 text-center space-y-3">
              <UtensilsCrossed size={48} className="mx-auto text-orange-100" />
              <p className="text-lg font-black uppercase tracking-widest text-orange-100">Foodiffin Mission</p>
              <p className="text-xs leading-relaxed text-white/95">
                "Promote home-style micro-kitchens, generate consistent livelihoods for culinary enthusiasts, and bring delicious simplicity back to subscription meals."
              </p>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="mb-16">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight text-center mb-8">
            Why Choose Foodiffin?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md flex items-start gap-4"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${pillar.color} shadow-sm`}>
                  <pillar.icon size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-stone-850">{pillar.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16 rounded-[28px] border border-stone-200 bg-white p-8 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-8">
            How Subscriptions Work
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Browse Kitchens",
                desc: "Explore details, menus, user ratings, and certified hygiene reviews of local kitchens in your delivery area.",
              },
              {
                step: "02",
                title: "Choose Weekly/Monthly",
                desc: "Select Veg/Non-Veg boxes. Setup your delivery slot (Lunch or Dinner) and choose your subscription duration.",
              },
              {
                step: "03",
                title: "Enjoy Daily Freshness",
                desc: "Our delivery network drops off hot, freshly prepared meal boxes. Easily pause or modify your schedule from your profile.",
              },
            ].map((item) => (
              <div key={item.step} className="space-y-2">
                <span className="text-2xl font-black text-orange-600 block">{item.step}</span>
                <h3 className="text-sm font-bold text-stone-850">{item.title}</h3>
                <p className="text-xs leading-relaxed text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center rounded-3xl bg-stone-950 p-8 sm:p-12 text-white shadow-xl">
          <ChefHat size={36} className="mx-auto text-orange-400 mb-4" />
          <h2 className="text-2xl font-extrabold sm:text-3.5xl tracking-tight leading-none mb-3">
            Ready to Taste Homemade Goodness?
          </h2>
          <p className="text-xs text-white/60 max-w-sm mx-auto mb-6">
            Get started by exploring our partner kitchens, cooking authentic recipes tailored for you.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/kitchens"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition"
            >
              Explore Kitchens
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
