import crypto from "crypto";

import { env } from "../config/env";
import { AICacheModel } from "../models/ai-cache.model";
import { HotelCacheModel } from "../models/hotel-cache.model";
import { BudgetType, EstimatedCost, HotelSuggestion, ItineraryItem } from "../models/trip.model";
import { createFallbackItinerary, createFallbackRegeneratedActivities } from "./ai-fallback.service";

type GenerateTripPlanInput = {
  pickupPoint: string;
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
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const AI_CACHE_VERSION = "v3";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  return 0;
};

const defaultEstimatedCost = (days: number, budgetType: BudgetType, pickupPoint: string, destination: string): EstimatedCost => {
  const multipliers: Record<BudgetType, number> = {
    low: 1,
    medium: 1.7,
    high: 2.5,
  };
  const basePerDay = 4500;
  const daily = basePerDay * multipliers[budgetType];
  const pickup = pickupPoint.trim().toLowerCase();
  const dest = destination.trim().toLowerCase();
  const sameCity = pickup === dest;
  const oneIncludesOther = pickup.includes(dest) || dest.includes(pickup);
  const flightBase = sameCity ? 1800 : oneIncludesOther ? 5200 : 9800;
  const flights = Math.round(flightBase * multipliers[budgetType]);
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
    pricePerNight: "INR 2,500-4,500",
    location: "City center",
    rating: 4.1,
    imageQuery: `${destination} budget hotel exterior`,
    features: ["Clean rooms", "Central location", "Free Wi-Fi"],
    reason: "Affordable stay with convenient access to key attractions.",
  },
  {
    name: `${destination} City Comfort Hotel`,
    type: "mid",
    pricePerNight: "INR 5,500-9,500",
    location: "Prime district",
    rating: 4.3,
    imageQuery: `${destination} mid range hotel exterior`,
    features: ["Comfortable rooms", "Great location", "Breakfast included"],
    reason: "Balanced value and comfort for most travelers.",
  },
  {
    name: `${destination} Grand Palace Hotel`,
    type: "luxury",
    pricePerNight: "INR 12,000-22,000",
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
  budget: defaultEstimatedCost(input.days, input.budgetType, input.pickupPoint, input.destination),
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
  const raw = `${AI_CACHE_VERSION}|${input.pickupPoint.toLowerCase()}|${input.destination.toLowerCase()}|${input.days}|${input.budgetType}|${input.interests
    .map((value) => value.toLowerCase())
    .sort()
    .join(",")}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
};

const callGemini = async (prompt: string): Promise<string | null> => {
  const apiKey = env.geminiApiKey;
  if (!apiKey) {
    console.warn("[AI Service] No Gemini API key configured");
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
      },
    }),
  });

  if (response.status === 429) {
    console.warn("[AI Service] Gemini API quota exhausted (429). Skipping retry to avoid additional quota burn.");
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[AI Service] Gemini API error ${response.status}:`, errorBody);
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
    "Recommend hotels for this trip based on destination, budget, duration, and interests.",
    "Input:",
    `Pickup Point: ${input.pickupPoint}`,
    `Destination: ${input.destination}`,
    `Budget: ${input.budgetType}`,
    `Trip Duration: ${input.days} days`,
    `Interests: ${input.interests.join(", ") || "none"}`,
    "Recommend exactly 3 hotels: one Budget, one Mid-range, and one Luxury.",
    "Prefer real, well-known properties with realistic ratings of 4.0 or higher, ideally in central or attraction-friendly areas.",
    "Use INR for any price values and return human-readable ranges (for example, INR 6,000-9,000).",
    "For images, provide a descriptive search query string only in image_query, not a URL.",
    'Output schema: {"recommended_hotels":[{"name":"","type":"budget","price_per_night":"","location":"","rating":4.2,"image_query":"","features":["",""],"reason":""},{"name":"","type":"mid-range","price_per_night":"","location":"","rating":4.2,"image_query":"","features":["",""],"reason":""},{"name":"","type":"luxury","price_per_night":"","location":"","rating":4.2,"image_query":"","features":["",""],"reason":""}]}',
    "Respond with valid JSON only, no explanation, no markdown fences.",
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
      "You are an expert travel planner creating a personalized trip plan.",
      "Use this exact schema:",
      '{"itinerary":[{"day":1,"activities":["..."]}],"budget":{"flights":0,"accommodation":0,"food":0,"activities":0,"total":0}}',
      "Create exactly one itinerary entry per day from day 1 through the requested number of days.",
      "Keep activities unique across days and reflect the selected interests in varied ways.",
      "For each day, provide 3 to 5 activities written as practical, descriptive suggestions of around 12 to 24 words.",
      "Include a balanced flow of morning, afternoon, and evening-style recommendations.",
      "Use specific local experiences or areas when possible instead of generic suggestions.",
      "Use pickup point and destination context to produce realistic flight estimates.",
      "If pickup point and destination are the same or nearby, keep flight estimates lower than long-distance trips.",
      "If the destination is unfamiliar, use general travel knowledge for that region.",
      "Return all budget values in INR as plain numbers only (no currency symbols and no commas).",
      `pickup_point=${input.pickupPoint}`,
      `destination=${input.destination}`,
      `days=${input.days}`,
      `budget=${input.budgetType}`,
      `interests=${input.interests.join(",") || "none"}`,
      "Respond with valid JSON only, no explanation, no markdown fences.",
    ].join("\n");

    const [raw, hotels] = await Promise.all([callGemini(prompt), getOrCreateHotelsForDestination(input)]);

    if (!raw) {
      return { ...fallback, hotels };
    }

    const parsedJson = parseJsonPayload(raw);
    const parsedPlan = parseTripPlan(parsedJson, input);
    if (!parsedPlan) {
      return { ...fallback, hotels };
    }
    const finalPlan: TripPlanResult = { ...parsedPlan, hotels };

    await AICacheModel.findOneAndUpdate(
      { key },
      { key, input, response: finalPlan, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return finalPlan;
  } catch {
    const hotels = await getOrCreateHotelsForDestination(input);
    return { ...fallback, hotels };
  }
};

const regenerateDay = async (input: RegenerateDayInput): Promise<string[]> => {
  const apiKey = env.geminiApiKey;
  if (!apiKey) {
    return createFallbackRegeneratedActivities(input.destination, input.day, input.preferences);
  }

  const prompt = [
    "You are an expert travel planner regenerating activities for a single day of a trip.",
    `Destination: ${input.destination}`,
    `Day number: ${input.day}`,
    `Preferences: ${input.preferences?.trim() || "none"}`,
    "Generate 3 to 5 fresh, practical activities of around 12 to 24 words each that feel specific to the destination.",
    "If the destination is unfamiliar, use general travel knowledge for that region.",
    'Response format: {"activities":["activity 1","activity 2","activity 3"]}',
    "Respond with valid JSON only, no explanation, no markdown fences.",
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
