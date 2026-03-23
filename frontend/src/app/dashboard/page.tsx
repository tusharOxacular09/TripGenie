"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { ProtectedPage } from "../../components/protected-page";
import { api, ApiError } from "../../lib/api";
import { Trip } from "../../types/api";

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const response = await api.listTrips();
        setTrips(response.trips);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load trips");
      } finally {
        setLoading(false);
      }
    };
    void loadTrips();
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your trips</h1>
          <Link href="/trips/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">
            Create Trip
          </Link>
        </div>
        {loading ? <p className="text-slate-400">Loading trips...</p> : null}
        {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p> : null}
        {!loading && !error && trips.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No trips yet. Create your first trip.
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip._id} href={`/trips/${trip._id}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">{trip.destination}</h2>
                <span className="rounded bg-slate-800 px-2 py-1 text-xs uppercase">{trip.budgetType}</span>
              </div>
              <p className="text-sm text-slate-400">{trip.days} days</p>
              <p className="mt-2 text-sm text-slate-300">Estimated: ${trip.estimatedCost.total}</p>
            </Link>
          ))}
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
