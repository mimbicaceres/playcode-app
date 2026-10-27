// Deja a UN alumno con un avance gradual y realista en los cursos indicados:
// los primeros N ejercicios de cada curso (en orden, como se desbloquean)
// completados en fechas repartidas de los ultimos dias, con algun intento
// fallido, y opcionalmente K intentos fallidos en el ejercicio siguiente.
//
// Uso:  tsx scripts/applyGradualProgress.ts <email> <curso>=<N>[+<K>] ...
// Ej.:  tsx scripts/applyGradualProgress.ts alumno@ejemplo.com python-fundamentos=10 sql-consultas=6+1
//
// Idempotente: borra y recrea SOLO el progreso de ese usuario en esos cursos
// (no toca otros usuarios) y recalcula su XP, racha y ultima actividad.
import "dotenv/config";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

// Pseudo-azar determinista para que la corrida sea reproducible.
const hash = (text: string) => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

// Cada curso "empezo" en un dia distinto, asi el avance no es uniforme.
const START_DAYS_AGO = [21, 14, 9, 5];

async function main() {
  const [email, ...specs] = process.argv.slice(2);
  if (!email || specs.length === 0) {
    throw new Error("Uso: tsx scripts/applyGradualProgress.ts <email> <curso>=<N>[+<K>] ...");
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No existe el usuario ${email}`);

  const now = Date.now();
  let totalXp = 0;
  let lastActivity = 0;

  for (const [courseIndex, spec] of specs.entries()) {
    const match = /^([\w-]+)=(\d+)(?:\+(\d+))?$/.exec(spec);
    if (!match) throw new Error(`Formato invalido: ${spec}`);
    const [, slug, completedStr, failedStr] = match;
    const completedCount = Number(completedStr);
    const failedOnNext = Number(failedStr ?? 0);

    const course = await prisma.course.findUnique({
      where: { slug },
      include: { units: { orderBy: { order: "asc" }, include: { exercises: { orderBy: { order: "asc" } } } } },
    });
    if (!course) throw new Error(`No existe el curso ${slug}`);
    const exercises = course.units.flatMap((u) => u.exercises);
    if (completedCount + (failedOnNext ? 1 : 0) > exercises.length) throw new Error(`${slug}: el curso tiene ${exercises.length} ejercicios`);

    await prisma.exerciseProgress.deleteMany({ where: { userId: user.id, courseId: course.id } });

    const startedDaysAgo = START_DAYS_AGO[courseIndex % START_DAYS_AGO.length];
    const rows: Prisma.ExerciseProgressCreateManyInput[] = exercises.slice(0, completedCount).map((exercise, i) => {
      const h = hash(`${email}:${exercise.id}`);
      // Avance repartido entre el dia de inicio y hoy; los ultimos quedan cerca de "ahora".
      const progress = completedCount > 1 ? i / (completedCount - 1) : 1;
      const hoursAgo = Math.max(2, Math.round((1 - progress) * startedDaysAgo * 24) - (h % 9));
      const completedAt = new Date(now - hoursAgo * 3600 * 1000);
      const attempts = h % 10 < 6 ? 1 : h % 10 < 9 ? 2 : 3;
      lastActivity = Math.max(lastActivity, completedAt.getTime());
      totalXp += exercise.rewardXp;
      return {
        userId: user.id,
        exerciseId: exercise.id,
        unitId: exercise.unitId,
        courseId: course.id,
        attempts,
        completed: true,
        xpEarned: exercise.rewardXp,
        lastAttempt: completedAt,
        completedAt,
      };
    });

    const next = exercises[completedCount];
    if (failedOnNext > 0 && next) {
      const at = new Date(now - 3 * 3600 * 1000);
      lastActivity = Math.max(lastActivity, at.getTime());
      rows.push({
        userId: user.id,
        exerciseId: next.id,
        unitId: next.unitId,
        courseId: course.id,
        attempts: failedOnNext,
        completed: false,
        xpEarned: 0,
        lastAttempt: at,
      });
    }
    await prisma.exerciseProgress.createMany({ data: rows });
    console.log(`${slug}: ${completedCount}/${exercises.length} completados${failedOnNext ? `, ${failedOnNext} intentos en el siguiente` : ""}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totalXp, streakDays: 5, lastActivityAt: new Date(lastActivity) },
  });
  console.log(`${email}: ${totalXp} XP, racha 5, ultima actividad ${new Date(lastActivity).toISOString()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
