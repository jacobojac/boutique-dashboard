import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findFirst({
      where: {
        slug: slug,
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


    if (!product) {
      return NextResponse.json(
        {
          error: "Produit non trouvé",
          slug: slug,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du produit",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const { slug } = await params;

    // Vérifier que le produit existe avant de le supprimer
    // L'ID peut être soit un nombre (converti en string) soit une string UUID
    const productId = slug;

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Produit non trouvé",
          slug: slug,
        },
        { status: 404 }
      );
    }

    // Supprimer le produit (Prisma se chargera des relations en cascade)
    await prisma.product.delete({
      where: {
        id: existingProduct.id,
      },
    });


    return NextResponse.json(
      {
        message: "Produit supprimé avec succès",
        productId: existingProduct.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression du produit",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
