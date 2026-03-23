import dotenv from "dotenv";

dotenv.config();

const required = ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? "",
  mongodbDbName: process.env.MONGODB_DB_NAME ?? "tripgenie",
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY ?? "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY ?? "7d",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};
