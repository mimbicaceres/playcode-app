import { Prisma } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";

// Historial de intentos (ExerciseAttempt) de los datos de ejemplo.
//
// El seed crea el RESUMEN de cada ejercicio (ExerciseProgress: cuantos intentos,
// si lo completo y cuando). Esta funcion lo traduce a intentos individuales para
// que la precision, la actividad reciente y el tiempo de practica salgan de datos
// y sean coherentes con el avance: un ejercicio completado con N intentos son N-1
// intentos fallidos y uno correcto en el momento en que se completo; uno sin
// completar son N intentos fallidos. Los horarios y duraciones se reparten de forma
// determinista (es informacion de ejemplo).
//
// Idempotente y no destructivo: solo crea intentos para los ejercicios de un
// usuario que todavia no tienen NINGUNO, asi no toca el historial real de nadie.

const MINUTE_MS = 60 * 1000;

// Misma funcion de hash que el resto de los seeds, para que sea reproducible.
const hash = (text: string) => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
// Numero determinista en [min, max] para una semilla y un indice.
const pick = (seed: number, index: number, min: number, max: number) => {
  const x = Math.imul(seed ^ Math.imul(index + 1, 0x9e3779b1), 0x85ebca6b) >>> 0;
  return min + (x % (max - min + 1));
};

export async function seedAttempts(userIds?: string[]) {
  const progress = await prisma.exerciseProgress.findMany({
    where: { attempts: { gt: 0 }, ...(userIds ? { userId: { in: userIds } } : {}) },
    select: { userId: true, exerciseId: true, unitId: true, courseId: true, attempts: true, completed: true, completedAt: true, lastAttempt: true },
  });
  if (progress.length === 0) return;

  const existing = await prisma.exerciseAttempt.groupBy({
    by: ["userId", "exerciseId"],
    where: userIds ? { userId: { in: userIds } } : undefined,
  });
  const done = new Set(existing.map((e) => `${e.userId}:${e.exerciseId}`));

  // Semilla estable: correo del alumno + slug del ejercicio. Los ids internos (cuid/UUID)
  // cambian en cada base, y el historial tiene que ser igual para todo el equipo.
  const emailOf = new Map((await prisma.user.findMany({ where: { id: { in: [...new Set(progress.map((p) => p.userId))] } }, select: { id: true, email: true } })).map((u) => [u.id, u.email]));
  const slugOf = new Map(
    (await prisma.exercise.findMany({ where: { id: { in: [...new Set(progress.map((p) => p.exerciseId))] } }, select: { id: true, slug: true } })).map((e) => [e.id, e.slug]),
  );

  const rows: Prisma.ExerciseAttemptCreateManyInput[] = [];
  for (const p of progress) {
    if (done.has(`${p.userId}:${p.exerciseId}`)) continue;
    const seed = hash(`${emailOf.get(p.userId) ?? p.userId}:${slugOf.get(p.exerciseId) ?? p.exerciseId}`);
    const end = (p.completed ? p.completedAt : p.lastAttempt) ?? p.lastAttempt ?? new Date();
    const failed = p.completed ? p.attempts - 1 : p.attempts;

    // Cada intento previo es unos minutos anterior al siguiente.
    let at = end.getTime();
    const times: { at: Date; success: boolean }[] = [];
    if (p.completed) times.push({ at: new Date(at), success: true });
    for (let i = 0; i < failed; i++) {
      at -= pick(seed, i, 2, 9) * MINUTE_MS;
      times.push({ at: new Date(at), success: false });
    }

    times.forEach((t, i) => {
      rows.push({
        userId: p.userId,
        exerciseId: p.exerciseId,
        unitId: p.unitId,
        courseId: p.courseId,
        success: t.success,
        createdAt: t.at,
        // Los intentos fallidos suelen ser mas cortos que el que resuelve.
        durationSec: t.success ? pick(seed, 100 + i, 120, 420) : pick(seed, 200 + i, 60, 300),
        lines: pick(seed, 300 + i, 4, 16),
      });
    });
  }

  for (let i = 0; i < rows.length; i += 1000) {
    await prisma.exerciseAttempt.createMany({ data: rows.slice(i, i + 1000) });
  }
  console.log(`Historial de intentos: ${rows.length} intentos generados para ${new Set(rows.map((r) => r.userId)).size} usuarios`);
}
