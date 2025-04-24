/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "size" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");
