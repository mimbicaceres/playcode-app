// server/scripts/migrateIds.ts
import { PrismaClient } from '@prisma/client';

/**
 * Map existing slug strings to real FK ids.
 * Fills the temporary FK columns (courseFkId, unitFkId) added by the
 * add_temp_fk_columns migration. Run it after that migration and
 * populateCatalog.ts, and before switch_to_real_fks.
 *
 * Uses raw SQL because the generated client follows the final schema, where
 * the temporary columns no longer exist.
 */
async function main() {
  const prisma = new PrismaClient();
  try {
    const assignments = await prisma.$executeRawUnsafe(`
      UPDATE "CourseAssignment" ca SET "courseFkId" = c."id"
      FROM "Course" c WHERE c."slug" = ca."courseId"`);
    const progressCourses = await prisma.$executeRawUnsafe(`
      UPDATE "ExerciseProgress" ep SET "courseFkId" = c."id"
      FROM "Course" c WHERE c."slug" = ep."courseId"`);
    const progressUnits = await prisma.$executeRawUnsafe(`
      UPDATE "ExerciseProgress" ep SET "unitFkId" = u."id"
      FROM "Unit" u WHERE u."slug" = ep."unitId"`);

    // courseId becomes NOT NULL: assignments to unknown courses cannot be kept.
    const orphans = await prisma.$queryRawUnsafe<{ id: string; courseId: string }[]>(
      `SELECT "id", "courseId" FROM "CourseAssignment" WHERE "courseFkId" IS NULL`,
    );
    for (const o of orphans) {
      console.warn(`⚠️ No Course for slug ${o.courseId} (assignment ${o.id}), deleting it`);
    }
    if (orphans.length > 0) {
      await prisma.$executeRawUnsafe(`DELETE FROM "CourseAssignment" WHERE "courseFkId" IS NULL`);
    }

    console.log(
      `✅ Temporary FK migration completed (assignments: ${assignments}, ` +
        `progress courses: ${progressCourses}, progress units: ${progressUnits})`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Migration script error:', e);
  process.exit(1);
});
