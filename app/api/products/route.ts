import { NextResponse } from 'next/server';
import { nodePrisma as prisma } from '@/lib/prisma/node-client';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        collections: {
          include: {
            collection: true,
          },
        },
        variants: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}