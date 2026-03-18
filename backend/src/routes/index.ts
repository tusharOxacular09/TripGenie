import { Router } from "express";

import { authRouter } from "./auth.routes";
import { tripRouter } from "./trip.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/trips", tripRouter);

export { apiRouter };
