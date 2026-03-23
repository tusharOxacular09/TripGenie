import crypto from "crypto";

import { env } from "../config/env";
import { AICacheModel } from "../models/ai-cache.model";
import { BudgetType, EstimatedCost, HotelSuggestion, ItineraryItem } from "../models/trip.model";
import { createFallbackItinerary, createFallbackRegeneratedActivities } from "./ai-fallback.service";

type GenerateTripPlanInput = {
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
};

type TripPlanResult = {
  itinerary: ItineraryItem[];
  budget: EstimatedCost;
  hotels: HotelSuggestion[];
};

type RegenerateDayInput = {
  destination: string;
  day: number;
  preferences?: string;
};

const HOTEL_TYPES: HotelSuggestion["type"][] = ["budget", "mid", "luxury"];
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const AI_CACHE_VERSION = "v2";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  return 0;
};

const defaultEstimatedCost = (days: number, budgetType: BudgetType): EstimatedCost => {
  const multipliers: Record<BudgetType, number> = {
    low: 1,
    medium: 1.7,
    high: 2.5,
  };
  const basePerDay = 90;
  const daily = basePerDay * multipliers[budgetType];
  const flights = Math.round(220 * multipliers[budgetType]);
  const accommodation = Math.round(days * daily * 0.45);
  const food = Math.round(days * daily * 0.3);
  const activities = Math.round(days * daily * 0.25);
  const total = flights + accommodation + food + activities;

  return { flights, accommodation, food, activities, total };
};

const defaultHotels = (destination: string): HotelSuggestion[] => [
  { name: `${destination} Budget Stay`, type: "budget" },
  { name: `${destination} City Comfort Hotel`, type: "mid" },
  { name: `${destination} Grand Palace Hotel`, type: "luxury" },
];

const fallbackTripPlan = (input: GenerateTripPlanInput): TripPlanResult => ({
  itinerary: createFallbackItinerary(input.days, input.destination, input.interests),
  budget: defaultEstimatedCost(input.days, input.budgetType),
  hotels: defaultHotels(input.destination),
});

const parseJsonPayload = (content: string): unknown => {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonCandidate = fencedMatch ? fencedMatch[1] : trimmed;
  return JSON.parse(jsonCandidate);
};

const parseItinerary = (value: unknown): ItineraryItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }
      const dayValue = item.day;
      const activitiesValue = item.activities;
      if (
        typeof dayValue !== "number" ||
        !Number.isFinite(dayValue) ||
        dayValue < 1 ||
        !Array.isArray(activitiesValue)
      ) {
        return null;
      }
      const activities = activitiesValue
        .filter((activity): activity is string => typeof activity === "string")
        .map((activity) => activity.trim())
        .filter(Boolean);

      return { day: Math.floor(dayValue), activities };
    })
    .filter((item): item is ItineraryItem => item !== null);
};

const normalizeItinerary = (itinerary: ItineraryItem[], input: GenerateTripPlanInput): ItineraryItem[] => {
  const byDay = new Map<number, string[]>();

  itinerary.forEach((item) => {
    if (item.day < 1 || item.day > input.days) {
      return;
    }

    const cleanedActivities = item.activities
      .map((activity) => activity.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (cleanedActivities.length > 0) {
      byDay.set(item.day, cleanedActivities);
    }
  });

  const defaultPlan = createFallbackItinerary(input.days, input.destination, input.interests);
  const normalized: ItineraryItem[] = [];
  const usedSignatures = new Set<string>();

  for (let day = 1; day <= input.days; day += 1) {
    const aiActivities = byDay.get(day) ?? defaultPlan[day - 1].activities;
    const normalizedActivities = aiActivities.map((value) => value.trim()).filter(Boolean);

    const signature = normalizedActivities.join("|").toLowerCase();
    if (usedSignatures.has(signature)) {
      normalized.push(defaultPlan[day - 1]);
    } else {
      usedSignatures.add(signature);
      normalized.push({
        day,
        activities: normalizedActivities.length > 0 ? normalizedActivities : defaultPlan[day - 1].activities,
      });
    }
  }

  return normalized;
};

const parseEstimatedCost = (value: unknown): EstimatedCost => {
  if (!isRecord(value)) {
    return { flights: 0, accommodation: 0, food: 0, activities: 0, total: 0 };
  }

  const flights = toNumber(value.flights);
  const accommodation = toNumber(value.accommodation);
  const food = toNumber(value.food);
  const activities = toNumber(value.activities);
  const totalCandidate = toNumber(value.total);
  const total = totalCandidate > 0 ? totalCandidate : flights + accommodation + food + activities;

  return { flights, accommodation, food, activities, total };
};

const parseHotels = (value: unknown): HotelSuggestion[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((hotel) => {
      if (!isRecord(hotel) || typeof hotel.name !== "string" || typeof hotel.type !== "string") {
        return null;
      }
      const type = hotel.type.trim().toLowerCase();
      if (!HOTEL_TYPES.includes(type as HotelSuggestion["type"])) {
        return null;
      }
      const name = hotel.name.trim();
      if (!name) {
        return null;
      }
      return { name, type: type as HotelSuggestion["type"] };
    })
    .filter((hotel): hotel is HotelSuggestion => hotel !== null);
};

const parseTripPlan = (payload: unknown, input: GenerateTripPlanInput): TripPlanResult | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const itinerary = normalizeItinerary(parseItinerary(payload.itinerary), input);
  const budget = parseEstimatedCost(payload.budget);
  const hotels = parseHotels(payload.hotels);

  if (itinerary.length === 0) {
    return null;
  }

  return { itinerary, budget, hotels };
};

