import { Types } from "mongoose";

import { HttpError } from "../errors/http-error";
import { BudgetType, TripModel } from "../models/trip.model";
import { aiService } from "./ai.service";

type CreateTripInput = {
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
};

const BUDGET_TYPES: BudgetType[] = ["low", "medium", "high"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseCreateInput = (payload: unknown): CreateTripInput => {
  if (!isRecord(payload)) {
    throw new HttpError("Invalid request payload", 400);
  }

  const destination = typeof payload.destination === "string" ? payload.destination.trim() : "";
  const days = typeof payload.days === "number" ? payload.days : Number.NaN;
  const budgetTypeRaw = typeof payload.budgetType === "string" ? payload.budgetType.toLowerCase() : "";
  const interestsValue = payload.interests;

  const interests = Array.isArray(interestsValue)
    ? interestsValue
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (!destination) {
    throw new HttpError("Destination is required", 400);
  }
  if (!Number.isInteger(days) || days < 1) {
    throw new HttpError("Days must be an integer greater than 0", 400);
  }
  if (!BUDGET_TYPES.includes(budgetTypeRaw as BudgetType)) {
    throw new HttpError("Budget type must be one of: low, medium, high", 400);
  }

  return {
    destination,
    days,
    budgetType: budgetTypeRaw as BudgetType,
    interests,
  };
};

const assertUserId = (userId: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpError("Invalid user identifier", 400);
  }
  return new Types.ObjectId(userId);
};

const parseDay = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new HttpError("Day must be an integer greater than 0", 400);
  }
  return value;
};

const parseActivity = (value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError("Activity is required", 400);
  }
  return value.trim();
};

const parsePreferences = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const parseEditPayload = (payload: unknown): Record<string, unknown> => {
  if (!isRecord(payload)) {
    throw new HttpError("Invalid request payload", 400);
  }
  return payload;
};

const getTripForUpdate = async (userId: Types.ObjectId, tripId: string) => {
  if (!Types.ObjectId.isValid(tripId)) {
    throw new HttpError("Invalid trip identifier", 400);
  }

  const trip = await TripModel.findOne({
    _id: new Types.ObjectId(tripId),
    userId,
  });

  if (!trip) {
    throw new HttpError("Trip not found", 404);
  }

  return trip;
};

const createTrip = async (userId: string, payload: unknown) => {
  const parsedUserId = assertUserId(userId);
  const input = parseCreateInput(payload);

  const plan = await aiService.generateTripPlan(input);

  const trip = await TripModel.create({
    userId: parsedUserId,
    destination: input.destination,
    days: input.days,
    budgetType: input.budgetType,
    interests: input.interests,
    itinerary: plan.itinerary,
    estimatedCost: plan.budget,
    hotels: plan.hotels,
    status: "generated",
  });

  return trip.toObject();
};

const getTrips = async (userId: string) => {
  const parsedUserId = assertUserId(userId);
  return TripModel.find({ userId: parsedUserId }).sort({ createdAt: -1 }).lean();
};

const getTripById = async (userId: string, tripId: string) => {
  const parsedUserId = assertUserId(userId);
  if (!Types.ObjectId.isValid(tripId)) {
    throw new HttpError("Invalid trip identifier", 400);
  }

  const trip = await TripModel.findOne({
    _id: new Types.ObjectId(tripId),
    userId: parsedUserId,
  }).lean();

  if (!trip) {
    throw new HttpError("Trip not found", 404);
  }

  return trip;
};

const addActivity = async (userId: string, tripId: string, payload: unknown) => {
  const parsedUserId = assertUserId(userId);
  const body = parseEditPayload(payload);
  const day = parseDay(body.day);
  const activity = parseActivity(body.activity);

  const trip = await getTripForUpdate(parsedUserId, tripId);
  const existingDay = trip.itinerary.find((item) => item.day === day);

  if (existingDay) {
    existingDay.activities.push(activity);
  } else {
    trip.itinerary.push({ day, activities: [activity] });
    trip.itinerary.sort((a, b) => a.day - b.day);
  }

  await trip.save();
  return trip.toObject();
};

const removeActivity = async (userId: string, tripId: string, payload: unknown) => {
  const parsedUserId = assertUserId(userId);
  const body = parseEditPayload(payload);
  const day = parseDay(body.day);
  const activity = parseActivity(body.activity);

  const trip = await getTripForUpdate(parsedUserId, tripId);
  const dayPlan = trip.itinerary.find((item) => item.day === day);
  if (!dayPlan) {
    throw new HttpError("Day not found in itinerary", 404);
  }

  const index = dayPlan.activities.findIndex((value) => value === activity);
  if (index === -1) {
    throw new HttpError("Activity not found for selected day", 404);
  }

  dayPlan.activities.splice(index, 1);
  await trip.save();
  return trip.toObject();
};

const regenerateDay = async (userId: string, tripId: string, payload: unknown) => {
  const parsedUserId = assertUserId(userId);
  const body = parseEditPayload(payload);
  const day = parseDay(body.day);
  const preferences = parsePreferences(body.preferences);

  const trip = await getTripForUpdate(parsedUserId, tripId);
  const regeneratedActivities = await aiService.regenerateDay({
    destination: trip.destination,
    day,
    preferences,
  });

  const dayPlan = trip.itinerary.find((item) => item.day === day);
  if (dayPlan) {
    dayPlan.activities = regeneratedActivities;
  } else {
    trip.itinerary.push({ day, activities: regeneratedActivities });
    trip.itinerary.sort((a, b) => a.day - b.day);
  }

  await trip.save();
  return trip.toObject();
};

export const tripService = {
  createTrip,
  getTrips,
  getTripById,
  addActivity,
  removeActivity,
  regenerateDay,
};
