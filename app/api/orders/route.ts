import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";

interface OrderItemData {
  productId: string;
  variantId?: string;
  nom: string;
  prix: number;
  quantite: number;
  taille?: string;
  couleur?: string;
  image?: string;
}

interface CreateOrderData {
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerStreet?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerCountry?: string;
  subtotalAmount?: number;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  items: OrderItemData[];
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateOrderData = await request.json();

    // Validation des données requises
    if (!data.orderNumber || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "Numéro de commande et articles sont requis" },
        { status: 400 }
      );
    }

    if (!data.totalAmount || data.totalAmount <= 0) {
      return NextResponse.json(
        { error: "Montant total invalide" },
        { status: 400 }
      );
    }

    // Vérifier si la commande existe déjà
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: data.orderNumber },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "Cette commande existe déjà", order: existingOrder },
        { status: 409 }
      );
    }

    // Vérifier la disponibilité des stocks avant de créer la commande
    for (const item of data.items) {
      if (item.variantId) {
        // Vérifier le stock de la variante
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant || variant.quantity < item.quantite) {
          return NextResponse.json(
            { error: `Stock insuffisant pour la variante ${item.nom} (${item.taille}, ${item.couleur})` },
            { status: 400 }
          );
        }
      } else {
        // Vérifier le stock du produit principal
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.quantity || product.quantity < item.quantite) {
          return NextResponse.json(
            { error: `Stock insuffisant pour le produit ${item.nom}` },
            { status: 400 }
          );
        }
      }
    }

    // Utiliser une transaction pour créer la commande et mettre à jour les stocks
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerStreet: data.customerStreet,
          customerPostalCode: data.customerPostalCode,
          customerCity: data.customerCity,
          customerCountry: data.customerCountry,
          subtotalAmount: data.subtotalAmount || data.totalAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
          totalAmount: data.totalAmount,
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              nom: item.nom,
              prix: item.prix,
              quantite: item.quantite,
              taille: item.taille,
              couleur: item.couleur,
              image: item.image,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Diminuer les quantités des produits/variantes
      for (const item of data.items) {
        if (item.variantId) {
          // Diminuer le stock de la variante
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              quantity: {
                decrement: item.quantite,
              },
            },
          });
        } else {
          // Diminuer le stock du produit principal
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantite,
              },
            },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json(
      {
        message: "Commande créée avec succès",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de la commande" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      // Récupérer une commande spécifique
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Commande non trouvée" },
          { status: 404 }
        );
      }

      return NextResponse.json(order);
    } else {
      // Récupérer toutes les commandes (avec pagination)
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip,
          take: limit,
          include: {
            items: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.order.count(),
      ]);

      return NextResponse.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderNumber, status, ...updateData } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Numéro de commande requis" },
        { status: 400 }
      );
    }

    // Vérifier si la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: {
        ...(status && { status }),
        ...updateData,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      message: "Commande mise à jour avec succès",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}