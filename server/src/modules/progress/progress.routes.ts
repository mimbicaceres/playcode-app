import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getUserProgress, getUserProgressByCourse, getWeeklyXpTrend } from './progress.service';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth!.userId;
    const data = await getUserProgress(userId);
    res.json(data);
  } catch (error) {
    console.error('getUserProgress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Progreso real propio, agrupado por curso (solo cursos dinamicos con
// contenido real). Alimenta la barra de progreso del alumno.
router.get('/by-course', requireAuth, async (req, res) => {
  try {
    const userId = req.auth!.userId;
    const [progress, weeklyXp] = await Promise.all([
      getUserProgressByCourse(userId),
      getWeeklyXpTrend([userId]),
    ]);
    res.json({ progress, weeklyXp });
  } catch (error) {
    console.error('getUserProgressByCourse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
