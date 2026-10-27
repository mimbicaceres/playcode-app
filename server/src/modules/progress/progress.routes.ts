import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getUserProgress, getUserProgressByCourse, getWeeklyXpTrend } from './progress.service';
import { getStudentStatsBundle } from './stats.service';
import { getGamification } from '../../lib/gamification';

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
    const [progress, weeklyXp, stats, gamification] = await Promise.all([
      getUserProgressByCourse(userId),
      getWeeklyXpTrend([userId]),
      getStudentStatsBundle(userId),
      getGamification(userId),
    ]);
    res.json({ progress, weeklyXp, stats, gamification });
  } catch (error) {
    console.error('getUserProgressByCourse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
