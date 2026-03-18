type GenerateItineraryInput = {
  destination: string;
  days: number;
  budget: string;
  interests: string[];
};

export const aiItineraryService = {
  generateItinerary: async (_input: GenerateItineraryInput): Promise<string[]> => {
    throw new Error("Not implemented yet: AI itinerary generation");
  },
};
