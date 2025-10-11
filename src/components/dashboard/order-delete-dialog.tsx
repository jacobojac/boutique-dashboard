"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/order-utils";
import { Order } from "@/types/order";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderDeleted?: (orderId: string) => void;
}

export function OrderDeleteDialog({
  isOpen,
  onClose,
  order,
  onOrderDeleted,
}: OrderDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteOrder = async () => {
    if (!order) return;

    setIsLoading(true);

    try {

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erreur de l'API:", errorData);
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      await response.json();

      toast.success("Commande supprimée avec succès", {
        position: "top-center",
      });

      if (onOrderDeleted) {
        onOrderDeleted(order.id);
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression de la commande";
      console.error("Error deleting order:", error);

      toast.error(errorMessage, {
        position: "top-center",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
              <IconAlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div>Supprimer la commande</div>
              <div className="text-sm font-normal text-gray-500 mt-1">
                Cette action est irréversible
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-800">
              <IconTrash className="h-4 w-4" />
              <span className="font-medium">Commande à supprimer</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro :</span>
                <span className="font-medium">#{order.orderNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Client :</span>
                <span className="font-medium">
                  {order.customerName || "Client anonyme"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Articles :</span>
                <span className="font-medium">
                  {order.items.length} article
                  {order.items.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total :</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Date :</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <IconAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">Attention :</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Cette commande sera définitivement supprimée</li>
                  <li>Tous les articles associés seront supprimés</li>
                  <li>Cette action ne peut pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteOrder}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Suppression...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <IconTrash className="h-4 w-4" />
                Supprimer définitivement
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
