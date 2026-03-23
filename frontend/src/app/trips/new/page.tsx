"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Calendar, Heart, Loader2, MapPin, Sparkles } from "lucide-react";
import { AppShell } from "../../../components/app-shell";
import { ProtectedPage } from "../../../components/protected-page";
import { AIGenerationOverlay } from "../../../features/trips/components/ai-generation-overlay";
import { budgetMeta } from "../../../features/trips/budget-meta";
import { tripValidators } from "../../../features/trips/trip.validators";
import { getErrorMessage } from "../../../shared/error-message";
import { tripsApi } from "../../../services/api/trips.api";
import { BudgetType } from "../../../types/api";

const BUDGET_OPTIONS: Array<{ value: BudgetType; label: string; icon: string }> = [
  { value: "low", label: budgetMeta.low.label, icon: budgetMeta.low.icon },
  { value: "medium", label: budgetMeta.medium.label, icon: budgetMeta.medium.icon },
  { value: "high", label: budgetMeta.high.label, icon: budgetMeta.high.icon },
];

const INTERESTS = [
  "culture",
  "food",
  "nature",
  "adventure",
  "beaches",
  "nightlife",
  "shopping",
  "architecture",
  "history",
  "wellness",
  "photography",
  "technology",
];

export default function CreateTripPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budgetType, setBudgetType] = useState<BudgetType>("medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generationStep, setGenerationStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setGenerationStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1500);

    return () => {
      window.clearInterval(interval);
    };
  }, [loading]);

  const toggleInterest = (value: string) => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!destination.trim()) {
      errors.destination = "Destination is required";
    }
    const parsedDays = Number(days);
    if (!days || !Number.isInteger(parsedDays) || parsedDays < 1) {
      errors.days = "Enter at least 1 day";
    }
    if (parsedDays > 30) {
      errors.days = "Maximum 30 days";
    }
    if (interests.length === 0) {
      errors.interests = "Select at least one interest";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const parsedDays = Number(days);
      tripValidators.validateCreateTripInput(destination, parsedDays, budgetType);
      const result = await tripsApi.createTrip({ destination, days: parsedDays, budgetType, interests });
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
        <AIGenerationOverlay open={loading} destination={destination} stepIndex={generationStep} />
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Plan a New Trip</h1>
            <p className="mt-1 text-slate-500">
              Tell us about your dream destination and we&apos;ll create a personalized itinerary
            </p>
          </div>

          {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
          {Object.keys(fieldErrors).length > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-600">Please fix the following errors:</p>
              <ul className="mt-1 list-disc list-inside text-sm text-red-500">
                {Object.values(fieldErrors).map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-5">
            <form onSubmit={onSubmit} className="lg:col-span-3 space-y-6">
              <div className="shadow-card rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <div className="space-y-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Destination</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      placeholder="e.g., Tokyo, Japan"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className={`w-full rounded-xl border bg-white py-2 pr-3 pl-9 outline-none ring-indigo-500 focus:ring-2 ${
                        fieldErrors.destination ? "border-red-300" : "border-slate-300"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Number of days</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="number"
                      min={1}
                      max={30}
                      placeholder="7"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className={`w-full rounded-xl border bg-white py-2 pr-3 pl-9 outline-none ring-indigo-500 focus:ring-2 ${
                        fieldErrors.days ? "border-red-300" : "border-slate-300"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUDGET_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBudgetType(option.value)}
                        className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                          budgetType === option.value
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200"
                        }`}
                      >
                        <span className="mb-1 block text-lg">{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Heart className="h-4 w-4" />
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => {
                      const active = interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-3 py-1 text-sm capitalize ${
                            active ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-600"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating your trip...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Trip Plan
                  </span>
                )}
              </button>
            </form>

            <aside className="lg:col-span-2">
              <div className="shadow-card sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-display text-lg font-semibold text-slate-900">Trip Preview</h3>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Destination</p>
                    <p className="mt-1 font-medium text-slate-800">{destination || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Duration</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {days ? `${days} day${Number(days) !== 1 ? "s" : ""}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Budget</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {BUDGET_OPTIONS.find((option) => option.value === budgetType)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">Interests</p>
                    {interests.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {interests.map((interest) => (
                          <span key={interest} className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-slate-500">None selected</p>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </AppShell>
    </ProtectedPage>
  );
}
