import mongoose from "mongoose";
import { AICacheModel } from "../models/ai-cache.model";
import { TripModel } from "../models/trip.model";
import { UserModel } from "../models/user.model";

export const connectDatabase = async (mongodbUri: string, dbName: string): Promise<void> => {
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongodbUri, { dbName });

  await Promise.all([UserModel.createCollection(), TripModel.createCollection(), AICacheModel.createCollection()]);
  await Promise.all([UserModel.syncIndexes(), TripModel.syncIndexes(), AICacheModel.syncIndexes()]);
};
