import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany({
      orderBy: {
        section: "asc",
      },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching site configs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des configurations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type, section, description } = body;

    if (!key || !value || !type || !section) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const config = await prisma.siteConfig.upsert({
      where: { key },
      update: {
        value,
        type,
        section,
        description,
      },
      create: {
        key,
        value,
        type,
        section,
        description,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error creating/updating site config:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
