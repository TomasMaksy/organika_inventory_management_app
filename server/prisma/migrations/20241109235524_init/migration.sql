/*
  Warnings:

  - You are about to drop the column `color` on the `BlockTypes` table. All the data in the column will be lost.
  - You are about to drop the column `flammable` on the `BlockTypes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BlockTypes" DROP COLUMN "color",
DROP COLUMN "flammable";
