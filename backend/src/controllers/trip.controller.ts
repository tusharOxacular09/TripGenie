import { NextFunction, Request, Response } from "express";

import { tripService } from "../services/trip.service";
import { apiResponse } from "../utils/api-response";

const getAuthenticatedUserId = (req: Request, res: Response): string | null => {
  if (!req.user?.userId) {
    res.status(401).json(apiResponse.error("Unauthorized"));
    return null;
  }
  return req.user.userId;
};

const getTripIdParam = (req: Request, res: Response): string | null => {
  const tripId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!tripId) {
    res.status(400).json(apiResponse.error("Trip identifier is required"));
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
      res.status(201).json(apiResponse.success("Trip created successfully", { trip }));
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
      res.status(200).json(apiResponse.success("Trips fetched successfully", { trips }));
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
      res.status(200).json(apiResponse.success("Trip fetched successfully", { trip }));
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
      res.status(200).json(apiResponse.success("Activity added successfully", { trip }));
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
      res.status(200).json(apiResponse.success("Activity removed successfully", { trip }));
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
      res.status(200).json(apiResponse.success("Day regenerated successfully", { trip }));
    })
    .catch(next);
};

const deleteTrip = (req: Request, res: Response, next: NextFunction): void => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const tripId = getTripIdParam(req, res);
  if (!tripId) {
    return;
  }

  tripService
    .deleteTrip(userId, tripId)
    .then(() => {
      res.status(200).json(apiResponse.success("Trip deleted successfully", null));
    })
    .catch(next);
};

export { addActivity, createTrip, deleteTrip, getTripById, getTrips, regenerateDay, removeActivity };
