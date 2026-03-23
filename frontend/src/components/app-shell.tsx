"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    `rounded-md px-3 py-2 text-sm ${pathname === path ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-semibold">
            TripGenie
          </Link>
          <nav className="flex items-center gap-2">
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
              className="rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
