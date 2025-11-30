import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { createSlug } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const collectionSchema = z.object({
  nom: z.string().min(3, {
    message: "Précisez un titre",
  }),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedData = collectionSchema.parse(body);

    let slug = createSlug(validatedData.nom);

    // Vérifier si le slug existe déjà et générer un slug unique si nécessaire
    const existingCollection = await prisma.collection.findUnique({
      where: { slug },
    });

    if (existingCollection) {
      // Ajouter un suffixe numérique pour rendre le slug unique
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      while (await prisma.collection.findUnique({ where: { slug: newSlug } })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      slug = newSlug;
    }

    const newCollection = await prisma.collection.create({
      data: {
        nom: validatedData.nom,
        slug: slug,
        description: validatedData.description,
      },
    });

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection - Full error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack available"
    );
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la collection",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const collections = await prisma.collection.findMany();
    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recharche des collections" },
      { status: 500 }
    );
  }
}
