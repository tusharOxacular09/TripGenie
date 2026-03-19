import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { env } from "../config/env";
import { HttpError } from "../errors/http-error";
import { UserModel } from "../models/user.model";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const SALT_ROUNDS = 10;

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type SafeUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: SafeUser;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const toSafeUser = (user: { _id: Types.ObjectId; name: string; email: string }): SafeUser => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

const validateRegisterInput = (input: RegisterInput): void => {
  if (!input.name?.trim()) {
    throw new HttpError("Name is required", 400);
  }
  if (!input.email?.trim()) {
    throw new HttpError("Email is required", 400);
  }
  if (!EMAIL_REGEX.test(input.email.trim())) {
    throw new HttpError("Invalid email format", 400);
  }
  if (!input.password || input.password.length < 6) {
    throw new HttpError("Password must be at least 6 characters", 400);
  }
};

const validateLoginInput = (input: LoginInput): void => {
  if (!input.email?.trim() || !input.password) {
    throw new HttpError("Email and password are required", 400);
  }
};

const parseRegisterInput = (input: unknown): RegisterInput => {
  if (!isRecord(input)) {
    throw new HttpError("Invalid request payload", 400);
  }

  return {
    name: typeof input.name === "string" ? input.name : "",
    email: typeof input.email === "string" ? input.email : "",
    password: typeof input.password === "string" ? input.password : "",
  };
};

const parseLoginInput = (input: unknown): LoginInput => {
  if (!isRecord(input)) {
    throw new HttpError("Invalid request payload", 400);
  }

  return {
    email: typeof input.email === "string" ? input.email : "",
    password: typeof input.password === "string" ? input.password : "",
  };
};

const generateToken = (userId: string): string =>
  jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: "7d",
  });

const register = async (payload: unknown): Promise<SafeUser> => {
  const input = parseRegisterInput(payload);
  validateRegisterInput(input);

  const email = normalizeEmail(input.email);
  const existingUser = await UserModel.findOne({ email }).lean();
  if (existingUser) {
    throw new HttpError("Email already in use", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await UserModel.create({
    name: input.name.trim(),
    email,
    password: passwordHash,
  });

  return toSafeUser(user);
};

const login = async (payload: unknown): Promise<AuthResponse> => {
  const input = parseLoginInput(payload);
  validateLoginInput(input);

  const email = normalizeEmail(input.email);
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new HttpError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new HttpError("Invalid credentials", 401);
  }

  return {
    token: generateToken(user._id.toString()),
    user: toSafeUser(user),
  };
};

const getCurrentUser = async (userId: string): Promise<SafeUser> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpError("Invalid user identifier", 400);
  }

  const user = await UserModel.findById(userId).select("name email").lean();
  if (!user) {
    throw new HttpError("User not found", 404);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};

export const authService = {
  register,
  login,
  getCurrentUser,
};
