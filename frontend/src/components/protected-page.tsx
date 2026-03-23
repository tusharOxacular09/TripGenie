"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authStorage } from "../lib/auth";

type Props = {
  children: React.ReactNode;
};

export function ProtectedPage({ children }: Props) {
  const router = useRouter();
  const token = authStorage.getToken();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  if (!token) {
    return <div className="py-12 text-center text-slate-400">Loading...</div>;
  }

  return <>{children}</>;
}
