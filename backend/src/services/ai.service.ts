import { BudgetType, EstimatedCost, HotelSuggestion, ItineraryItem } from "../models/trip.model";
import { env } from "../config/env";

type GenerateTripPlanInput = {
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
};

type TripPlanResult = {
  itinerary: ItineraryItem[];
  estimatedCost: EstimatedCost;
  hotels: HotelSuggestion[];
};

type RegenerateDayInput = {
  destination: string;
  day: number;
  preferences?: string;
};

const HOTEL_TYPES: HotelSuggestion["type"][] = ["budget", "mid", "luxury"];

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

const defaultItinerary = (days: number, destination: string, interests: string[]): ItineraryItem[] => {
  const interestLabel = interests.length > 0 ? interests.join(", ") : "local highlights";

  return Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    activities: [
      `Explore ${destination} city center`,
      `Enjoy ${interestLabel}`,
      `Evening walk and local dining`,
    ],
  }));
};

const defaultHotels = (destination: string): HotelSuggestion[] => [
  { name: `${destination} Budget Stay`, type: "budget" },
  { name: `${destination} City Comfort Hotel`, type: "mid" },
  { name: `${destination} Grand Palace Hotel`, type: "luxury" },
];

const fallbackTripPlan = (input: GenerateTripPlanInput): TripPlanResult => ({
  itinerary: defaultItinerary(input.days, input.destination, input.interests),
  estimatedCost: defaultEstimatedCost(input.days, input.budgetType),
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

const parseTripPlan = (payload: unknown): TripPlanResult | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const itinerary = parseItinerary(payload.itinerary);
  const estimatedCost = parseEstimatedCost(payload.estimatedCost);
  const hotels = parseHotels(payload.hotels);

  if (itinerary.length === 0) {
    return null;
  }

  return { itinerary, estimatedCost, hotels };
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

const callLlm = async (input: GenerateTripPlanInput): Promise<string | null> => {
  const apiKey = env.openaiApiKey;
  if (!apiKey) {
    return null;
  }

  const baseUrl = env.openaiBaseUrl;
  const model = env.openaiModel;
  const prompt = [
    "Generate a travel plan and return STRICT JSON only.",
    "Do not include markdown fences or explanations.",
    `Destination: ${input.destination}`,
    `Days: ${input.days}`,
    `Budget type: ${input.budgetType}`,
    `Interests: ${input.interests.join(", ") || "none"}`,
    "Response format:",
    '{"itinerary":[{"day":1,"activities":["..."]}],"estimatedCost":{"flights":0,"accommodation":0,"food":0,"activities":0,"total":0},"hotels":[{"name":"...","type":"budget"}]}',
  ].join("\n");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content : null;
};

const generateTripPlan = async (input: GenerateTripPlanInput): Promise<TripPlanResult> => {
  const fallback = fallbackTripPlan(input);

  try {
    const raw = await callLlm(input);
    if (!raw) {
      return fallback;
    }

    const parsedJson = parseJsonPayload(raw);
    const parsedPlan = parseTripPlan(parsedJson);
    if (!parsedPlan) {
      return fallback;
    }

    return {
      itinerary: parsedPlan.itinerary.length > 0 ? parsedPlan.itinerary : fallback.itinerary,
      estimatedCost: parsedPlan.estimatedCost,
      hotels: parsedPlan.hotels.length > 0 ? parsedPlan.hotels : fallback.hotels,
    };
  } catch {
    return fallback;
  }
};

const fallbackRegeneratedActivities = (input: RegenerateDayInput): string[] => {
  const preferenceText = input.preferences?.trim() ? ` with ${input.preferences.trim()}` : "";
  return [
    `Morning exploration in ${input.destination}${preferenceText}`,
    `Local experience focused on day ${input.day}`,
    `Evening activity and dining in ${input.destination}`,
  ];
};

const regenerateDay = async (input: RegenerateDayInput): Promise<string[]> => {
  const apiKey = env.openaiApiKey;
  if (!apiKey) {
    return fallbackRegeneratedActivities(input);
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
    const response = await fetch(`${env.openaiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: env.openaiModel,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return fallbackRegeneratedActivities(input);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      return fallbackRegeneratedActivities(input);
    }

    const parsed = parseJsonPayload(content);
    const activities = parseRegeneratedActivities(parsed);
    return activities ?? fallbackRegeneratedActivities(input);
  } catch {
    return fallbackRegeneratedActivities(input);
  }
};

export const aiService = {
  generateTripPlan,
  regenerateDay,
};

export type { GenerateTripPlanInput, RegenerateDayInput, TripPlanResult };
