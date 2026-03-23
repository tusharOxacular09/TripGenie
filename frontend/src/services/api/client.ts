import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { authStorage } from "../../lib/auth";
import { logout, setCredentials } from "../../store/auth.slice";
import { store } from "../../store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 20000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  queue.forEach((resolve) => resolve(token));
  queue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      store.dispatch(logout());
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve) => {
        queue.push((newToken: string) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(original));
        });
      });
    }

    refreshing = true;
    original._retry = true;
    try {
      const response = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
      const accessToken = response.data?.data?.accessToken as string;
      const currentUser = store.getState().auth.user;
      store.dispatch(setCredentials({ accessToken, user: currentUser }));
      processQueue(accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      store.dispatch(logout());
      authStorage.clearRefreshToken();
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);

export { apiClient };
