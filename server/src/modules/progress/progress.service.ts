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

/**
 * Obtiene el progreso del estudiante a partir de los registros de ejercicios.
 * @param userId ID del usuario del cual se quiere obtener el progreso.
 * @returns Un objeto UserProgress con XP total, ejercicios completados, intentos y detalle por ejercicio.
 */
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

  const totalXp = records.reduce((sum, r) => sum + (r.xpEarned ?? 0), 0); // Suma total de XP ganado
  const totalCompleted = records.filter((r) => r.completed).length; // Cuenta los ejercicios completados
  const totalAttempts = records.reduce((sum, r) => sum + (r.attempts ?? 0), 0); // Suma total de intentos realizados

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
