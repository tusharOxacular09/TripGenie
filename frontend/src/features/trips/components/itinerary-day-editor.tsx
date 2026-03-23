"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Plus, RefreshCw, X } from "lucide-react";
import { ItineraryItem } from "../../../types/api";
import { RegenerateDayModal } from "./regenerate-day-modal";

type Props = {
  dayPlan: ItineraryItem;
  destination: string;
  onAdd: (day: number, activity: string) => Promise<void>;
  onRemove: (day: number, activity: string) => Promise<void>;
  onRegenerate: (day: number, preferences: string) => Promise<void>;
};

export function ItineraryDayEditor({ dayPlan, destination, onAdd, onRemove, onRegenerate }: Props) {
  const [newActivity, setNewActivity] = useState("");
  const [preferences, setPreferences] = useState("");
  const [busy, setBusy] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenProgress, setRegenProgress] = useState(0);
  const [regenSuccess, setRegenSuccess] = useState(false);
  const progressTimer = useRef<ReturnType<typeof window.setInterval> | null>(null);

  const withBusy = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const startProgress = () => {
    setRegenProgress(0);
    progressTimer.current = window.setInterval(() => {
      setRegenProgress((prev) => {
        if (prev >= 95) return prev;
        const next = prev + (prev < 70 ? 7 : 3);
        return next > 95 ? 95 : next;
      });
    }, 250);
  };

  const stopProgress = () => {
    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopProgress();
    };
  }, []);

  return (
    <>
      <RegenerateDayModal
        open={regenerating}
        day={dayPlan.day}
        destination={destination}
        progress={regenProgress}
        success={regenSuccess}
      />
      <div className="shadow-card rounded-2xl bg-white p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
              {dayPlan.day}
            </span>
            Day {dayPlan.day}
          </h3>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              withBusy(async () => {
                setRegenerating(true);
                setRegenSuccess(false);
                startProgress();
                try {
                  await onRegenerate(dayPlan.day, preferences);
                  setPreferences("");
                  stopProgress();
                  setRegenProgress(100);
                  setRegenSuccess(true);
                  await new Promise<void>((resolve) => {
                    window.setTimeout(() => resolve(), 900);
                  });
                } finally {
                  stopProgress();
                  setRegenerating(false);
                  setRegenSuccess(false);
                }
              })
            }
            className="inline-flex items-center rounded-lg px-3 py-1 text-sm text-slate-500 hover:text-indigo-600 disabled:opacity-60"
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>

        {dayPlan.activities.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <MapPin className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">No activities yet. Add one below!</p>
          </div>
        ) : (
          <ul className="mb-4 space-y-2">
            {dayPlan.activities.map((activity) => (
              <li key={activity} className="group flex items-center justify-between gap-3 rounded-xl bg-slate-100/70 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  <span className="truncate text-sm text-slate-800">{activity}</span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => withBusy(() => onRemove(dayPlan.day, activity))}
                  className="rounded p-1 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 disabled:opacity-40"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            placeholder="Add activity..."
            value={newActivity}
            onChange={(event) => setNewActivity(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              withBusy(async () => {
                await onAdd(dayPlan.day, newActivity);
                setNewActivity("");
              })
            }
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </button>
        </div>

        <input
          placeholder="Preferences for regeneration (optional)"
          value={preferences}
          onChange={(event) => setPreferences(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />
      </div>
    </>
  );
}
