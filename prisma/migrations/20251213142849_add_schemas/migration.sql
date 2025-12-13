-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('RUN', 'WEIGHT_TRAINING', 'REST');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ActivityType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "plannedDistanceKm" DOUBLE PRECISION,
    "actualDistanceKm" DOUBLE PRECISION,
    "plannedTimeMin" INTEGER,
    "actualTimeMin" INTEGER,
    "plannedPace" TEXT,
    "actualPace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sets" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workout_date_idx" ON "Workout"("date");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
