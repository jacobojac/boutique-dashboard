import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { createSlug } from "@/lib/utils";
import { Collection } from "@/types/product";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const variantSchema = z.object({
  taille: z.string().optional(),
  couleur: z.string().optional(),
  couleurHex: z.string().optional(),
  prix: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  quantity: z.string().transform((val) => parseInt(val) || 0),
  sku: z.string().optional(),
});

const productSchema = z.object({
  nom: z.string().min(3),
  description: z.string(),
  prix: z.string().transform((val) => parseFloat(val)),
  prixReduit: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  actif: z.boolean(),
  collections: z.array(z.string()),
  images: z.array(z.string()),
  variants: z.array(variantSchema).default([]),
});

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ productId: string }>;
  }
) {
  try {
    const { productId } = await params;
    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Récupérer les collections par nom pour obtenir leurs IDs (comme dans route.ts)
    const collections = await prisma.collection.findMany({
      where: {
        nom: {
          in: validatedData.collections,
        },
      },
    });

    // Supprimer les anciennes relations
    await prisma.productCollection.deleteMany({
      where: { productId },
    });

    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        nom: validatedData.nom,
        slug: createSlug(validatedData.nom),
        description: validatedData.description,
        prix: validatedData.prix,
        prixReduit: validatedData.prixReduit || 0,
        actif: validatedData.actif,
        images: validatedData.images,
        collections: {
          create: collections.map((collection: Collection) => ({
            collection: {
              connect: { id: collection.id },
            },
          })),
        },
        variants: {
          create: validatedData.variants.map((variant) => ({
            taille: variant.taille,
            couleur: variant.couleur,
            couleurHex: variant.couleurHex,
            prix: variant.prix,
            quantity: variant.quantity,
            sku: variant.sku,
          })),
        },
      },
      include: {
        variants: true,
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du produit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ productId: string }>;
  }
) {
  try {
    const { productId } = await params;
    // Supprimer les variantes associées
    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    // Supprimer les relations avec les collections
    await prisma.productCollection.deleteMany({
      where: { productId },
    });
    // Supprimer le produit
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: "Produit supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}
