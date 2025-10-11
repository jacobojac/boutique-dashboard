import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const discountSchema = z.object({
  code: z.string().min(3, "Le code doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "AMOUNT"] as const),
  value: z.string().transform((val) => parseFloat(val)).pipe(z.number().min(0, "La valeur doit être positive")),
  minAmount: z.string().optional().transform((val) => val === "" || !val ? undefined : parseFloat(val)).pipe(z.number().min(0, "Le montant minimum doit être positif").optional()),
  maxUses: z.string().optional().transform((val) => val === "" || !val ? undefined : parseInt(val)).pipe(z.number().int().min(1, "Le nombre d'utilisations doit être au moins 1").optional()),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional().or(z.date().optional()),
  expiresAt: z.string().datetime().optional().or(z.date().optional()),
});

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(discounts, { status: 200 });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réductions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Convertir les dates string en objets Date si nécessaire
    if (body.startsAt && typeof body.startsAt === 'string') {
      body.startsAt = new Date(body.startsAt);
    }
    if (body.expiresAt && typeof body.expiresAt === 'string') {
      body.expiresAt = new Date(body.expiresAt);
    }

    const validatedData = discountSchema.parse(body);

    const newReduction = await prisma.discount.create({
      data: {
        code: validatedData.code,
        description: validatedData.description || null,
        type: validatedData.type,
        value: validatedData.value,
        minAmount: validatedData.minAmount || null,
        maxUses: validatedData.maxUses || null,
        isActive: validatedData.isActive,
        startsAt: validatedData.startsAt || null,
        expiresAt: validatedData.expiresAt || null,
      },
    });

    return NextResponse.json(newReduction, { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.issues.map(e => e.message).join(", ")
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur lors de l'ajout de la réduction",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
