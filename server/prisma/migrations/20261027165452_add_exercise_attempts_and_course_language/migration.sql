-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'python';

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "unitId" TEXT,
    "courseId" TEXT,
    "success" BOOLEAN NOT NULL,
    "durationSec" INTEGER,
    "lines" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_createdAt_idx" ON "ExerciseAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_courseId_unitId_idx" ON "ExerciseAttempt"("courseId", "unitId");

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
