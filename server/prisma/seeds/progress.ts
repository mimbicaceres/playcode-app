import { Prisma } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";
import { seedAttempts } from "./attempts";

// Deja a UN alumno con un avance gradual y realista en los cursos indicados:
// los primeros N ejercicios de cada curso (en orden, como se desbloquean)
// completados en fechas repartidas de los ultimos dias, con algun intento
// fallido, y opcionalmente K intentos fallidos en el ejercicio siguiente.
// Cada spec es "<slug-del-curso>=<N>[+<K>]".
//
// Borra y recrea SOLO el progreso de ese usuario en esos cursos y recalcula su
// XP, racha y ultima actividad. Se usa desde el script de consola y desde el
// seed (que solo lo llama si el usuario todavia no tiene progreso).

// Pseudo-azar determinista para que la corrida sea reproducible.
const hash = (text: string) => [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

// Cada curso "empezo" en un dia distinto, asi el avance no es uniforme.
const START_DAYS_AGO = [21, 14, 9, 5];

export async function applyGradualProgress(email: string, specs: string[]) {
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
    // El historial de intentos de ese curso se regenera a partir del nuevo progreso.
    await prisma.exerciseAttempt.deleteMany({ where: { userId: user.id, courseId: course.id } });

    const startedDaysAgo = START_DAYS_AGO[courseIndex % START_DAYS_AGO.length];
    const rows: Prisma.ExerciseProgressCreateManyInput[] = exercises.slice(0, completedCount).map((exercise, i) => {
      // slug (no id): el id es un UUID distinto en cada base y el avance tiene que ser igual para todos.
      const h = hash(`${email}:${exercise.slug ?? exercise.id}`);
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
  await seedAttempts([user.id]);
}
