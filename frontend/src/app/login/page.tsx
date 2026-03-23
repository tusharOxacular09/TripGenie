"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../../components/auth-layout";
import { loginFlow } from "../../features/auth/auth.thunks";
import { authValidators } from "../../features/auth/auth.validators";
import { getErrorMessage } from "../../shared/error-message";
import { useAppDispatch } from "../../store/hooks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        {error ? <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        <div className="space-y-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
          />
        </div>
        <div className="space-y-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 outline-none ring-indigo-500 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
