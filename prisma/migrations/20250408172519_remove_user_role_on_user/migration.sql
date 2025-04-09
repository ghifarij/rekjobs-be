/*
  Warnings:

  - You are about to drop the column `size` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "size",
DROP COLUMN "website",
ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "logo" SET DEFAULT 'https://res.cloudinary.com/dkyco4yqp/image/upload/v1738487804/user-circle-svgrepo-com_az7hcs.png';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "avatar" TEXT DEFAULT 'https://res.cloudinary.com/dkyco4yqp/image/upload/v1738487804/user-circle-svgrepo-com_az7hcs.png',
ADD COLUMN     "googleId" TEXT;

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE UNIQUE INDEX "Company_googleId_key" ON "Company"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
