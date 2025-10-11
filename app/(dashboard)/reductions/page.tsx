import { CollectionsTableSkeleton } from "@/components/dashboard/collections-table-skeleton";
import { DiscountsTable } from "@/components/dashboard/discounts-table";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { Discount } from "@/types/order";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getDiscounts(): Promise<Discount[]> {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return discounts;
  } catch (error) {
    console.error("Erreur lors de la récupération des réductions:", error);
    throw new Error("Impossible de charger les réductions");
  }
}

export default function PageWithSuspense() {
  return (
    <>
      <SiteHeader
        title="Réduction"
        buttonText="Créer une réduction"
        buttonUrl="/reductions/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Suspense fallback={<CollectionsTableSkeleton />}></Suspense>
              <DiscountsTableAsync />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

async function DiscountsTableAsync() {
  const discounts = await getDiscounts();
  return <DiscountsTable data={discounts} />;
}
