-- CreateTable
CREATE TABLE "Institute" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "name" TEXT,
    "address" TEXT,
    "contactEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institute_pkey" PRIMARY KEY ("id")
);
