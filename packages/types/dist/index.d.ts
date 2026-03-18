export type BudgetLevel = "low" | "medium" | "high";
export interface TripInput {
    destination: string;
    days: number;
    budget: BudgetLevel;
    interests: string[];
}
export interface ItineraryDay {
    day: number;
    activities: string[];
}
export interface TripSummary {
    id: string;
    destination: string;
    days: number;
    estimatedCost: number;
}
