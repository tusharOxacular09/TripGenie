import mongoose from "mongoose";

export const connectDatabase = async (mongodbUri: string): Promise<void> => {
  if (!mongodbUri) {
    return;
  }

  await mongoose.connect(mongodbUri);
};
