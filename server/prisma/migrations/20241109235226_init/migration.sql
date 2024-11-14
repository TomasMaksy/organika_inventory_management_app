/*
  Warnings:

  - You are about to drop the column `supplier` on the `BlockTypes` table. All the data in the column will be lost.
  - Added the required column `supplierId` to the `Blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlockTypes" DROP COLUMN "supplier";

-- AlterTable
ALTER TABLE "Blocks" ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Suppliers" (
    "supplierId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("supplierId")
);

-- AddForeignKey
ALTER TABLE "Blocks" ADD CONSTRAINT "Blocks_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Suppliers"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;
