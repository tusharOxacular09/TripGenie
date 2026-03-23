import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, DollarSign, MapPin } from "lucide-react";
import { budgetMeta } from "../../features/trips/budget-meta";
import { formatInr } from "../../shared/currency";
import { Trip } from "../../types/api";

type Props = {
  trip: Trip;
};

const statusColors: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  generated: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function TripCard({ trip }: Props) {
  const shownInterests = trip.interests.slice(0, 3);
  const moreInterests = Math.max(trip.interests.length - shownInterests.length, 0);
  const budget = budgetMeta[trip.budgetType];

  return (
    <Link href={`/trips/${trip._id}`} className="group block h-full">
      <article className="shadow-card relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-indigo-50/80 via-violet-50/60 to-cyan-50/70 opacity-90"
        />
        <div className="mb-4 flex items-start justify-between">
          <div className="relative z-10 flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display truncate text-xl font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-2xl">
                {trip.destination}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">AI-crafted personalized itinerary</p>
            </div>
          </div>
          <span
            className={`relative z-10 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusColors[trip.status]}`}
          >
            {trip.status}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
          <div className="rounded-lg bg-white px-2.5 py-2">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              Duration
            </div>
            <span className="text-sm font-semibold text-slate-700">{trip.days} days</span>
          </div>
          <div className="rounded-lg bg-white px-2.5 py-2">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">
              <DollarSign className="h-3.5 w-3.5" />
              Total Cost
            </div>
            <span className="text-sm font-semibold text-slate-700">{formatInr(trip.estimatedCost.total)}</span>
          </div>
        </div>

        {shownInterests.length > 0 ? (
          <div className="mb-4 min-h-8 flex flex-wrap items-center gap-1.5">
            {shownInterests.map((interest) => (
              <span key={interest} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs capitalize text-indigo-700">
                {interest}
              </span>
            ))}
            {moreInterests > 0 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">+{moreInterests} more</span>
            ) : null}
          </div>
        ) : (
          <div className="mb-4 min-h-8" />
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${budget.badgeClassName}`}>
            <span aria-hidden="true">{budget.icon}</span>
            {budget.label}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{formatDate(trip.updatedAt)}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-transform group-hover:translate-x-0.5">
              View
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
