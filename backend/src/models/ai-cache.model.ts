import { Model, Schema, model, models } from "mongoose";

type AICache = {
  key: string;
  input: Record<string, unknown>;
  response: Record<string, unknown>;
  createdAt: Date;
};

type AICacheModel = Model<AICache>;

const aiCacheSchema = new Schema<AICache, AICacheModel>(
  {
    key: { type: String, required: true, unique: true, index: true },
    input: { type: Schema.Types.Mixed, required: true },
    response: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
  },
  {
    strict: true,
    versionKey: false,
  }
);

export const AICacheModel =
  (models.AICache as AICacheModel) || model<AICache, AICacheModel>("AICache", aiCacheSchema, "ai_cache");
