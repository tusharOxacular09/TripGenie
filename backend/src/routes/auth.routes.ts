import { Router } from "express";

import { login, me, refresh, register, updateProfile } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.get("/me", authenticate, me);
authRouter.put("/profile", authenticate, updateProfile);

export { authRouter };
