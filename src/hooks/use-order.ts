import { CartItem } from "@/store/cart-store";
import { useState } from "react";

interface CreateOrderData {
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerStreet?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerCountry?: string;
  deliveryMethod?: string;
  totalAmount: number;
  notes?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    nom: string;
    prix: number;
    quantite: number;
    taille?: string;
    couleur?: string;
    image?: string;
  }>;
}

interface OrderResponse {
  message: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: Array<{
      id: string;
      nom: string;
      prix: number;
      quantite: number;
      taille?: string;
      couleur?: string;
      image?: string;
    }>;
  };
}

export const useOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (
    orderNumber: string,
    cartItems: CartItem[],
    totalAmount: number,
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      street?: string;
      postalCode?: string;
      city?: string;
      country?: string;
      deliveryMethod?: string;
    }
  ): Promise<OrderResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const orderData: CreateOrderData = {
        orderNumber,
        customerName: customerInfo?.name,
        customerEmail: customerInfo?.email,
        customerPhone: customerInfo?.phone,
        customerStreet: customerInfo?.street,
        customerPostalCode: customerInfo?.postalCode,
        customerCity: customerInfo?.city,
        customerCountry: customerInfo?.country,
        deliveryMethod: customerInfo?.deliveryMethod,
        totalAmount,
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          nom: item.nom,
          prix: item.prix,
          quantite: item.quantite,
          taille: item.taille,
          couleur: item.couleur,
          image: item.image,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Commande existe déjà, pas vraiment une erreur
          return data;
        }
        throw new Error(
          data.error || "Erreur lors de la création de la commande"
        );
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur createOrder:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrder = async (orderNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Commande non trouvée
        }
        throw new Error("Erreur lors de la récupération de la commande");
      }

      const order = await response.json();
      return order;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur getOrder:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderNumber: string, status: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      const data = await response.json();
      return data.order;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur updateOrderStatus:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrder,
    getOrder,
    updateOrderStatus,
    isLoading,
    error,
  };
};
