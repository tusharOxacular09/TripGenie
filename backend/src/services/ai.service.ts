import crypto from "crypto";

import { env } from "../config/env";
import { AICacheModel } from "../models/ai-cache.model";
import { HotelCacheModel } from "../models/hotel-cache.model";
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
const AI_CACHE_VERSION = "v3";

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
  {
    name: `${destination} Budget Stay`,
    type: "budget",
    pricePerNight: "$35-$60",
    location: "City center",
    rating: 4.1,
    imageQuery: `${destination} budget hotel exterior`,
    features: ["Clean rooms", "Central location", "Free Wi-Fi"],
    reason: "Affordable stay with convenient access to key attractions.",
  },
  {
    name: `${destination} City Comfort Hotel`,
    type: "mid",
    pricePerNight: "$80-$140",
    location: "Prime district",
    rating: 4.3,
    imageQuery: `${destination} mid range hotel exterior`,
    features: ["Comfortable rooms", "Great location", "Breakfast included"],
    reason: "Balanced value and comfort for most travelers.",
  },
  {
    name: `${destination} Grand Palace Hotel`,
    type: "luxury",
    pricePerNight: "$220-$420",
    location: "Premium locality",
    rating: 4.6,
    imageQuery: `${destination} luxury hotel exterior`,
    features: ["Premium amenities", "Top-rated service", "Scenic views"],
    reason: "Luxury experience with premium facilities and location.",
  },
];

const destinationKey = (destination: string): string => destination.trim().toLowerCase().replace(/\s+/g, " ");

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

  const categoryToType: Record<string, HotelSuggestion["type"]> = {
    budget: "budget",
    "mid-range": "mid",
    mid: "mid",
    luxury: "luxury",
  };

  return value
    .map((hotel): HotelSuggestion | null => {
      if (!isRecord(hotel) || typeof hotel.name !== "string") {
        return null;
      }
      const typeSource = typeof hotel.type === "string" ? hotel.type : typeof hotel.category === "string" ? hotel.category : "";
      const type = categoryToType[typeSource.trim().toLowerCase()];
      if (!type || !HOTEL_TYPES.includes(type)) {
        return null;
      }
      const name = hotel.name.trim();
      if (!name) {
        return null;
      }

      const ratingValue = typeof hotel.rating === "number" && Number.isFinite(hotel.rating) ? hotel.rating : undefined;
      const rating = typeof ratingValue === "number" ? Math.max(0, Math.min(5, ratingValue)) : undefined;
      const location = typeof hotel.location === "string" ? hotel.location.trim() : undefined;
      const pricePerNight = typeof hotel.price_per_night === "string" ? hotel.price_per_night.trim() : undefined;
      const imageQuery = typeof hotel.image_query === "string" ? hotel.image_query.trim() : undefined;
      const reason = typeof hotel.reason === "string" ? hotel.reason.trim() : undefined;
      const features = Array.isArray(hotel.features)
        ? hotel.features
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 3)
        : undefined;

      return {
        name,
        type,
        description: reason,
        pricePerNight: pricePerNight || undefined,
        location: location || undefined,
        rating,
        imageQuery: imageQuery || undefined,
        features,
        reason: reason || undefined,
      };
    })
    .filter((hotel): hotel is HotelSuggestion => hotel !== null);
};

const normalizeHotels = (hotels: HotelSuggestion[], destination: string): HotelSuggestion[] => {
  const byType = new Map<HotelSuggestion["type"], HotelSuggestion>();

  hotels.forEach((hotel) => {
    if (!byType.has(hotel.type)) {
      byType.set(hotel.type, hotel);
    }
  });

  const fallbackByType = new Map(defaultHotels(destination).map((hotel) => [hotel.type, hotel] as const));
  const ordered: HotelSuggestion["type"][] = ["budget", "mid", "luxury"];

  return ordered.map((type) => byType.get(type) ?? (fallbackByType.get(type) as HotelSuggestion));
};

const parseTripPlan = (payload: unknown, input: GenerateTripPlanInput): TripPlanResult | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const itinerary = normalizeItinerary(parseItinerary(payload.itinerary), input);
  const budget = parseEstimatedCost(payload.budget);
  const hotels = parseHotels(payload.hotels ?? payload.recommended_hotels);

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
    .filter((activity) => activity && activity.length >= 20);

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

