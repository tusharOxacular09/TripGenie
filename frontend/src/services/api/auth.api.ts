import { apiClient } from "./client";
import { AuthUser } from "../../types/api";

type Envelope<T> = {
  status: "success" | "error";
  message: string;
  data: T;
  error: Record<string, unknown> | null;
};

export const authApi = {
  register: async (payload: { name: string; email: string; password: string }) => {
    const response = await apiClient.post<Envelope<{ accessToken: string; refreshToken: string; user: AuthUser }>>(
      "/auth/register",
      payload
    );
    return response.data.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const response = await apiClient.post<Envelope<{ accessToken: string; refreshToken: string; user: AuthUser }>>(
      "/auth/login",
      payload
    );
    return response.data.data;
  },
  me: async () => {
    const response = await apiClient.get<Envelope<{ user: AuthUser }>>("/auth/me");
    return response.data.data.user;
  },
  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<Envelope<{ accessToken: string }>>("/auth/refresh", { refreshToken });
    return response.data.data.accessToken;
  },
  updateProfile: async (payload: { name: string; email: string }) => {
    const response = await apiClient.put<Envelope<{ user: AuthUser }>>("/auth/profile", payload);
    return response.data.data.user;
  },
};
