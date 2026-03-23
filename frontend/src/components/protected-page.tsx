"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authStorage } from "../lib/auth";
import { useAppSelector } from "../store/hooks";

type Props = {
  children: React.ReactNode;
};

export function ProtectedPage({ children }: Props) {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());

  useEffect(() => {
    if (!isAuthenticated && !hasRefreshToken) {
      router.replace("/login");
    }
  }, [router, isAuthenticated, hasRefreshToken]);

  if (!isAuthenticated) {
    return (
      <div className="py-12 text-center text-slate-400" role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
