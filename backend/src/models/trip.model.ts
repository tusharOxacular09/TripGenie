import { Schema, Types, model } from "mongoose";

export interface TripDocument {
  userId: Types.ObjectId;
  destination: string;
  days: number;
  budget: string;
  interests: string[];
  itinerary: string[];
  estimatedCost: number;
}

const tripSchema = new Schema<TripDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1 },
    budget: { type: String, required: true, trim: true },
    interests: { type: [String], default: [] },
    itinerary: { type: [String], default: [] },
    estimatedCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TripModel = model<TripDocument>("Trip", tripSchema);
