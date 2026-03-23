"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginFlow } from "../../features/auth/auth.thunks";
import { authValidators } from "../../features/auth/auth.validators";
import { getErrorMessage } from "../../shared/error-message";
import { useAppDispatch } from "../../store/hooks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p> : null}
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-300">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-sm text-slate-400">
          New user?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}
