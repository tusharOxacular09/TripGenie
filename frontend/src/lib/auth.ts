const TOKEN_KEY = "tripgenie_token";

export const authStorage = {
  getToken: (): string => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem(TOKEN_KEY) ?? "";
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};
