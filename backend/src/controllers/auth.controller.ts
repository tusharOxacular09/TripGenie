import { Request, Response } from "express";

export const register = async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({ message: "Not implemented yet: register" });
};

export const login = async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({ message: "Not implemented yet: login" });
};
