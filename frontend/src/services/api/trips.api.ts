import { Trip } from "../../types/api";
import { apiClient } from "./client";

type Envelope<T> = {
  status: "success" | "error";
  message: string;
  data: T;
  error: Record<string, unknown> | null;
};

export const tripsApi = {
  createTrip: async (payload: { destination: string; days: number; budgetType: "low" | "medium" | "high"; interests: string[] }) => {
    const response = await apiClient.post<Envelope<{ trip: Trip }>>("/trips", payload);
    return response.data.data.trip;
  },
  listTrips: async () => {
    const response = await apiClient.get<Envelope<{ trips: Trip[] }>>("/trips");
    return response.data.data.trips;
  },
  getTripById: async (tripId: string) => {
    const response = await apiClient.get<Envelope<{ trip: Trip }>>(`/trips/${tripId}`);
    return response.data.data.trip;
  },
  addActivity: async (tripId: string, day: number, activity: string) => {
    const response = await apiClient.patch<Envelope<{ trip: Trip }>>(`/trips/${tripId}/add-activity`, {
      day,
      activity,
    });
    return response.data.data.trip;
  },
  removeActivity: async (tripId: string, day: number, activity: string) => {
    const response = await apiClient.patch<Envelope<{ trip: Trip }>>(`/trips/${tripId}/remove-activity`, {
      day,
      activity,
    });
    return response.data.data.trip;
  },
  regenerateDay: async (tripId: string, day: number, preferences: string) => {
    const response = await apiClient.patch<Envelope<{ trip: Trip }>>(`/trips/${tripId}/regenerate-day`, {
      day,
      preferences,
    });
    return response.data.data.trip;
  },
};
