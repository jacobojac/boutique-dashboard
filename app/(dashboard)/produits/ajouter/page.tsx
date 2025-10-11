import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { AddProductForm } from "./add-product-form";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion");
  }
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      collections: {
        include: {
          collection: true,
        },
      },
    },
  });

  return (
    <>
      <SiteHeader title="Ajouter un produit" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <AddProductForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
