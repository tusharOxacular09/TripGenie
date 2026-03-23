"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Compass, Plus, Search } from "lucide-react";
import { AppShell } from "../../components/app-shell";
import { ProtectedPage } from "../../components/protected-page";
import { EmptyState } from "../../components/shared/state-components";
import { TripCard } from "../../components/trips/trip-card";
import { TripCardSkeleton } from "../../components/trips/trip-card-skeleton";
import { getErrorMessage } from "../../shared/error-message";
import { tripsApi } from "../../services/api/trips.api";
import { Trip } from "../../types/api";

export default function DashboardPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const response = await tripsApi.listTrips();
        setTrips(response);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load trips"));
      } finally {
        setLoading(false);
      }
    };
    void loadTrips();
  }, []);

  const filteredTrips = trips.filter((trip) => trip.destination.toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Your Trips</h1>
            <p className="mt-1 text-slate-500">Plan, manage, and explore your journeys</p>
          </div>
          <Link href="/trips/new" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
            Create Trip
          </Link>
        </div>

        <div className="relative mb-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search destinations..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm outline-none ring-indigo-500 focus:ring-2"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <TripCardSkeleton key={item} />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            icon={<Compass className="h-8 w-8" />}
            title={search ? "No trips found" : "No trips yet"}
            description={
              search
                ? "Try a different search term"
                : "Create your first AI-powered trip and start exploring the world."
            }
            action={!search ? { label: "Create your first trip", onClick: () => router.push("/trips/new") } : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedPage>
  );
}
