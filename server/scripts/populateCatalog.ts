// server/scripts/populateCatalog.ts
import { PrismaClient } from '@prisma/client';
import { CODIX_CATALOG } from '../src/lib/codixCatalog';

/**
 * Populate Course and Unit tables from the static catalog.
 * Uses upsert so the script can be run repeatedly without creating duplicates.
 */
async function main() {
  const prisma = new PrismaClient();
  try {
    for (const catalogCourse of CODIX_CATALOG) {
      // Upsert Course (slug = catalogCourse.id)
      const course = await prisma.course.upsert({
        where: { slug: catalogCourse.id },
        update: {
          title: catalogCourse.title,
          description: catalogCourse.description,
        },
        create: {
          slug: catalogCourse.id,
          title: catalogCourse.title,
          description: catalogCourse.description,
        },
      });

      // Upsert each Unit belonging to the course
      for (const catalogUnit of catalogCourse.units) {
        await prisma.unit.upsert({
          where: { slug: catalogUnit.id },
          update: {
            title: catalogUnit.title,
            courseId: course.id,
          },
          create: {
            slug: catalogUnit.id,
            title: catalogUnit.title,
            courseId: course.id,
          },
        });
      }
    }
    console.log('✅ Catalog populated successfully');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Error populating catalog:', e);
  process.exit(1);
});
