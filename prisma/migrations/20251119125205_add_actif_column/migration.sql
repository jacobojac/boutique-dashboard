/*
  Warnings:

  - You are about to drop the column `image` on the `collection` table. All the data in the column will be lost.
  - You are about to drop the column `customerAddress` on the `order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'AMOUNT');

-- AlterTable
ALTER TABLE "public"."collection" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "public"."order" DROP COLUMN "customerAddress",
ADD COLUMN     "customerCity" TEXT,
ADD COLUMN     "customerCountry" TEXT,
ADD COLUMN     "customerPostalCode" TEXT,
ADD COLUMN     "customerStreet" TEXT,
ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "discountId" TEXT,
ADD COLUMN     "discountType" TEXT,
ADD COLUMN     "discountValue" DOUBLE PRECISION,
ADD COLUMN     "subtotalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."product" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."discount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minAmount" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_key" ON "public"."discount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "site_config_key_key" ON "public"."site_config"("key");

-- AddForeignKey
ALTER TABLE "public"."order" ADD CONSTRAINT "order_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
