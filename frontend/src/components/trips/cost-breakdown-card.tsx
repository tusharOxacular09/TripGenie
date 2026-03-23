import { Calculator, Hotel, Plane, Ticket, UtensilsCrossed } from "lucide-react";
import { EstimatedCost } from "../../types/api";

type Props = {
  breakdown: EstimatedCost;
};

const rows = [
  { key: "flights" as const, label: "Flights", icon: Plane },
  { key: "accommodation" as const, label: "Accommodation", icon: Hotel },
  { key: "food" as const, label: "Food & Dining", icon: UtensilsCrossed },
  { key: "activities" as const, label: "Activities", icon: Ticket },
];

export function CostBreakdownCard({ breakdown }: Props) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-6">
      <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Calculator className="h-5 w-5 text-indigo-600" />
        Estimated Costs
      </h3>
      <div className="space-y-3">
        {rows.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
            <span className="text-sm font-medium text-slate-900">${breakdown[key].toLocaleString()}</span>
          </div>
        ))}
        <div className="mt-3 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-lg font-bold text-indigo-600">${breakdown.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
