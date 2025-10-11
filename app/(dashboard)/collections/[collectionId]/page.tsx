import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nodePrisma as prisma } from "@/lib/prisma/node-client";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { EditCollectionForm } from "./edit-collection-form";

export default async function Page(props: {
  params: Promise<{ collectionId: string }>;
}) {
  const params = await props.params;

  const collection = await prisma.collection.findUnique({
    where: {
      id: params.collectionId,
    },
  });

  if (!collection) {
    return (
      <>
        <SiteHeader title="Produit introuvable" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <p>Collection introuvable</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Ajouter un produit" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EditCollectionForm collection={collection} />
                </div>
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tous les collections</CardTitle>
                    </CardHeader>
                    <CardContent></CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
