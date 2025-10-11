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

    // Pour chaque produit, supprimer la relation avec la collection si elle existe
    const results = await Promise.all(
      productIds.map(async (productId) => {
        try {
          // Vérifier si la relation existe
          const existingRelation = await prisma.productCollection.findUnique({
            where: {
              productId_collectionId: {
                productId: productId,
                collectionId: collectionId,
              },
            },
          });

          // Si la relation existe, la supprimer
          if (existingRelation) {
            await prisma.productCollection.delete({
              where: {
                productId_collectionId: {
                  productId: productId,
                  collectionId: collectionId,
                },
              },
            });
            return { productId, success: true, action: 'removed' };
          } else {
            return { productId, success: true, action: 'not_found' };
          }
        } catch (error) {
          console.error(`Erreur pour le produit ${productId}:`, error);
          return { 
            productId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
        }
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const removed = successful.filter((r) => r.action === 'removed');
    const notFound = successful.filter((r) => r.action === 'not_found');

    return NextResponse.json({
      message: `Collection retirée avec succès`,
      summary: {
        total: productIds.length,
        removed: removed.length,
        notFound: notFound.length,
        failed: failed.length,
      },
      details: results,
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de collection en lot:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}