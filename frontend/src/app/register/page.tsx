"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../../components/auth-layout";
import { registerFlow } from "../../features/auth/auth.thunks";
import { authValidators } from "../../features/auth/auth.validators";
import { authStorage } from "../../lib/auth";
import { getErrorMessage } from "../../shared/error-message";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nameInputId = "register-name";
  const emailInputId = "register-email";
  const passwordInputId = "register-password";

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
      authValidators.validateRegisterInput(name, email, password);
      await dispatch(registerFlow({ name, email, password }));
      router.replace("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start planning smarter trips with AI">
      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <p role="alert" aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor={nameInputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id={nameInputId}
            required
            autoComplete="name"
            placeholder="Alex Traveler"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
          />
        </div>
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
              autoComplete="new-password"
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
          <p className="text-xs text-slate-500">Minimum 6 characters</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
