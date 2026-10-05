/*
  Warnings:

  - Made the column `courseId` on table `CourseAssignment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CourseAssignment" ALTER COLUMN "courseId" SET NOT NULL;
