-- 1. Eliminar restricciones e índices viejos
ALTER TABLE "CourseAssignment" DROP CONSTRAINT IF EXISTS "CourseAssignment_courseFkId_fkey";
ALTER TABLE "ExerciseProgress" DROP CONSTRAINT IF EXISTS "ExerciseProgress_courseFkId_fkey";
ALTER TABLE "ExerciseProgress" DROP CONSTRAINT IF EXISTS "ExerciseProgress_unitFkId_fkey";

DROP INDEX IF EXISTS "CourseAssignment_userId_courseId_key";
DROP INDEX IF EXISTS "CourseAssignment_courseId_idx";
DROP INDEX IF EXISTS "ExerciseProgress_courseId_unitId_idx";

-- 2. Eliminar las columnas de slugs de texto originales
ALTER TABLE "CourseAssignment" DROP COLUMN "courseId";
ALTER TABLE "ExerciseProgress" DROP COLUMN "courseId";
ALTER TABLE "ExerciseProgress" DROP COLUMN "unitId";

-- 3. Renombrar las columnas temporales (UUIDs) a su nombre definitivo
ALTER TABLE "CourseAssignment" RENAME COLUMN "courseFkId" TO "courseId";
ALTER TABLE "ExerciseProgress" RENAME COLUMN "courseFkId" TO "courseId";
ALTER TABLE "ExerciseProgress" RENAME COLUMN "unitFkId" TO "unitId";

-- 4. Recrear las FKs apuntando a las columnas renombradas
ALTER TABLE "CourseAssignment" ADD CONSTRAINT "CourseAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExerciseProgress" ADD CONSTRAINT "ExerciseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExerciseProgress" ADD CONSTRAINT "ExerciseProgress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Recrear los índices
CREATE UNIQUE INDEX "CourseAssignment_userId_courseId_key" ON "CourseAssignment"("userId", "courseId");
CREATE INDEX "CourseAssignment_courseId_idx" ON "CourseAssignment"("courseId");
CREATE INDEX "ExerciseProgress_courseId_unitId_idx" ON "ExerciseProgress"("courseId", "unitId");