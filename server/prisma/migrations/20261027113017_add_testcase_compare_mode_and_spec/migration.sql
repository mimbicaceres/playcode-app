-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "compareMode" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "spec" JSONB;
