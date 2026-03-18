import { Router } from "express";

import { createTrip, getTripById, getTrips } from "../controllers/trip.controller";
import { authenticate } from "../middleware/auth.middleware";

const tripRouter = Router();

tripRouter.use(authenticate);

tripRouter.get("/", getTrips);
tripRouter.post("/", createTrip);
tripRouter.get("/:tripId", getTripById);

export { tripRouter };
