import { Building2 } from "lucide-react";
import { HotelSuggestion } from "../../types/api";

type Props = {
  hotels: HotelSuggestion[];
};

export function HotelSuggestionsCard({ hotels }: Props) {
  if (!hotels.length) {
    return null;
  }

  return (
    <div className="shadow-card rounded-2xl bg-white p-6">
      <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Building2 className="h-5 w-5 text-indigo-600" />
        Hotel Suggestions
      </h3>
      <div className="space-y-3">
        {hotels.map((hotel) => (
          <div key={`${hotel.name}-${hotel.type}`} className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{hotel.name}</p>
              <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs capitalize text-slate-600">
                {hotel.type}
              </span>
            </div>
            {hotel.description ? <p className="mt-1 text-xs text-slate-500">{hotel.description}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
