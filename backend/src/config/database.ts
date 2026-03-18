import mongoose from "mongoose";
import { TripModel } from "../models/trip.model";
import { UserModel } from "../models/user.model";

export const connectDatabase = async (mongodbUri: string, dbName: string): Promise<void> => {
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongodbUri, { dbName });

  await Promise.all([UserModel.createCollection(), TripModel.createCollection()]);
  await Promise.all([UserModel.syncIndexes(), TripModel.syncIndexes()]);
};
