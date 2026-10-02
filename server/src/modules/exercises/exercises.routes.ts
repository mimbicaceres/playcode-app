import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { handleSubmitExercise } from './exercises.controller';

const router = Router();

// Submit an attempt for a specific exercise (exerciseId param)
router.post('/:exerciseId/submit', requireAuth, handleSubmitExercise);

export default router;
