"use client";

import { CheckCircle2, Loader2, Sparkles, Wand2 } from "lucide-react";

type Props = {
  open: boolean;
  day: number;
  destination: string;
  progress: number;
  success: boolean;
};

export function RegenerateDayModal({ open, day, destination, progress, success }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <section
        role="status"
        aria-live="polite"
        className="shadow-card w-full max-w-md rounded-2xl border border-indigo-100 bg-white p-6 sm:p-7"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {success ? "Plan Updated" : "AI Regeneration"}
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900">
          {success ? `Day ${day} is ready` : `Regenerating Day ${day}`}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {success ? (
            <>
              Your new itinerary activities for <span className="font-medium text-slate-800">{destination}</span> are ready.
            </>
          ) : (
            <>
              We are crafting new activities for <span className="font-medium text-slate-800">{destination}</span>. This can
              take up to a minute depending on AI response time.
            </>
          )}
        </p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            {success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <Wand2 className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            )}
            {success ? "Successfully regenerated" : "Preparing a better day plan"}
            <span className="ml-auto text-xs font-semibold text-slate-500">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${success ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {success ? (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Updated itinerary applied.
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Generating unique recommendations...
          </div>
        )}
      </section>
    </div>
  );
}
