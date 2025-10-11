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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = productSchema.parse(body);

    // Récupérer les collections par nom pour obtenir leurs IDs
    const collections = await prisma.collection.findMany({
      where: {
        nom: {
          in: validatedData.collections,
        },
      },
    });

    const newProduct = await prisma.product.create({
      data: {
        nom: validatedData.nom,
        slug: createSlug(validatedData.nom),
        description: validatedData.description,
        prix: validatedData.prix,
        prixReduit: validatedData.prixReduit,
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
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      {
        error: "Erreur lors de la création du produit",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
