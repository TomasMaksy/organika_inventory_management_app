/*
  Warnings:

  - A unique constraint covering the columns `[blockName]` on the table `BlockTypes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BlockTypes_blockName_key" ON "BlockTypes"("blockName");
