import { prisma } from '../../lib/prisma';
import { Request, Response } from 'express';
import { CODIX_CATALOG } from '../../lib/codixCatalog';

/** Helper to locate an exercise definition in the catalog */
function findExerciseById(exerciseId: string) {
  for (const course of CODIX_CATALOG) {
    for (const unit of course.units) {
      const ex = unit.exercises.find((e) => e.id === exerciseId);
      if (ex) return ex;
    }
  }
  return null;
}

/** Register an attempt for a student */
export async function registerAttempt(
  userId: string,
  exerciseId: string,
  success: boolean,
) {
  // Look up the exercise in the catalog to get the reward XP (backend‑only).
  const exerciseMeta = findExerciseById(exerciseId);
  const rewardXp = exerciseMeta?.rewardXp ?? 0;

  // Upsert the ExerciseProgress row.
  const progress = await prisma.exerciseProgress.upsert({
    where: { userId_exerciseId: { userId, exerciseId } },
    update: {
      attempts: { increment: 1 },
      ...(success && { completed: true, completedAt: new Date(), xpEarned: rewardXp }),
      lastAttempt: new Date(),
    },
    create: {
      userId,
      exerciseId,
      attempts: 1,
      completed: success,
      completedAt: success ? new Date() : undefined,
      xpEarned: success ? rewardXp : 0,
      lastAttempt: new Date(),
    },
  });

  // Update user XP and streak – only on first successful completion.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Streak: compare yesterday's date with the stored updatedAt.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const consecutive = user.updatedAt.toDateString() === yesterday.toDateString();
  const newStreak = consecutive ? user.streakDays + 1 : 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: rewardXp },
      streakDays: newStreak,
    },
  });

  return { xpEarned: rewardXp, streakDays: newStreak };
}

/** Express handler for submitting an exercise attempt */
export async function submitExercise(req: Request, res: Response) {
  const { success } = req.body ?? {};
  if (typeof success !== 'boolean') {
    return res.status(400).json({ error: 'success boolean required' });
  }

  const exerciseId = req.params.exerciseId;
  const userId = req.auth!.userId;

  try {
    const result = await registerAttempt(userId, exerciseId, success);
    return res.status(200).json(result);
  } catch (error) {
    console.error('submitExercise error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
