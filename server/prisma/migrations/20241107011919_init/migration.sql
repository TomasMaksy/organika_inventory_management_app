-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_productId_fkey";

-- AlterTable
ALTER TABLE "Blocks" ALTER COLUMN "processed" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
