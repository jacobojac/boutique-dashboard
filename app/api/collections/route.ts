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

    const slug = createSlug(validatedData.nom);
    /* console.log("body:", body);
    console.log("validatedData:", validatedData);
    console.log("slug:", slug);
    return NextResponse.json(
      { message: "Collection received", slug },
      { status: 200 }
    ); */

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
