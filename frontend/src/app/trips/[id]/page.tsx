"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { AppShell } from "../../../components/app-shell";
import { ProtectedPage } from "../../../components/protected-page";
import { ErrorState } from "../../../components/shared/state-components";
import { CostBreakdownCard } from "../../../components/trips/cost-breakdown-card";
import { HotelSuggestionsCard } from "../../../components/trips/hotel-suggestions-card";
import { budgetMeta } from "../../../features/trips/budget-meta";
import { ItineraryDayEditor } from "../../../features/trips/components/itinerary-day-editor";
import { tripValidators } from "../../../features/trips/trip.validators";
import { getErrorMessage } from "../../../shared/error-message";
import { tripsApi } from "../../../services/api/trips.api";
import { Trip } from "../../../types/api";

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tripId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!tripId) {
        setError("Trip not found");
        setLoading(false);
        return;
      }
      try {
        const response = await tripsApi.getTripById(tripId);
        setTrip(response);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load trip"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tripId]);

  const updateTrip = (value: Trip) => setTrip(value);

  const onAddActivity = async (day: number, activity: string) => {
    if (!tripId) return;
    tripValidators.validateActivityInput(day, activity);
    const result = await tripsApi.addActivity(tripId, day, activity);
    updateTrip(result);
  };

  const onRemoveActivity = async (day: number, activity: string) => {
    if (!tripId) return;
    tripValidators.validateActivityInput(day, activity);
    const result = await tripsApi.removeActivity(tripId, day, activity);
    updateTrip(result);
  };

  const onRegenerateDay = async (day: number, preferences: string) => {
    if (!tripId) return;
    tripValidators.validateRegenerateInput(day);
    const result = await tripsApi.regenerateDay(tripId, day, preferences);
    updateTrip(result);
  };

  const onDeleteTrip = async () => {
    if (!tripId || deleting) return;
    const confirmed = window.confirm("Delete this trip? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await tripsApi.deleteTrip(tripId);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete trip"));
      setDeleting(false);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-amber-50 text-amber-700",
    generated: "bg-indigo-50 text-indigo-700",
  };

  const budget = trip ? budgetMeta[trip.budgetType] : budgetMeta.medium;

  const formattedDate = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <ProtectedPage>
      <AppShell>
        {loading ? (
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-40 w-full animate-pulse rounded-2xl bg-slate-200" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>
        ) : null}
        {!loading && error ? <ErrorState title="Trip not found" message={error} /> : null}
        {!loading && !error && trip ? (
          <div className="mx-auto max-w-7xl space-y-4">
            <section className="shadow-card rounded-2xl bg-white p-5 sm:p-6 lg:sticky lg:top-16 lg:z-30">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                      <MapPin className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h1 className="font-display text-3xl font-bold text-slate-900">{trip.destination}</h1>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {trip.days} days
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${budget.badgeClassName}`}>
                          <span aria-hidden="true">{budget.icon}</span>
                          {budget.label}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {formattedDate(trip.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColors[trip.status]}`}>
                    {trip.status}
                  </span>
                  <button
                    type="button"
                    onClick={onDeleteTrip}
                    disabled={deleting}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
              <div className="min-w-0 flex-1 space-y-6">
                <CostBreakdownCard breakdown={trip.estimatedCost} />

                <section className="space-y-3">
                  <h2 className="font-display text-xl font-bold text-slate-900">Itinerary</h2>
                  {trip.itinerary.map((dayPlan) => (
                    <ItineraryDayEditor
                      key={dayPlan.day}
                      dayPlan={dayPlan}
                      destination={trip.destination}
                      onAdd={onAddActivity}
                      onRemove={onRemoveActivity}
                      onRegenerate={onRegenerateDay}
                    />
                  ))}
                </section>
              </div>

              <aside className="w-full lg:sticky lg:top-54 lg:w-[320px] lg:shrink-0 lg:self-start">
                <HotelSuggestionsCard hotels={trip.hotels} destination={trip.destination} />
              </aside>
            </section>
          </div>
        ) : null}
      </AppShell>
    </ProtectedPage>
  );
}
