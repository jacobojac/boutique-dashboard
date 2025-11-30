import { SiteHeader } from "@app/(dashboard)/site-header";
import MenuForm from "./menu-form";

export default function MenuPage() {
  return (
    <>
      <SiteHeader title="Configuration du Menu" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
            <div className="px-4 lg:px-6">
              <MenuForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
