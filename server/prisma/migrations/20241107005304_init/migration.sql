/*
  Warnings:

  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `userId` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'password',
DROP COLUMN "userId",
ADD COLUMN     "userId" SERIAL NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("userId");

-- CreateTable
CREATE TABLE "BlockTypes" (
    "blockTypeId" SERIAL NOT NULL,
    "blockName" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "density" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "flammable" BOOLEAN NOT NULL,

    CONSTRAINT "BlockTypes_pkey" PRIMARY KEY ("blockTypeId")
);

-- CreateTable
CREATE TABLE "Blocks" (
    "blockId" BIGSERIAL NOT NULL,
    "blockTypeId" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "lenght" INTEGER NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL,

    CONSTRAINT "Blocks_pkey" PRIMARY KEY ("blockId")
);

-- AddForeignKey
ALTER TABLE "Blocks" ADD CONSTRAINT "Blocks_blockTypeId_fkey" FOREIGN KEY ("blockTypeId") REFERENCES "BlockTypes"("blockTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
