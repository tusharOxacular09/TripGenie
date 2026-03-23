"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authStorage } from "../lib/auth";
import { useAppSelector } from "../store/hooks";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());

  useEffect(() => {
    if (isAuthenticated || hasRefreshToken) {
      router.replace("/dashboard");
      return;
    }
    router.replace("/login");
  }, [router, isAuthenticated, hasRefreshToken]);

  return <div className="py-12 text-center text-slate-400">Loading...</div>;
}
