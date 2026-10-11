-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('fill_variable', 'code_runner');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "hint" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'python',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "rewardXp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "starterCode" TEXT,
ADD COLUMN     "type" "ExerciseType" NOT NULL DEFAULT 'fill_variable';

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "input" TEXT,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestCase_exerciseId_idx" ON "TestCase"("exerciseId");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
