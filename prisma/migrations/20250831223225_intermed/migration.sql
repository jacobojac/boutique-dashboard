/*
  Warnings:

  - You are about to drop the column `collections` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `titre` on the `product` table. All the data in the column will be lost.
  - Added the required column `nom` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."product" DROP COLUMN "collections",
DROP COLUMN "titre",
ADD COLUMN     "nom" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."collection" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "image" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_collection" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "product_collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_slug_key" ON "public"."collection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_collection_productId_collectionId_key" ON "public"."product_collection"("productId", "collectionId");

-- AddForeignKey
ALTER TABLE "public"."product_collection" ADD CONSTRAINT "product_collection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_collection" ADD CONSTRAINT "product_collection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
