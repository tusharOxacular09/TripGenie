import { Model, Schema, model, models } from "mongoose";
import { HotelSuggestion } from "./trip.model";

type HotelCache = {
  destinationKey: string;
  destination: string;
  hotels: HotelSuggestion[];
  updatedAt: Date;
};

type HotelCacheModel = Model<HotelCache>;

const hotelCacheHotelSchema = new Schema<HotelSuggestion>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ["budget", "mid", "luxury"] },
    description: { type: String, trim: true },
    pricePerNight: { type: String, trim: true },
    location: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 5 },
    imageQuery: { type: String, trim: true },
    features: { type: [String], default: [] },
    reason: { type: String, trim: true },
  },
  { _id: false, strict: true }
);

const hotelCacheSchema = new Schema<HotelCache, HotelCacheModel>(
  {
    destinationKey: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    destination: { type: String, required: true, trim: true },
    hotels: { type: [hotelCacheHotelSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    strict: true,
    versionKey: false,
  }
);

export const HotelCacheModel =
  (models.HotelCache as HotelCacheModel) || model<HotelCache, HotelCacheModel>("HotelCache", hotelCacheSchema, "hotel_cache");
