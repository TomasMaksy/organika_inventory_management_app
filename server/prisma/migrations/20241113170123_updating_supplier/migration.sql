/*
  Warnings:

  - A unique constraint covering the columns `[supplierName]` on the table `Suppliers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_supplierName_key" ON "Suppliers"("supplierName");
