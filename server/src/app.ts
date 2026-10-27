import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import coursesRoutes from "./modules/courses/courses.routes";
import courseContentRoutes from "./modules/courses/courseContent.routes";
import courseAdminRoutes from "./modules/courses/courseAdmin.routes";
import instituteRoutes from "./modules/institute/institute.routes";
import progressRoutes from "./modules/progress/progress.routes";
import exercisesRoutes from "./modules/exercises/exercises.routes";
import reportsRoutes from "./modules/reports/reports.routes";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  // Limite subido de 100kb (default) a 4mb: la foto de perfil se manda como
  // data:image/... en base64 (hasta ~2MB de archivo original).
  app.use(express.json({ limit: "4mb" }));
  app.use(express.urlencoded({ extended: true, limit: "4mb" }));

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
app.use("/api/users/me/progress", progressRoutes);
  app.use("/api/exercises", exercisesRoutes);
  app.use("/api/courses", courseContentRoutes);
  app.use("/api/admin/courses", courseAdminRoutes);
  app.use("/api/institute", instituteRoutes);
  app.use("/api/reports", reportsRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[ERROR]", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  return app;
}
