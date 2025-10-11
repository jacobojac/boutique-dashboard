import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import type { Prisma } from "@/lib/generated/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const discount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Réduction non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(discount, { status: 200 });
  } catch (error) {
    console.error("Error fetching discount:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la réduction",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

const updateDiscountSchema = z.object({
  code: z.string().min(3, "Le code doit contenir au moins 3 caractères").optional(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "AMOUNT"] as const).optional(),
  value: z.string().transform((val) => val === "" ? undefined : parseFloat(val)).pipe(z.number().min(0, "La valeur doit être positive").optional()),
  minAmount: z.string().transform((val) => val === "" ? undefined : parseFloat(val)).pipe(z.number().min(0, "Le montant minimum doit être positif").optional()),
  maxUses: z.string().transform((val) => val === "" ? undefined : parseInt(val)).pipe(z.number().int().min(1, "Le nombre d'utilisations doit être au moins 1").optional()),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional().or(z.date().optional()),
  expiresAt: z.string().datetime().optional().or(z.date().optional()),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Convertir les dates string en objets Date si nécessaire
    if (body.startsAt && typeof body.startsAt === 'string') {
      body.startsAt = new Date(body.startsAt);
    }
    if (body.expiresAt && typeof body.expiresAt === 'string') {
      body.expiresAt = new Date(body.expiresAt);
    }

    const validatedData = updateDiscountSchema.parse(body);

    // Vérifier si la réduction existe
    const existingDiscount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Réduction non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier l'unicité du code si modifié
    if (validatedData.code && validatedData.code !== existingDiscount.code) {
      const codeExists = await prisma.discount.findFirst({
        where: {
          code: validatedData.code,
          id: { not: id },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Ce code de réduction existe déjà" },
          { status: 400 }
        );
      }
    }

    // Préparer les données pour la mise à jour
    const updateData: Prisma.DiscountUpdateInput = {};

    if (validatedData.code !== undefined) updateData.code = validatedData.code;
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.value !== undefined) updateData.value = validatedData.value;
    if (validatedData.minAmount !== undefined) updateData.minAmount = validatedData.minAmount || null;
    if (validatedData.maxUses !== undefined) updateData.maxUses = validatedData.maxUses || null;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.startsAt !== undefined) updateData.startsAt = validatedData.startsAt || null;
    if (validatedData.expiresAt !== undefined) updateData.expiresAt = validatedData.expiresAt || null;

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedDiscount, { status: 200 });
  } catch (error) {
    console.error("Error updating discount:", error);

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
        error: "Erreur lors de la mise à jour de la réduction",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Vérifier si la réduction existe
    const existingDiscount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Réduction non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la réduction
    await prisma.discount.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Réduction supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting discount:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la suppression de la réduction",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}