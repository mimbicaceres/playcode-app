import { prisma } from '../../lib/prisma';
import { Request, Response } from 'express';
import { CODIX_CATALOG } from '../../lib/codixCatalog';
import { gradeSubmission, ReportedOutput } from '../../lib/codeGrader';
import { nextStreakOnActivity } from '../../lib/streak';
import { getGamification, gamificationDelta } from '../../lib/gamification';
import { getGamificationSettings, xpForExercise } from '../../lib/gamificationSettings';
import { dateKeyInArgentina } from '../../lib/streak';

interface AttemptContext {
  rewardXp: number;
  unitId?: string;
  courseId?: string;
}

// Datos opcionales del intento que informa el navegador.
interface AttemptExtra {
  durationSec?: number;
  lines?: number;
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
  extra: AttemptExtra = {},
) {
  const { rewardXp, unitId, courseId } = context;

  // Historial: una fila por intento (acierte o no). De aca salen la precision,
  // el tiempo de practica y la actividad reciente.
  await prisma.exerciseAttempt.create({
    data: { userId, exerciseId, unitId, courseId, success, durationSec: extra.durationSec, lines: extra.lines },
  });

  // El XP y la fecha de completado se otorgan SOLO la primera vez que se resuelve
  // el ejercicio: repasar uno ya resuelto no suma XP de nuevo ni pisa la fecha.
  const previous = await prisma.exerciseProgress.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
    select: { completed: true },
  });
  const firstCompletion = success && !previous?.completed;

  // XP otorgado segun los ajustes del admin: (XP del ejercicio + base) x multiplicador,
  // mas un bonus la primera vez en el dia que el alumno completa un ejercicio.
  const settings = await getGamificationSettings();
  let bonusXp = 0;
  if (firstCompletion && settings.streakBonusXp > 0) {
    const todayKey = dateKeyInArgentina(new Date());
    const recent = await prisma.exerciseProgress.findMany({
      where: { userId, completed: true, completedAt: { gte: new Date(Date.now() - 36 * 60 * 60 * 1000) } },
      select: { completedAt: true },
    });
    const alreadyToday = recent.some((r) => r.completedAt && dateKeyInArgentina(r.completedAt) === todayKey);
    if (!alreadyToday) bonusXp = settings.streakBonusXp;
  }
  const awardedXp = firstCompletion ? xpForExercise(rewardXp, settings) + bonusXp : 0;

  const progress = await prisma.exerciseProgress.upsert({
    where: { userId_exerciseId: { userId, exerciseId } },
    update: {
      attempts: { increment: 1 },
      unitId,
      courseId,
      ...(firstCompletion && { completed: true, completedAt: new Date(), xpEarned: awardedXp }),
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
      xpEarned: success ? awardedXp : 0,
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
      totalXp: { increment: awardedXp },
      streakDays: newStreak,
      lastActivityAt: now,
    },
  });

  return { attempts: progress.attempts, completed: progress.completed, xpEarned: awardedXp, bonusXp, streakDays: newStreak };
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
    const { code, outputs, infraError, timeSpentSec } = (req.body ?? {}) as {
      code?: string;
      outputs?: ReportedOutput[];
      infraError?: string;
      timeSpentSec?: number;
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
      const before = await getGamification(userId);
      const result = await registerAttempt(
        userId,
        exerciseId,
        grade.allPassed,
        { rewardXp: exercise.rewardXp, unitId: exercise.unitId, courseId: exercise.unit.courseId },
        {
          // El tiempo lo informa el navegador: se acota para que un dato absurdo no distorsione las estadisticas.
          durationSec: typeof timeSpentSec === 'number' && timeSpentSec >= 0 ? Math.min(Math.round(timeSpentSec), 1800) : undefined,
          // Una respuesta de opcion multiple no es codigo: no suma lineas.
          lines: exercise.language === 'quiz' ? undefined : code.split(/\r?\n/).filter((line) => line.trim().length > 0).length,
        },
      );
      const after = await getGamification(userId);
      return res.status(200).json({
        ...result,
        success: grade.allPassed,
        gamification: gamificationDelta(before, after),
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
