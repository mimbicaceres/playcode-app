import { prisma } from '../../lib/prisma';
import { ExerciseProgress } from '@prisma/client';

export interface UserProgress {
  totalXp: number;
  totalCompleted: number;
  totalAttempts: number;
  byExercise: Array<{
    exerciseId: string;
    unitId: string | null;
    courseId: string | null;
    completed: boolean;
    attempts: number;
    xpEarned: number;
    completedAt: Date | null;
    lastAttempt: Date | null;
  }>;
}

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const records = await prisma.exerciseProgress.findMany({
    where: { userId },
    select: {
      exerciseId: true,
      unitId: true,
      courseId: true,
      completed: true,
      attempts: true,
      xpEarned: true,
      completedAt: true,
      lastAttempt: true,
    },
  });

  const totalXp = records.reduce((sum, r) => sum + (r.xpEarned ?? 0), 0);
  const totalCompleted = records.filter((r) => r.completed).length;
  const totalAttempts = records.reduce((sum, r) => sum + (r.attempts ?? 0), 0);

  const byExercise = records.map((r) => ({
    exerciseId: r.exerciseId,
    unitId: r.unitId,
    courseId: r.courseId,
    completed: r.completed,
    attempts: r.attempts,
    xpEarned: r.xpEarned,
    completedAt: r.completedAt,
    lastAttempt: r.lastAttempt,
  }));

  return { totalXp, totalCompleted, totalAttempts, byExercise };
}
