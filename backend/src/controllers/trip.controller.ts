import { Request, Response } from "express";

export const createTrip = async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({ message: "Not implemented yet: create trip" });
};

export const getTrips = async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({ message: "Not implemented yet: get trips" });
};

export const getTripById = async (_req: Request, res: Response): Promise<void> => {
  res.status(501).json({ message: "Not implemented yet: get trip by id" });
};
