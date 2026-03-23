import { BudgetType } from "../../types/api";

type BudgetMeta = {
  label: string;
  icon: string;
  badgeClassName: string;
};

export const budgetMeta: Record<BudgetType, BudgetMeta> = {
  low: {
    label: "Budget",
    icon: "💰",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  medium: {
    label: "Mid",
    icon: "💎",
    badgeClassName: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  high: {
    label: "Premium",
    icon: "👑",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
};
