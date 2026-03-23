import { NextFunction, Request, Response } from "express";

import { tripService } from "../services/trip.service";

const getAuthenticatedUserId = (req: Request, res: Response): string | null => {
  if (!req.user?.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return req.user.userId;
};

const getTripIdParam = (req: Request, res: Response): string | null => {
  const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!tripId) {
    res.status(400).json({ message: "Trip identifier is required" });
    return null;
  }
  return tripId;
};

const createTrip = (req: Request, res: Response, next: NextFunction): void => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  tripService
    .createTrip(userId, req.body)
    .then((trip) => {
      res.status(201).json({ trip });
    })
    .catch(next);
};

const getTrips = (req: Request, res: Response, next: NextFunction): void => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  tripService
    .getTrips(userId)
    .then((trips) => {
      res.status(200).json({ trips });
    })
    .catch(next);
};

const getTripById = (req: Request, res: Response, next: NextFunction): void => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const tripId = getTripIdParam(req, res);
  if (!tripId) {
    return;
  }

  tripService
    .getTripById(userId, tripId)
    .then((trip) => {
      res.status(200).json({ trip });
    })
    .catch(next);
};

const addActivity = (req: Request, res: Response, next: NextFunction): void => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const tripId = getTripIdParam(req, res);
  if (!tripId) {
    return;
  }

  tripService
    .addActivity(userId, tripId, req.body)
    .then((trip) => {
      res.status(200).json({ trip });
    })
    .catch(next);
};

const removeActivity = (req: Request, res: Response, next: NextFunction): void => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const tripId = getTripIdParam(req, res);
  if (!tripId) {
    return;
  }

  tripService
    .removeActivity(userId, tripId, req.body)
    .then((trip) => {
      res.status(200).json({ trip });
    })
    .catch(next);
};

const regenerateDay = (req: Request, res: Response, next: NextFunction): void => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const tripId = getTripIdParam(req, res);
  if (!tripId) {
    return;
  }

  tripService
    .regenerateDay(userId, tripId, req.body)
    .then((trip) => {
      res.status(200).json({ trip });
    })
    .catch(next);
};

export { addActivity, createTrip, getTripById, getTrips, regenerateDay, removeActivity };
