import { HttpError } from "../../shared/http-error";

export const authValidators = {
  validateLoginInput: (email: string, password: string): void => {
    if (!email.trim()) {
      throw new HttpError("Email is required", 400);
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new HttpError("Invalid email format", 400);
    }
    if (!password || password.length < 6) {
      throw new HttpError("Password must be at least 6 characters", 400);
    }
  },
  validateRegisterInput: (name: string, email: string, password: string): void => {
    if (!name.trim()) {
      throw new HttpError("Name is required", 400);
    }
    if (!email.trim()) {
      throw new HttpError("Email is required", 400);
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new HttpError("Invalid email format", 400);
    }
    if (!password || password.length < 6) {
      throw new HttpError("Password must be at least 6 characters", 400);
    }
  },
};
