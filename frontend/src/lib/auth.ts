const REFRESH_TOKEN_KEY = "tripgenie_refresh_token";

export const authStorage = {
  getRefreshToken: (): string => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? "";
  },
  setRefreshToken: (refreshToken: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearRefreshToken: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
