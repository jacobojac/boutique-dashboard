import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import AddOrderForm from "./add-order-form";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/connexion");
  }
  return <AddOrderForm />;
}
