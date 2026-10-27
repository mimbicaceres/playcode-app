import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedUsers } from "../src/prisma/seed";
import { seedPythonCourse } from "./seed-python-course";
import { seedJavascriptCourse } from "./seeds/javascript-course";
import { seedSqlCourse } from "./seeds/sql-course";

// Punto de entrada unico del seed: `npm run db:seed` (o `prisma migrate dev` /
// `prisma migrate reset`, que lo llaman solos). Cada paso es idempotente, asi
// que se puede correr tantas veces como haga falta.
async function main() {
  console.log("== Usuarios ==");
  await seedUsers();
  console.log("== Curso Python - Fundamentos ==");
  await seedPythonCourse();
  console.log("== Curso JavaScript - Fundamentos ==");
  await seedJavascriptCourse();
  console.log("== Curso SQL ==");
  await seedSqlCourse();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
