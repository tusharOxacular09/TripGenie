import { authStorage } from "./auth";
import { AuthUser, Trip } from "../types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const request = async <T>(path: string, init: RequestInit = {}, withAuth = false): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (init.headers && !Array.isArray(init.headers) && !(init.headers instanceof Headers)) {
    Object.assign(headers, init.headers);
  }

  if (withAuth) {
    const token = authStorage.getToken();
    if (!token) {
      throw new ApiError("Unauthorized", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api${path}`, { ...init, headers });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? ((await response.json()) as Record<string, unknown>) : {};

  if (!response.ok) {
    const message = typeof body.message === "string" ? body.message : "Request failed";
    throw new ApiError(message, response.status);
  }

  return body as T;
};

type RegisterInput = { name: string; email: string; password: string };
type LoginInput = { email: string; password: string };
type CreateTripInput = { destination: string; days: number; budgetType: "low" | "medium" | "high"; interests: string[] };

export const api = {
  register: (payload: RegisterInput) =>
    request<{ message: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: LoginInput) =>
    request<{ token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request<{ user: AuthUser }>("/auth/me", {}, true),
  createTrip: (payload: CreateTripInput) =>
    request<{ trip: Trip }>(
      "/trips",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true
    ),
  listTrips: () => request<{ trips: Trip[] }>("/trips", {}, true),
  getTrip: (tripId: string) => request<{ trip: Trip }>(`/trips/${tripId}`, {}, true),
  addActivity: (tripId: string, day: number, activity: string) =>
    request<{ trip: Trip }>(
      `/trips/${tripId}/add-activity`,
      { method: "PATCH", body: JSON.stringify({ day, activity }) },
      true
    ),
  removeActivity: (tripId: string, day: number, activity: string) =>
    request<{ trip: Trip }>(
      `/trips/${tripId}/remove-activity`,
      { method: "PATCH", body: JSON.stringify({ day, activity }) },
      true
    ),
  regenerateDay: (tripId: string, day: number, preferences: string) =>
    request<{ trip: Trip }>(
      `/trips/${tripId}/regenerate-day`,
      { method: "PATCH", body: JSON.stringify({ day, preferences }) },
      true
    ),
};

export { ApiError };
