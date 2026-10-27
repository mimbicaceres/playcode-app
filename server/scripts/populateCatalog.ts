// Da de baja los cursos viejos del catalogo CODIX (prog1, py2, java3, js_base,
// css_modern). Ya forma parte de `npm run db:seed`; este script queda para correrlo
// por separado (ver prisma/seeds/catalog.ts).
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { retireLegacyCourses } from "../prisma/seeds/catalog";

retireLegacyCourses()
  .catch((e) => {
    console.error("Error retiring legacy courses:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
