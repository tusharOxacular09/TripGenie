import { Model, Schema, Types, model, models } from "mongoose";

const budgetTypes = ["low", "medium", "high"] as const;
const hotelTypes = ["budget", "mid", "luxury"] as const;
const tripStatuses = ["draft", "generated"] as const;

export type BudgetType = (typeof budgetTypes)[number];
export type HotelType = (typeof hotelTypes)[number];
export type TripStatus = (typeof tripStatuses)[number];

export interface ItineraryItem {
  day: number;
  activities: string[];
}

export interface EstimatedCost {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface HotelSuggestion {
  name: string;
  type: HotelType;
}

export interface Trip {
  userId: Types.ObjectId;
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  itinerary: ItineraryItem[];
  estimatedCost: EstimatedCost;
  hotels: HotelSuggestion[];
  status: TripStatus;
}

type TripModel = Model<Trip>;

const itineraryItemSchema = new Schema<ItineraryItem>(
  {
    day: { type: Number, required: true, min: 1 },
    activities: { type: [String], default: [] },
  },
  { _id: false, strict: true }
);

const estimatedCostSchema = new Schema<EstimatedCost>(
  {
    flights: { type: Number, default: 0, min: 0 },
    accommodation: { type: Number, default: 0, min: 0 },
    food: { type: Number, default: 0, min: 0 },
    activities: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false, strict: true }
);

const hotelSuggestionSchema = new Schema<HotelSuggestion>(
  {
    name: { type: String, trim: true },
    type: { type: String, enum: hotelTypes },
  },
  { _id: false, strict: true }
);

const tripSchema = new Schema<Trip, TripModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1 },
    budgetType: { type: String, enum: budgetTypes, required: true },
    interests: { type: [String], default: [] },
    itinerary: { type: [itineraryItemSchema], default: [] },
    estimatedCost: { type: estimatedCostSchema, default: () => ({}) },
    hotels: { type: [hotelSuggestionSchema], default: [] },
    status: { type: String, enum: tripStatuses, default: "draft" },
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false,
  }
);

tripSchema.index({ userId: 1 });

export const TripModel = (models.Trip as TripModel) || model<Trip, TripModel>("Trip", tripSchema);
