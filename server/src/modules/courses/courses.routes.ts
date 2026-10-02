import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { getUserCourses } from './courses.service';

const router = Router();

router.get('/courses', requireAuth, async (req, res) => {
  try {
    const courseIds = await getUserCourses(req.auth!.userId);
    res.json({ courseIds });
  } catch (error) {
    console.error('getUserCourses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
