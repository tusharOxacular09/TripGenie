"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AppShell } from "../../../components/app-shell";
import { ProtectedPage } from "../../../components/protected-page";
import { tripValidators } from "../../../features/trips/trip.validators";
import { getErrorMessage } from "../../../shared/error-message";
import { tripsApi } from "../../../services/api/trips.api";
import { BudgetType } from "../../../types/api";

const INTERESTS = ["food", "culture", "adventure", "shopping", "nature", "history"];

export default function CreateTripPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budgetType, setBudgetType] = useState<BudgetType>("medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleInterest = (value: string) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      tripValidators.validateCreateTripInput(destination, days, budgetType);
      const result = await tripsApi.createTrip({ destination, days, budgetType, interests });
      router.push(`/trips/${result._id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create trip"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">Create Trip</h1>
          {error ? <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p> : null}
          <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Destination</label>
              <input
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Days</label>
              <input
                required
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Budget type</label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as BudgetType)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Interests</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const active = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-3 py-1 text-sm capitalize ${
                        active ? "border-indigo-400 bg-indigo-500/20 text-indigo-300" : "border-slate-700 text-slate-300"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Trip"}
            </button>
          </form>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
