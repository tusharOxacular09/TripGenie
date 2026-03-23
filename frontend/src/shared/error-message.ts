import { AxiosError } from "axios";

import { HttpError } from "./http-error";

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof HttpError) {
    return error.message;
  }
  if (error instanceof AxiosError) {
    const message = error.response?.data as { message?: string } | undefined;
    if (message?.message) {
      return message.message;
    }
    return error.message || fallback;
  }
  return fallback;
};
