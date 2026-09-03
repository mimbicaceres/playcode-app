import cors from "cors";
import express, { Express } from "express";
import authRoutes from "./modules/auth/auth.routes";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);

  return app;
}
