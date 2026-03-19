import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { HttpError } from "./errors/http-error";
import { apiRouter } from "./routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Hello from TripGenie backend" });
});

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? message : undefined,
  });
});

export { app };
