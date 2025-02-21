/*
  Warnings:

  - You are about to drop the column `courseId` on the `Thread` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Thread` table. All the data in the column will be lost.
  - Added the required column `resourceId` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Thread_courseId_idx";

-- DropIndex
DROP INDEX "Thread_lessonId_idx";

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "courseId",
DROP COLUMN "lessonId",
ADD COLUMN     "resourceId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Thread_resourceId_idx" ON "Thread"("resourceId");
