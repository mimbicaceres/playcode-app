import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import coursesRoutes from "./modules/courses/courses.routes";
import exercisesRoutes from "./modules/exercises/exercises.routes";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      proyecto: "CODIX",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV ?? "development",
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
app.use("/api/users/me", coursesRoutes);
  app.use("/api/exercises", exercisesRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[ERROR]", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  return app;
}
