import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const { userId } = decoded;
    if (typeof userId !== "string" || !userId) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    req.user = { userId };
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
