/*
  Warnings:

  - You are about to drop the column `name` on the `Suppliers` table. All the data in the column will be lost.
  - Added the required column `supplierName` to the `Suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Suppliers" DROP COLUMN "name",
ADD COLUMN     "supplierName" TEXT NOT NULL;
