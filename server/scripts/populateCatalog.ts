// Carga las filas Course/Unit del catalogo CODIX. Ya forma parte de `npm run db:seed`;
// este script queda para correrlo por separado (ver prisma/seeds/catalog.ts).
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedCatalog } from "../prisma/seeds/catalog";

seedCatalog()
  .catch((e) => {
    console.error("Error populating catalog:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
