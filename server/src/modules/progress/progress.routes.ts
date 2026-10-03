import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getUserProgress } from './progress.service';

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

export default router;
