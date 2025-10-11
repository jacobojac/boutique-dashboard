import { CollectionsTable } from "@/components/dashboard/collections-table";
import { CollectionsTableSkeleton } from "@/components/dashboard/collections-table-skeleton";
import { getSession } from "@/lib/auth-server";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { Collection } from "@/types/product";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getCollections(): Promise<Collection[]> {
  try {
    const collections = await prisma.collection.findMany();
    return collections;
  } catch (error) {
    console.error("Erreur lors de la récupération des collections:", error);
    throw new Error("Impossible de charger les collections");
  }
}

export default async function PageWithSuspense() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion");
  }

  return (
    <>
      <SiteHeader
        title="Collections"
        buttonText="Ajouter une collection"
        buttonUrl="/collections/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Suspense fallback={<CollectionsTableSkeleton />}>
                <CollectionsTableAsync />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

async function CollectionsTableAsync() {
  const collections = await getCollections();
  return <CollectionsTable data={collections} />;
}