const parseRegeneratedActivities = (payload: unknown): string[] | null => {
  if (!isRecord(payload) || !Array.isArray(payload.activities)) {
    return null;
  }

  const activities = payload.activities
    .filter((activity): activity is string => typeof activity === "string")
    .map((activity) => activity.trim())
    .filter(Boolean);

  return activities.length > 0 ? activities : null;
};

const buildCacheKey = (input: GenerateTripPlanInput): string => {
  const raw = `${AI_CACHE_VERSION}|${input.destination.toLowerCase()}|${input.days}|${input.budgetType}|${input.interests
    .map((value) => value.toLowerCase())
    .sort()
    .join(",")}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
};

const callGemini = async (prompt: string): Promise<string | null> => {
  const apiKey = env.geminiApiKey;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof content === "string" && content.trim() ? content : null;
};

const generateTripPlan = async (input: GenerateTripPlanInput): Promise<TripPlanResult> => {
  const fallback = fallbackTripPlan(input);
  const key = buildCacheKey(input);

  const cached = await AICacheModel.findOne({ key }).lean();
  if (cached && typeof cached.response === "object" && cached.response !== null) {
    const parsedCached = parseTripPlan(cached.response, input);
    if (parsedCached) {
      return parsedCached;
    }
  }

  try {
    const prompt = [
      "Generate a travel plan in JSON only. No markdown. No extra text.",
      "Use this exact schema:",
      '{"itinerary":[{"day":1,"activities":["..."]}],"budget":{"flights":0,"accommodation":0,"food":0,"activities":0,"total":0},"hotels":[{"name":"","type":"budget","description":""}]}',
      "Create exactly one itinerary item per day from day 1 to the requested number of days.",
      "Every day must have distinct activities. Do not repeat the same activities across days.",
      "Reflect interests in different ways across different days.",
      `destination=${input.destination}`,
      `days=${input.days}`,
      `budget=${input.budgetType}`,
      `interests=${input.interests.join(",") || "none"}`,
    ].join("\n");

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const raw = await callGemini(prompt);
      if (!raw) {
        continue;
      }
      const parsedJson = parseJsonPayload(raw);
      const parsedPlan = parseTripPlan(parsedJson, input);
      if (!parsedPlan) {
        continue;
      }

      await AICacheModel.findOneAndUpdate(
        { key },
        { key, input, response: parsedPlan, createdAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return parsedPlan;
    }
  } catch {
    return fallback;
  }
  return fallback;
};

const regenerateDay = async (input: RegenerateDayInput): Promise<string[]> => {
  const apiKey = env.geminiApiKey;
  if (!apiKey) {
    return createFallbackRegeneratedActivities(input.destination, input.day, input.preferences);
  }

  const prompt = [
    "Regenerate itinerary activities for one day and return STRICT JSON only.",
    "Do not include markdown fences or explanations.",
    `Destination: ${input.destination}`,
    `Day number: ${input.day}`,
    `Preferences: ${input.preferences?.trim() || "none"}`,
    'Response format: {"activities":["activity 1","activity 2","activity 3"]}',
  ].join("\n");

  try {
    const content = await callGemini(prompt);
    if (!content || !content.trim()) {
      return createFallbackRegeneratedActivities(input.destination, input.day, input.preferences);
    }

    const parsed = parseJsonPayload(content);
    const activities = parseRegeneratedActivities(parsed);
    return activities ?? createFallbackRegeneratedActivities(input.destination, input.day, input.preferences);
  } catch {
    return createFallbackRegeneratedActivities(input.destination, input.day, input.preferences);
  }
};

export const aiService = {
  generateTripPlan,
  regenerateDay,
};

export type { GenerateTripPlanInput, RegenerateDayInput, TripPlanResult };
