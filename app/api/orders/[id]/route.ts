import { NextRequest, NextResponse } from 'next/server';
import { nodePrisma as prisma } from '@/lib/prisma/node-client';
import { isValidOrderStatus } from '@/lib/order-utils';

interface OrderItemInput {
  productId: string;
  variantId?: string;
  nom: string;
  prix: number;
  quantite: number;
  taille?: string;
  couleur?: string;
  image?: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerStreet,
      customerPostalCode,
      customerCity,
      customerCountry,
      status,
      notes,
      subtotalAmount,
      discountType,
      discountValue,
      discountAmount,
      totalAmount,
      items
    } = data;

    // Vérifier que le statut est valide s'il est fourni
    if (status && !isValidOrderStatus(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: id },
      include: { items: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Commencer une transaction pour mettre à jour la commande et ses items
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Supprimer les anciens items
      await tx.orderItem.deleteMany({
        where: { orderId: id }
      });

      // Mettre à jour la commande
      await tx.order.update({
        where: { id: id },
        data: {
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          customerStreet: customerStreet || null,
          customerPostalCode: customerPostalCode || null,
          customerCity: customerCity || null,
          customerCountry: customerCountry || null,
          status: status || existingOrder.status,
          notes: notes || null,
          subtotalAmount: subtotalAmount || existingOrder.subtotalAmount,
          discountType: discountType || null,
          discountValue: discountValue || null,
          discountAmount: discountAmount || null,
          totalAmount: totalAmount || existingOrder.totalAmount,
          updatedAt: new Date(),
        },
      });

      // Créer les nouveaux items s'ils sont fournis
      if (items && items.length > 0) {
        await tx.orderItem.createMany({
          data: items.map((item: OrderItemInput) => ({
            orderId: id,
            productId: item.productId,
            variantId: item.variantId || null,
            nom: item.nom,
            prix: item.prix,
            quantite: item.quantite,
            taille: item.taille || null,
            couleur: item.couleur || null,
            image: item.image || null,
          }))
        });
      }

      // Retourner la commande mise à jour avec ses items
      return await tx.order.findUnique({
        where: { id: id },
        include: { items: true }
      });
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Vérifier que la commande existe et récupérer ses articles
    const existingOrder = await prisma.order.findUnique({
      where: { id: id },
      include: { items: true } // Inclure les articles pour restaurer les stocks
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }


    // Utiliser une transaction pour supprimer la commande et restaurer les stocks
    await prisma.$transaction(async (tx) => {
      // Restaurer les stocks seulement si la commande n'était pas déjà annulée
      if (existingOrder.status !== 'CANCELLED') {

        // Parcourir chaque article de la commande pour restaurer les quantités
        for (const item of existingOrder.items) {
          try {
            if (item.variantId) {
              // Restaurer le stock de la variante
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  quantity: {
                    increment: item.quantite, // Ajouter la quantité commandée
                  },
                },
              });
            } else {
              // Restaurer le stock du produit principal
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  quantity: {
                    increment: item.quantite, // Ajouter la quantité commandée
                  },
                },
              });
            }
          } catch (stockError) {
            console.warn('Erreur lors de la restauration du stock pour l\'article:', item.id, stockError);
            // Continuer même si la restauration de stock échoue
          }
        }
      }

      // Supprimer la commande (les items seront supprimés automatiquement grâce à onDelete: Cascade)
      await tx.order.delete({
        where: { id: id }
      });

    });

    return NextResponse.json({
      success: true,
      message: 'Commande supprimée avec succès',
      orderId: id
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);

    // Gestion spécifique des erreurs Prisma
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: 'Commande déjà supprimée ou inexistante' },
          { status: 404 }
        );
      }

      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Impossible de supprimer la commande car elle est liée à d\'autres données' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}