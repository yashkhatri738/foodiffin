"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChefHat, LogOut, Menu, ShoppingBag, User, X } from "lucide-react";
import { logout } from "@/lib/supabase/auth.action";
import { toast } from "sonner";

type UserProfile = {
  full_name?: string | null;
  email?: string | null;
} | null;

export default function Navbar({ profile }: { profile?: UserProfile }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!profile;
  const userName = profile?.full_name || "User";
  const userEmail = profile?.email || "";
  const userInitial = (userName[0] || "U").toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    const res = await logout();
    if (res.success) {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-600 text-white">
            <ChefHat size={16} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-orange-600">Food</span>
            <span className="text-stone-700">iffin</span>
          </span>
        </Link>

        <div className="ml-4 hidden items-center gap-0.5 lg:flex">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          >
            Home
          </Link>
          <a
            href="#restaurants"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          >
            Kitchens
          </a>
          <a
            href="#about"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          >
            About
          </a>
        </div>

        <div className="ml-auto" />

        {/* Auth / Profile */}
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition hover:bg-orange-100"
            >
              <span className="text-xs font-semibold">{userInitial}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
                <div className="flex items-center gap-2.5 px-2.5 py-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-semibold text-white">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-800">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-stone-400">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <div className="my-1 h-px bg-stone-100" />
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-stone-600 transition hover:bg-stone-50 hover:text-orange-600"
                >
                  <User size={14} /> Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-stone-600 transition hover:bg-stone-50 hover:text-orange-600"
                >
                  <ShoppingBag size={14} /> My Orders
                </Link>
                <div className="my-1 h-px bg-stone-100" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-600 transition hover:border-stone-300"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="flex h-9 items-center rounded-lg bg-orange-600 px-3.5 text-sm font-medium text-white transition hover:bg-orange-700"
            >
              Sign Up
            </Link>
          </div>
        )}

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg bg-stone-100 text-stone-600 sm:ml-0 lg:hidden"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mx-auto grid max-w-7xl gap-1 px-4 pb-3 sm:px-6 lg:hidden">
          <Link
            href="/"
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <a
            href="#restaurants"
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
            onClick={() => setMobileOpen(false)}
          >
            Kitchens
          </a>
          <a
            href="#about"
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
            onClick={() => setMobileOpen(false)}
          >
            About
          </a>
          {isLoggedIn ? (
            <Link
              href="/profile"
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
              onClick={() => setMobileOpen(false)}
            >
              Profile
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
