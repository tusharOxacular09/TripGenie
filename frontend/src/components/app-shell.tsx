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
    `whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${
      pathname === path ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Plane className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900">TripGenie</span>
          </Link>
          <div className="w-full overflow-x-auto sm:w-auto">
            <nav aria-label="Primary navigation" className="flex min-w-max w-full items-center justify-around gap-2 sm:w-auto sm:justify-start">
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
                className="whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white hover:bg-slate-800 sm:px-3 sm:py-2 sm:text-sm"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
