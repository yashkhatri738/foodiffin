"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  ChefHat,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  Sparkles,
  User,
  Utensils,
  X,
} from "lucide-react";
import { logout } from "@/lib/supabase/auth.action";

const navItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Dishes", href: "/admin/dishes", icon: Utensils },
  { label: "Profile", href: "/admin/profile", icon: User },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const res = await logout();
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Logged out");
      router.push("/login");
    }
  };

  return (
    <div className="portal-shell min-h-screen text-stone-950">
      <div className="portal-aurora portal-aurora-one" />
      <div className="portal-aurora portal-aurora-two" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] gap-0 p-3 sm:p-5 lg:gap-4">
        {/* ── Desktop Sidebar ── */}
        <aside className="portal-glass sticky top-5 hidden h-[calc(100vh-2.5rem)] w-[230px] shrink-0 flex-col rounded-[24px] border border-white/70 p-4 shadow-xl shadow-stone-900/10 lg:flex">
          <Link href="/" className="mb-6 flex items-center gap-3 px-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-500/20">
              <ChefHat size={20} />
            </span>
            <span>
              <span className="block text-base font-bold tracking-tight text-orange-600">
                Foodiffin
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                partner
              </span>
            </span>
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                      : "text-stone-600 hover:bg-white/80 hover:text-stone-950"
                  }`}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </aside>

        {/* ── Mobile Header ── */}
        <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/60 bg-[#f7f3eb]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-600 text-white">
              <ChefHat size={18} />
            </span>
            <span className="text-base font-bold tracking-tight text-orange-600">
              Foodiffin
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid h-9 w-9 place-items-center rounded-lg bg-white/80 text-stone-700"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* ── Mobile Nav Drawer ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="absolute left-0 top-14 flex w-64 flex-col gap-1.5 rounded-r-2xl border-r border-white/60 bg-[#f7f3eb] p-4 shadow-xl">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                      active
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                        : "text-stone-600 hover:bg-white/80"
                    }`}
                  >
                    <item.icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-stone-200" />
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </nav>
          </div>
        )}

        {/* ── Main Content ── */}
        <main className="min-w-0 flex-1 pt-16 lg:pt-0">{children}</main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
