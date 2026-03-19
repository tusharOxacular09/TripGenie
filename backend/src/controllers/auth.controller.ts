import { NextFunction, Request, Response } from "express";

import { authService } from "../services/auth.service";

const register = (req: Request, res: Response, next: NextFunction): void => {
  authService
    .register(req.body)
    .then((user) => {
      res.status(201).json({ message: "User registered successfully", user });
    })
    .catch(next);
};

const login = (req: Request, res: Response, next: NextFunction): void => {
  authService
    .login(req.body)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(next);
};

const me = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  authService
    .getCurrentUser(req.user.userId)
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch(next);
};

export { login, me, register };
