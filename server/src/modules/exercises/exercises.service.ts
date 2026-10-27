import { prisma } from '../../lib/prisma';
import { Request, Response } from 'express';
import { CODIX_CATALOG } from '../../lib/codixCatalog';
import { gradeSubmission, ReportedOutput } from '../../lib/codeGrader';
import { nextStreakOnActivity } from '../../lib/streak';

interface AttemptContext {
  rewardXp: number;
  unitId?: string;
  courseId?: string;
}

/**
 * Busca un ejercicio del catalogo estatico (cursos viejos, aun no migrados a
 * la base de datos) y el contexto de unidad/curso que lo contiene.
 */
function findLegacyContext(exerciseId: string): AttemptContext | null {
  for (const course of CODIX_CATALOG) {
    for (const unit of course.units) {
      const ex = unit.exercises.find((e) => e.id === exerciseId);
      if (ex) {
        return { rewardXp: ex.rewardXp, unitId: ex.unitId, courseId: unit.courseId };
      }
    }
  }
  return null;
}

/** Registra un intento de solucion de un ejercicio por parte de un estudiante. */
export async function registerAttempt(
  userId: string,
  exerciseId: string,
  success: boolean,
  context: AttemptContext,
) {
  const { rewardXp, unitId, courseId } = context;

  const progress = await prisma.exerciseProgress.upsert({
    where: { userId_exerciseId: { userId, exerciseId } },
    update: {
      attempts: { increment: 1 },
      unitId,
      courseId,
      ...(success && { completed: true, completedAt: new Date(), xpEarned: rewardXp }),
      lastAttempt: new Date(),
    },
    create: {
      userId,
      exerciseId,
      unitId,
      courseId,
      attempts: 1,
      completed: success,
      completedAt: success ? new Date() : undefined,
      xpEarned: success ? rewardXp : 0,
      lastAttempt: new Date(),
    },
  });

  // Cada intento (exito o no) cuenta como actividad para la racha, con
  // huso horario de Argentina (ver server/src/lib/streak.ts). totalXp solo
  // sube con intentos exitosos.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const now = new Date();
  const newStreak = nextStreakOnActivity(user.streakDays, user.lastActivityAt, now);

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: success ? rewardXp : 0 },
      streakDays: newStreak,
      lastActivityAt: now,
    },
  });

  return { attempts: progress.attempts, completed: progress.completed, xpEarned: success ? rewardXp : 0, streakDays: newStreak };
}

/** Express handler for submitting an exercise attempt */
export async function submitExercise(req: Request, res: Response) {
  const exerciseId = req.params.exerciseId;
  const userId = req.auth!.userId;

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { testCases: true, unit: true },
  });

  // Ejercicio real de tipo code_runner: el servidor es la unica autoridad
  // sobre si aprobo o no. El cliente manda la salida cruda que produjo su
  // codigo (nunca un veredicto), y aca se compara contra el expectedOutput
  // real guardado en la base de datos.
  if (exercise && exercise.type === 'code_runner') {
    const { code, outputs, infraError } = (req.body ?? {}) as {
      code?: string;
      outputs?: ReportedOutput[];
      infraError?: string;
    };

    if (typeof code !== 'string') {
      return res.status(400).json({ error: 'code string required' });
    }

    // El navegador no pudo ejecutar el codigo (ej. Pyodide no cargo): no es
    // un intento fallido del alumno, no se toca ExerciseProgress.
    if (infraError) {
      return res.status(503).json({
        error: 'runner_unavailable',
        message: 'No pudimos verificar tu código. Reintentá en unos segundos.',
      });
    }

    if (!Array.isArray(outputs)) {
      return res.status(400).json({ error: 'outputs array required' });
    }

    const grade = gradeSubmission(
      exercise.testCases.map((tc) => ({ id: tc.id, expectedOutput: tc.expectedOutput, isHidden: tc.isHidden, compareMode: tc.compareMode })),
      outputs,
    );

    try {
      const result = await registerAttempt(userId, exerciseId, grade.allPassed, {
        rewardXp: exercise.rewardXp,
        unitId: exercise.unitId,
        courseId: exercise.unit.courseId,
      });
      return res.status(200).json({
        ...result,
        success: grade.allPassed,
        results: grade.results.map((r) => ({
          testCaseId: r.testCaseId,
          passed: r.passed,
          isHidden: r.isHidden,
          // El expectedOutput de casos ocultos nunca se manda al cliente.
          expectedOutput: r.isHidden ? undefined : r.expectedOutput,
          actualOutput: r.actualOutput,
          stderr: r.stderr,
          timedOut: r.timedOut,
        })),
      });
    } catch (error) {
      console.error('submitExercise error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Flujo viejo (cursos del catalogo estatico, tipo fill_variable): el
  // cliente sigue mandando el veredicto, como siempre hizo.
  const { success } = (req.body ?? {}) as { success?: boolean };
  if (typeof success !== 'boolean') {
    return res.status(400).json({ error: 'success boolean required' });
  }

  const legacyContext = findLegacyContext(exerciseId);
  try {
    const result = await registerAttempt(userId, exerciseId, success, legacyContext ?? { rewardXp: 0 });
    return res.status(200).json({ ...result, success });
  } catch (error) {
    console.error('submitExercise error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
