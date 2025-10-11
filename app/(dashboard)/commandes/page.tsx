import { CollectionsTableSkeleton } from "@/components/dashboard/collections-table-skeleton";
import { OrdersDashboard } from "@/components/dashboard/orders-dashboard";
import { getSession } from "@/lib/auth-server";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { Order } from "@/types/order";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    throw new Error("Impossible de charger les commandes");
  }
}

export default async function PageWithSuspense() {
  // Récupération de la session avec validation côté serveur
  const session = await getSession();
  if (!session) {
    redirect("/connexion");
  }
  return (
    <>
      <SiteHeader
        title="Commandes"
        buttonText="Ajouter une commande"
        buttonUrl="/commandes/ajouter"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <Suspense fallback={<CollectionsTableSkeleton />}>
                <OrdersTableAsync />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

async function OrdersTableAsync() {
  const orders = await getOrders();
  return <OrdersDashboard initialOrders={orders} />;
}
