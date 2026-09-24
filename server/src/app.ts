import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// ─── Middlewares globales ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ─────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Health check endpoint — confirma que el servidor está operativo.
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    proyecto: 'CODIX',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? 'development',
  });
});

// ─── Manejo de rutas no encontradas ────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Manejo global de errores ───────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Inicio del servidor ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CODIX Server corriendo en http://localhost:${PORT}`);
  console.log(`   GET /api/health → { status: 'ok', proyecto: 'CODIX' }`);
});

export default app;
