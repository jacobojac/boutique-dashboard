import { isValidOrderStatus } from "@/lib/order-utils";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;

    if (!status) {
      return NextResponse.json(
        { error: "Le statut est requis" },
        { status: 400 }
      );
    }

    // Vérifier que le statut est valide
    if (!isValidOrderStatus(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Récupérer la commande actuelle pour vérifier son statut
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Utiliser une transaction pour mettre à jour le statut et gérer les stocks
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Mettre à jour la commande
      const order = await tx.order.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          items: true,
        },
      });

      // Gestion des stocks selon les changements de statut
      if (status === "CANCELLED" && currentOrder.status !== "CANCELLED") {
        // Si la commande passe au statut CANCELLED et qu'elle n'était pas déjà annulée,
        // remettre les quantités en stock
        for (const item of currentOrder.items) {
          try {
            if (item.variantId) {
              // Remettre le stock de la variante
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  quantity: {
                    increment: item.quantite,
                  },
                },
              });
            } else {
              // Remettre le stock du produit principal
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  quantity: {
                    increment: item.quantite,
                  },
                },
              });
            }
          } catch (stockError) {
            console.warn('Erreur lors de la restauration du stock pour l\'article:', item.id, stockError);
            // Continuer même si la restauration de stock échoue
          }
        }
      } else if (currentOrder.status === "CANCELLED" && status !== "CANCELLED") {
        // Si la commande passe de CANCELLED à un autre statut,
        // retirer les quantités du stock
        for (const item of currentOrder.items) {
          try {
            if (item.variantId) {
              // Retirer le stock de la variante
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  quantity: {
                    decrement: item.quantite,
                  },
                },
              });
            } else {
              // Retirer le stock du produit principal
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  quantity: {
                    decrement: item.quantite,
                  },
                },
              });
            }
          } catch (stockError) {
            console.warn('Erreur lors du retrait du stock pour l\'article:', item.id, stockError);
            // Continuer même si le retrait de stock échoue
          }
        }
      }

      return order;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de la commande:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
