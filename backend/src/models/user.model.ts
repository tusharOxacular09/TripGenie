import { Model, Schema, model, models } from "mongoose";

export interface User {
  name: string;
  email: string;
  password: string;
}

type UserModel = Model<User>;

const userSchema = new Schema<User, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: { type: String, required: true, minlength: 6 },
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false,
  }
);

export const UserModel = (models.User as UserModel) || model<User, UserModel>("User", userSchema);
