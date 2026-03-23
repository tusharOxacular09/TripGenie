import Link from "next/link";
import { Calendar, Clock, DollarSign, MapPin } from "lucide-react";
import { budgetMeta } from "../../features/trips/budget-meta";
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
      <article className="shadow-card flex h-full flex-col rounded-2xl border border-transparent bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-lg sm:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
                {trip.destination}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">AI-crafted personalized itinerary</p>
            </div>
          </div>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusColors[trip.status]}`}>
            {trip.status}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-3.5 w-3.5" />
            <span>{trip.days} days</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <DollarSign className="h-3.5 w-3.5" />
            <span>${trip.estimatedCost.total.toLocaleString()}</span>
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
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{formatDate(trip.updatedAt)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
