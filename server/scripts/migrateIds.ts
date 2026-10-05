// server/scripts/migrateIds.ts
import { PrismaClient } from '@prisma/client';

/**
 * Map existing slug strings to real FK UUIDs.
 * Fills the temporary FK columns (courseFkId, unitFkId) added to the schema.
 */
async function main() {
  const prisma = new PrismaClient();
  try {
    // CourseAssignment migration
    const assignments = await prisma.courseAssignment.findMany({
      select: { id: true, courseId: true },
    });
    for (const a of assignments) {
      const course = await prisma.course.findUnique({ where: { slug: a.courseId } });
      if (course) {
        await prisma.courseAssignment.update({
          where: { id: a.id },
          data: { courseFkId: course.id },
        });
      } else {
        console.warn(`⚠️ No Course for slug ${a.courseId} (assignment ${a.id})`);
      }
    }

    // ExerciseProgress migration
    const progresses = await prisma.exerciseProgress.findMany({
      select: { id: true, courseId: true, unitId: true },
    });
    for (const p of progresses) {
      const updates: any = {};
      if (p.courseId) {
        const course = await prisma.course.findUnique({ where: { slug: p.courseId } });
        if (course) updates.courseFkId = course.id;
        else console.warn(`⚠️ No Course for slug ${p.courseId} (progress ${p.id})`);
      }
      if (p.unitId) {
        const unit = await prisma.unit.findUnique({ where: { slug: p.unitId } });
        if (unit) updates.unitFkId = unit.id;
        else console.warn(`⚠️ No Unit for slug ${p.unitId} (progress ${p.id})`);
      }
      if (Object.keys(updates).length > 0) {
        await prisma.exerciseProgress.update({
          where: { id: p.id },
          data: updates,
        });
      }
    }

    console.log('✅ Temporary FK migration completed');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Migration script error:', e);
  process.exit(1);
});
