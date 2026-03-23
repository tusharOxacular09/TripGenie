"use client";

import { Loader2, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  destination: string;
  stepIndex: number;
};

const STEPS = [
  "Understanding your destination preferences",
  "Designing day-by-day activities",
  "Estimating budget breakdown",
  "Selecting suitable hotels",
  "Finalizing your personalized plan",
];

export function AIGenerationOverlay({ open, destination, stepIndex }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <section
        role="status"
        aria-live="polite"
        className="shadow-card w-full max-w-lg rounded-2xl border border-indigo-100 bg-white p-6 sm:p-7"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI Trip Engine
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-900">Generating your itinerary</h2>
        <p className="mt-2 text-sm text-slate-600">
          Building your trip to <span className="font-semibold text-slate-800">{destination || "your destination"}</span>.
          Please keep this tab open.
        </p>

        <div className="mt-6 space-y-3">
          {STEPS.map((step, index) => {
            const completed = index < stepIndex;
            const active = index === stepIndex;
            return (
              <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    completed ? "bg-emerald-100 text-emerald-700" : active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </span>
                <span className={`text-sm ${active ? "font-medium text-slate-900" : "text-slate-600"}`}>{step}</span>
                {active ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" /> : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
