"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "../../../components/app-shell";
import { ProtectedPage } from "../../../components/protected-page";
import { api, ApiError } from "../../../lib/api";
import { Trip } from "../../../types/api";

export default function TripDetailsPage() {
  const params = useParams<{ id: string }>();
  const tripId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activityInputs, setActivityInputs] = useState<Record<number, string>>({});
  const [preferences, setPreferences] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!tripId) {
        setError("Trip not found");
        setLoading(false);
        return;
      }
      try {
        const response = await api.getTrip(tripId);
        setTrip(response.trip);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load trip");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tripId]);

  const updateTrip = (value: Trip) => setTrip(value);

  const onAddActivity = async (day: number) => {
    if (!tripId) return;
    const activity = activityInputs[day]?.trim();
    if (!activity) return;
    const result = await api.addActivity(tripId, day, activity);
    updateTrip(result.trip);
    setActivityInputs((prev) => ({ ...prev, [day]: "" }));
  };

  const onRemoveActivity = async (day: number, activity: string) => {
    if (!tripId) return;
    const result = await api.removeActivity(tripId, day, activity);
    updateTrip(result.trip);
  };

  const onRegenerateDay = async (day: number) => {
    if (!tripId) return;
    const result = await api.regenerateDay(tripId, day, preferences[day] ?? "");
    updateTrip(result.trip);
  };

  return (
    <ProtectedPage>
      <AppShell>
        {loading ? <p className="text-slate-400">Loading trip...</p> : null}
        {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p> : null}
        {!loading && !error && trip ? (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h1 className="text-2xl font-semibold">{trip.destination}</h1>
              <p className="mt-1 text-slate-400">
                {trip.days} days • {trip.budgetType} budget • status: {trip.status}
              </p>
              <p className="mt-2 text-slate-300">Estimated total: ${trip.estimatedCost.total}</p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h2 className="mb-3 font-medium">Cost breakdown</h2>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>Flights: ${trip.estimatedCost.flights}</li>
                  <li>Accommodation: ${trip.estimatedCost.accommodation}</li>
                  <li>Food: ${trip.estimatedCost.food}</li>
                  <li>Activities: ${trip.estimatedCost.activities}</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h2 className="mb-3 font-medium">Hotel suggestions</h2>
                <ul className="space-y-2 text-sm text-slate-300">
                  {trip.hotels.map((hotel) => (
                    <li key={`${hotel.name}-${hotel.type}`} className="flex items-center justify-between">
                      <span>{hotel.name}</span>
                      <span className="rounded bg-slate-800 px-2 py-1 text-xs uppercase">{hotel.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Itinerary</h2>
              {trip.itinerary.map((dayPlan) => (
                <div key={dayPlan.day} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">Day {dayPlan.day}</h3>
                    <button
                      type="button"
                      onClick={() => onRegenerateDay(dayPlan.day)}
                      className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
                    >
                      Regenerate
                    </button>
                  </div>
                  <ul className="mb-3 space-y-2">
                    {dayPlan.activities.map((activity) => (
                      <li key={activity} className="flex items-center justify-between rounded-md bg-slate-950 px-3 py-2 text-sm">
                        <span>{activity}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveActivity(dayPlan.day, activity)}
                          className="text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                    <input
                      placeholder="Add activity..."
                      value={activityInputs[dayPlan.day] ?? ""}
                      onChange={(e) =>
                        setActivityInputs((prev) => ({
                          ...prev,
                          [dayPlan.day]: e.target.value,
                        }))
                      }
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => onAddActivity(dayPlan.day)}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                  <input
                    placeholder="Preferences for regeneration (optional)"
                    value={preferences[dayPlan.day] ?? ""}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        [dayPlan.day]: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
                  />
                </div>
              ))}
            </section>
          </div>
        ) : null}
      </AppShell>
    </ProtectedPage>
  );
}
