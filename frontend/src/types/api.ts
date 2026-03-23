export type BudgetType = "low" | "medium" | "high";
export type HotelType = "budget" | "mid" | "luxury";
export type TripStatus = "draft" | "generated";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type ItineraryItem = {
  day: number;
  activities: string[];
};

export type EstimatedCost = {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
};

export type HotelSuggestion = {
  name: string;
  type: HotelType;
  description?: string;
  pricePerNight?: string;
  location?: string;
  rating?: number;
  imageQuery?: string;
  features?: string[];
  reason?: string;
};

export type Trip = {
  _id: string;
  userId: string;
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  itinerary: ItineraryItem[];
  estimatedCost: EstimatedCost;
  hotels: HotelSuggestion[];
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
};
