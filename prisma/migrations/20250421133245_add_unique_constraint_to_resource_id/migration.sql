/*
  Warnings:

  - A unique constraint covering the columns `[resourceId]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Thread_resourceId_key" ON "Thread"("resourceId");
