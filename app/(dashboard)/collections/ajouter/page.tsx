import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-server";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { redirect } from "next/navigation";
import { AddCollectionForm } from "./add-collection-form";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion");
  }

  return (
    <>
      <SiteHeader title="Ajouter une collection" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AddCollectionForm />
                </div>
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Toutes les collections</CardTitle>
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
