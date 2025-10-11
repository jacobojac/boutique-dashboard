/*
  Warnings:

  - Added the required column `slug` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."collection" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."product" ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
