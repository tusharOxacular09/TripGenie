"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { ProtectedPage } from "../../components/protected-page";
import { authApi } from "../../services/api/auth.api";
import { getErrorMessage } from "../../shared/error-message";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUser } from "../../store/auth.slice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile({ name, email });
      dispatch(setUser(updatedUser));
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="text-2xl font-semibold">Profile</h1>
          {message ? <p className="rounded-md bg-emerald-900 px-3 py-2 text-sm text-emerald-200">{message}</p> : null}
          {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p> : null}
          <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="space-y-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
              <input
                required
                placeholder="Alex Traveler"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                required
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
