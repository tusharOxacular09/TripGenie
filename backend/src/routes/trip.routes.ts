import { Router } from "express";

import {
  addActivity,
  createTrip,
  deleteTrip,
  getTripById,
  getTrips,
  regenerateDay,
  removeActivity,
} from "../controllers/trip.controller";
import { authenticate } from "../middleware/auth.middleware";

const tripRouter = Router();

tripRouter.use(authenticate);

tripRouter.get("/", getTrips);
tripRouter.post("/", createTrip);
tripRouter.get("/:id", getTripById);
tripRouter.delete("/:id", deleteTrip);
tripRouter.patch("/:id/add-activity", addActivity);
tripRouter.patch("/:id/remove-activity", removeActivity);
tripRouter.patch("/:id/regenerate-day", regenerateDay);

export { tripRouter };
