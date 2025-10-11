import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, collectionId } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "ProductIds requis et doit être un tableau non vide" },
        { status: 400 }
      );
    }

    if (!collectionId) {
      return NextResponse.json(
        { error: "CollectionId requis" },
        { status: 400 }
      );
    }

    // Vérifier que la collection existe
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection non trouvée" },
        { status: 404 }
      );
    }

    // Pour chaque produit, ajouter la collection s'il ne l'a pas déjà
    const results = await Promise.all(
      productIds.map(async (productId) => {
        try {
          // Vérifier si la relation existe déjà
          const existingRelation = await prisma.productCollection.findUnique({
            where: {
              productId_collectionId: {
                productId: productId,
                collectionId: collectionId,
              },
            },
          });

          // Si la relation n'existe pas, la créer
          if (!existingRelation) {
            await prisma.productCollection.create({
              data: {
                productId: productId,
                collectionId: collectionId,
              },
            });
            return { productId, success: true, action: "created" };
          } else {
            return { productId, success: true, action: "already_exists" };
          }
        } catch (error) {
          console.error(`Erreur pour le produit ${productId}:`, error);
          return { productId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const created = successful.filter((r) => r.action === "created");
    const alreadyExists = successful.filter(
      (r) => r.action === "already_exists"
    );

    return NextResponse.json({
      message: `Collection ajoutée avec succès`,
      summary: {
        total: productIds.length,
        created: created.length,
        alreadyExists: alreadyExists.length,
        failed: failed.length,
      },
      details: results,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de collection en lot:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
