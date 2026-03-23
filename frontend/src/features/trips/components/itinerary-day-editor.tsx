"use client";

import { useState } from "react";
import { ItineraryItem } from "../../../types/api";

type Props = {
  dayPlan: ItineraryItem;
  onAdd: (day: number, activity: string) => Promise<void>;
  onRemove: (day: number, activity: string) => Promise<void>;
  onRegenerate: (day: number, preferences: string) => Promise<void>;
};

export function ItineraryDayEditor({ dayPlan, onAdd, onRemove, onRegenerate }: Props) {
  const [newActivity, setNewActivity] = useState("");
  const [preferences, setPreferences] = useState("");
  const [busy, setBusy] = useState(false);

  const withBusy = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">Day {dayPlan.day}</h3>
        <button
          type="button"
          disabled={busy}
          onClick={() => withBusy(() => onRegenerate(dayPlan.day, preferences))}
          className="rounded-md bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700 disabled:opacity-60"
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
              disabled={busy}
              onClick={() => withBusy(() => onRemove(dayPlan.day, activity))}
              className="text-red-300 hover:text-red-200 disabled:opacity-60"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          placeholder="Add activity..."
          value={newActivity}
          onChange={(event) => setNewActivity(event.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
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
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <input
        placeholder="Preferences for regeneration (optional)"
        value={preferences}
        onChange={(event) => setPreferences(event.target.value)}
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
      />
    </div>
  );
}
