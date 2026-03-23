import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { authStorage } from "../../lib/auth";
import { logout, setCredentials } from "../../store/auth.slice";
import { store } from "../../store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 20000,
});

const isPublicAuthRoute = (url?: string): boolean => {
  if (!url) {
    return false;
  }
  return url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");
};

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  const refreshToken = authStorage.getRefreshToken();
  if (refreshToken && !isPublicAuthRoute(config.url)) {
    const refreshedToken = await requestAccessTokenRefresh();
    config.headers.Authorization = `Bearer ${refreshedToken}`;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

const requestAccessTokenRefresh = async (): Promise<string> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token missing");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE}/api/auth/refresh`, { refreshToken })
      .then((response) => {
        const accessToken = response.data?.data?.accessToken;
        if (typeof accessToken !== "string" || !accessToken) {
          throw new Error("Invalid refresh response");
        }
        const currentUser = store.getState().auth.user;
        store.dispatch(setCredentials({ accessToken, user: currentUser }));
        return accessToken;
      })
      .catch((error) => {
        store.dispatch(logout());
        authStorage.clearRefreshToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (!authStorage.getRefreshToken()) {
      store.dispatch(logout());
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const accessToken = await requestAccessTokenRefresh();
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch {
      return Promise.reject(error);
    }
  }
);

export { apiClient, requestAccessTokenRefresh };
