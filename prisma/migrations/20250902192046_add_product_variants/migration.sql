-- CreateTable
CREATE TABLE "public"."product_variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "taille" TEXT,
    "couleur" TEXT,
    "prix" DOUBLE PRECISION,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_productId_taille_couleur_key" ON "public"."product_variant"("productId", "taille", "couleur");

-- AddForeignKey
ALTER TABLE "public"."product_variant" ADD CONSTRAINT "product_variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
