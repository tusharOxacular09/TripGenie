import { Building2, MapPin, Star, Tag } from "lucide-react";
import { budgetMeta } from "../../features/trips/budget-meta";
import { HotelSuggestion } from "../../types/api";

type Props = {
  hotels: HotelSuggestion[];
  destination: string;
};

const getHotelLocation = (hotel: HotelSuggestion, destination: string): string =>
  hotel.location?.trim() || `Central ${destination}`;

const getHotelReason = (hotel: HotelSuggestion): string =>
  hotel.reason?.trim() || hotel.description?.trim() || "Good location and value for your trip preferences.";

const hotelTypeMeta: Record<HotelSuggestion["type"], { label: string; icon: string; badgeClassName: string }> = {
  budget: budgetMeta.low,
  mid: budgetMeta.medium,
  luxury: budgetMeta.high,
};

export function HotelSuggestionsCard({ hotels, destination }: Props) {
  if (!hotels.length) {
    return null;
  }

  return (
    <div className="shadow-card rounded-2xl bg-white p-4">
      <h3 className="font-display mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
        <Building2 className="h-4.5 w-4.5 text-indigo-600" />
        Hotel Suggestions
      </h3>
      <div className="space-y-2.5">
        {hotels.map((hotel) => (
          <article key={`${hotel.name}-${hotel.type}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-5 text-slate-900">{hotel.name}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold ${hotelTypeMeta[hotel.type].badgeClassName}`}
                >
                  <span aria-hidden="true">{hotelTypeMeta[hotel.type].icon}</span>
                  {hotelTypeMeta[hotel.type].label}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {getHotelLocation(hotel, destination)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  {(hotel.rating ?? 4.2).toFixed(1)}
                </span>
                {hotel.pricePerNight ? (
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    {hotel.pricePerNight}
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 text-[11px] leading-4 text-slate-500">{getHotelReason(hotel)}</p>

              {hotel.features?.length ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {hotel.features.map((feature) => (
                    <span key={feature} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {feature}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
