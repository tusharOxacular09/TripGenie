"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../../components/auth-layout";
import { loginFlow } from "../../features/auth/auth.thunks";
import { authValidators } from "../../features/auth/auth.validators";
import { authStorage } from "../../lib/auth";
import { getErrorMessage } from "../../shared/error-message";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailInputId = "login-email";
  const passwordInputId = "login-password";

  useEffect(() => {
    if (isAuthenticated || hasRefreshToken) {
      router.replace("/dashboard");
    }
  }, [router, isAuthenticated, hasRefreshToken]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      authValidators.validateLoginInput(email, password);
      await dispatch(loginFlow({ email, password }));
      router.replace("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your TripGenie account">
      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <p role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor={emailInputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id={emailInputId}
            type="email"
            required
            autoComplete="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={passwordInputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              id={passwordInputId}
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 outline-none ring-indigo-500 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls={passwordInputId}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
