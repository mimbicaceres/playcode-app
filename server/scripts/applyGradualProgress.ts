// Aplica un avance gradual a un alumno (ver prisma/seeds/progress.ts).
//
// Uso:  tsx scripts/applyGradualProgress.ts <email> <curso>=<N>[+<K>] ...
// Ej.:  tsx scripts/applyGradualProgress.ts alumno@ejemplo.com python-fundamentos=10 sql-consultas=6+1
//
// Idempotente: borra y recrea SOLO el progreso de ese usuario en esos cursos.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { applyGradualProgress } from "../prisma/seeds/progress";

const [email, ...specs] = process.argv.slice(2);

(async () => {
  if (!email || specs.length === 0) {
    throw new Error("Uso: tsx scripts/applyGradualProgress.ts <email> <curso>=<N>[+<K>] ...");
  }
  await applyGradualProgress(email, specs);
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