const getOrCreateHotelsForDestination = async (input: GenerateTripPlanInput): Promise<HotelSuggestion[]> => {
  const key = destinationKey(input.destination);
  const cached = await HotelCacheModel.findOne({ destinationKey: key }).lean();
  if (cached && Array.isArray(cached.hotels) && cached.hotels.length > 0) {
    return normalizeHotels(cached.hotels, input.destination);
  }

  const fallback = normalizeHotels(defaultHotels(input.destination), input.destination);
  const apiKey = env.geminiApiKey;
  if (!apiKey) {
    return fallback;
  }

  const hotelPrompt = [
    "You are an AI travel assistant.",
    "Recommend hotels in STRICT JSON only with no markdown and no extra text.",
    "Input:",
    `Destination: ${input.destination}`,
    `Budget: ${input.budgetType}`,
    `Trip Duration: ${input.days} days`,
    `Interests: ${input.interests.join(", ") || "none"}`,
    "Recommend exactly 3 hotels: one Budget, one Mid-range, one Luxury.",
    "Prefer real and well-known properties, realistic rating >= 4.0, central/attraction-friendly locations.",
    "Do NOT include image URLs. Provide image_query only.",
    'Output schema: {"recommended_hotels":[{"name":"","category":"Budget","price_per_night":"","location":"","rating":4.2,"image_query":"","features":["",""],"reason":""}]}',
  ].join("\n");

  try {
    const raw = await callGemini(hotelPrompt);
    if (!raw) {
      return fallback;
    }
    const parsedJson = parseJsonPayload(raw);
    const hotelPayload = isRecord(parsedJson) ? parsedJson.recommended_hotels ?? parsedJson.hotels : parsedJson;
    const parsedHotels = normalizeHotels(parseHotels(hotelPayload), input.destination);

    if (parsedHotels.length > 0) {
      await HotelCacheModel.findOneAndUpdate(
        { destinationKey: key },
        {
          destinationKey: key,
          destination: input.destination,
          hotels: parsedHotels,
          updatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return parsedHotels;
    }
  } catch {
    return fallback;
  }

  return fallback;
};

const generateTripPlan = async (input: GenerateTripPlanInput): Promise<TripPlanResult> => {
  const fallback = fallbackTripPlan(input);
  const key = buildCacheKey(input);

  const cached = await AICacheModel.findOne({ key }).lean();
  if (cached && typeof cached.response === "object" && cached.response !== null) {
    const parsedCached = parseTripPlan(cached.response, input);
    if (parsedCached) {
      const hotels = await getOrCreateHotelsForDestination(input);
      return { ...parsedCached, hotels };
    }
  }

  try {
    const prompt = [
      "Generate a travel plan in JSON only. No markdown. No extra text.",
      "Use this exact schema:",
      '{"itinerary":[{"day":1,"activities":["..."]}],"budget":{"flights":0,"accommodation":0,"food":0,"activities":0,"total":0}}',
      "Create exactly one itinerary item per day from day 1 to the requested number of days.",
      "Every day must have distinct activities. Do not repeat the same activities across days.",
      "Reflect interests in different ways across different days.",
      "For each day, provide 3 to 5 activities.",
      "Each activity should be descriptive and practical, around 12 to 24 words, not short phrases.",
      "Include a mix of morning, afternoon, and evening style recommendations.",
      "Mention specific local experiences/areas where possible instead of generic lines.",
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
      const hotels = await getOrCreateHotelsForDestination(input);
      const finalPlan: TripPlanResult = { ...parsedPlan, hotels };

      await AICacheModel.findOneAndUpdate(
        { key },
        { key, input, response: finalPlan, createdAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return finalPlan;
    }
  } catch {
    const hotels = await getOrCreateHotelsForDestination(input);
    return { ...fallback, hotels };
  }
  const hotels = await getOrCreateHotelsForDestination(input);
  return { ...fallback, hotels };
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
    "Return 3 to 5 detailed activities.",
    "Each activity should be descriptive and practical, around 12 to 24 words.",
    "Activities must feel fresh and not be generic copies.",
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
