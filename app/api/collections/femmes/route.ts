import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: {
        collections: {
          some: {
            collection: {
              slug: "femmes",
            },
          },
        },
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de la collection" },
      { status: 500 }
    );
  }
}
