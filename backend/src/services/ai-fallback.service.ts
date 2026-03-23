import { ItineraryItem } from "../models/trip.model";

const DAY_THEMES = [
  "Arrival and local orientation",
  "Adventure and outdoor experiences",
  "Cultural landmarks and stories",
  "Signature destination highlights",
  "Food and market exploration",
  "Nature and scenic escapes",
  "Leisure, wellness, and hidden gems",
];

const INTEREST_ACTIVITY_TEMPLATES: Record<string, (destination: string) => string> = {
  adventure: (destination) => `Thrill-based activity session around ${destination}`,
  nature: (destination) => `Nature trail and viewpoint circuit in ${destination}`,
  food: (destination) => `Local cuisine tasting trail in ${destination}`,
  culture: (destination) => `Cultural walk covering heritage spots in ${destination}`,
  beaches: (destination) => `Relaxed beachfront time and sunset spots near ${destination}`,
  nightlife: (destination) => `Nightlife experience with local hot-spots in ${destination}`,
  shopping: (destination) => `Shopping route through popular local markets in ${destination}`,
  architecture: (destination) => `Architecture-focused walk across iconic structures in ${destination}`,
  history: (destination) => `Historical landmarks and museum circuit in ${destination}`,
  wellness: (destination) => `Wellness routine with yoga/spa and calm spaces in ${destination}`,
  photography: (destination) => `Photo walk through scenic and street-life locations in ${destination}`,
  technology: (destination) => `Tech and innovation spots exploration in ${destination}`,
  art: (destination) => `Art galleries and creative district exploration in ${destination}`,
  wildlife: (destination) => `Wildlife and biodiversity experience near ${destination}`,
  spiritual: (destination) => `Spiritual sites and reflection-focused stops in ${destination}`,
  family: (destination) => `Family-friendly attractions and easy-paced activities in ${destination}`,
  romance: (destination) => `Romantic viewpoints and intimate dining in ${destination}`,
};

const toTitleCase = (value: string): string =>
  value
    .split(" ")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : part))
    .join(" ");

const normalizeInterests = (interests: string[]): string[] =>
  interests
    .map((interest) => interest.trim().toLowerCase())
    .filter(Boolean);

const resolveInterestActivity = (interest: string, destination: string): string => {
  const template = INTEREST_ACTIVITY_TEMPLATES[interest];
  if (template) {
    return template(destination);
  }
  return `${toTitleCase(interest)} experience in ${destination}`;
};

const createFallbackItinerary = (days: number, destination: string, interests: string[]): ItineraryItem[] => {
  const normalizedInterests = normalizeInterests(interests);

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const interest = normalizedInterests[index % Math.max(normalizedInterests.length, 1)];
    const interestActivity = interest
      ? resolveInterestActivity(interest, destination)
      : `Curated local highlights in ${destination}`;

    return {
      day,
      activities: [
        `${DAY_THEMES[index % DAY_THEMES.length]} in ${destination}`,
        interestActivity,
        `Evening local experience and dining in ${destination}`,
      ],
    };
  });
};

const createFallbackRegeneratedActivities = (destination: string, day: number, preferences?: string): string[] => {
  const normalizedPreferences = preferences?.trim().toLowerCase() ?? "";
  const preferenceActivities = normalizedPreferences
    ? normalizedPreferences
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 2)
        .map((interest) => resolveInterestActivity(interest, destination))
    : [];

  const defaultActivities = [
    `Day ${day} local discovery route in ${destination}`,
    `Immersive neighborhood and culture experience in ${destination}`,
    `Evening highlights and dining plan in ${destination}`,
  ];

  if (preferenceActivities.length === 0) {
    return defaultActivities;
  }

  return [defaultActivities[0], ...preferenceActivities, defaultActivities[2]].slice(0, 4);
};

export { createFallbackItinerary, createFallbackRegeneratedActivities };
