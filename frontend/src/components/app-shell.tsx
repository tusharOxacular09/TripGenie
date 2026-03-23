"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { authStorage } from "../lib/auth";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/auth.slice";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    authStorage.clearRefreshToken();
    dispatch(logout());
    router.replace("/login");
  };

  const navLinkClass = (path: string) =>
    `rounded-lg px-3 py-2 text-sm ${pathname === path ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`;

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Plane className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900">TripGenie</span>
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-2">
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/trips/new" className={navLinkClass("/trips/new")}>
              Create Trip
            </Link>
            <Link href="/profile" className={navLinkClass("/profile")}>
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
