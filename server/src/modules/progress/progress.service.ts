import { prisma } from '../../lib/prisma';

export interface CourseProgressUnitSummary {
  unitId: string;
  unitName: string | null;
  completedExercises: number;
  totalExercises: number;
  percent: number;
}

export interface CourseProgressSummary {
  courseId: string;
  courseName: string | null;
  completedExercises: number;
  totalExercises: number;
  progressPercent: number;
  xpEarned: number;
  units: CourseProgressUnitSummary[];
}

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

/**
 * Progreso real de un usuario agrupado por curso, para los cursos
 * dinamicos (con unidades y ejercicios reales en la DB). Los cursos del
 * catalogo estatico (sin contenido real migrado) no tienen "total" posible
 * de calcular, asi que se excluyen de este resultado — siguen mostrandose
 * con el tratamiento de siempre (ceros) en el resto de la app.
 */
export async function getUserProgressByCourse(userId: string): Promise<CourseProgressSummary[]> {
  const records = await prisma.exerciseProgress.findMany({
    where: { userId, courseId: { not: null } },
    select: { exerciseId: true, courseId: true, completed: true, xpEarned: true },
  });
  if (records.length === 0) return [];

  const courseIds = [...new Set(records.map((r) => r.courseId as string))];
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    include: {
      units: {
        orderBy: { order: 'asc' },
        include: { exercises: { select: { id: true } } },
      },
    },
  });

  return courses
    .filter((course) => course.units.some((unit) => unit.exercises.length > 0))
    .map((course) => {
      const courseRecords = records.filter((r) => r.courseId === course.id);
      const completedIds = new Set(courseRecords.filter((r) => r.completed).map((r) => r.exerciseId));
      const xpEarned = courseRecords.reduce((sum, r) => sum + (r.xpEarned ?? 0), 0);

      const units: CourseProgressUnitSummary[] = course.units.map((unit) => {
        const totalExercises = unit.exercises.length;
        const completedExercises = unit.exercises.filter((e) => completedIds.has(e.id)).length;
        return {
          unitId: unit.id,
          unitName: unit.title,
          completedExercises,
          totalExercises,
          percent: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
        };
      });

      const totalExercises = units.reduce((sum, u) => sum + u.totalExercises, 0);
      const completedExercises = units.reduce((sum, u) => sum + u.completedExercises, 0);

      return {
        courseId: course.id,
        courseName: course.title,
        completedExercises,
        totalExercises,
        progressPercent: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
        xpEarned,
        units,
      };
    });
}
