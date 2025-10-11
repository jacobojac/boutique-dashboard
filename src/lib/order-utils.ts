import { OrderStatus, StatusConfig } from "@/types/order";
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconTruck,
  IconX,
} from "@tabler/icons-react";

// Configuration des statuts avec leurs propriétés d'affichage
export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: "En attente",
    variant: "secondary",
    icon: IconClock,
    color: "text-orange-600",
    description: "La commande est en attente de confirmation",
  },
  CONFIRMED: {
    label: "Payée",
    variant: "default",
    icon: IconCheck,
    color: "text-blue-600",
    description: "La commande a été confirmée",
  },
  PROCESSING: {
    label: "En préparation",
    variant: "secondary",
    icon: IconPackage,
    color: "text-purple-600",
    description: "La commande est en cours de préparation",
  },
  SHIPPED: {
    label: "Expédiée",
    variant: "default",
    icon: IconTruck,
    color: "text-blue-600",
    description: "La commande a été expédiée",
  },
  DELIVERED: {
    label: "Livrée",
    variant: "default",
    icon: IconCheck,
    color: "text-green-600",
    description: "La commande a été livrée",
  },
  CANCELLED: {
    label: "Annulée",
    variant: "destructive",
    icon: IconX,
    color: "text-red-600",
    description: "La commande a été annulée",
  },
};

// Helper pour obtenir la configuration d'un statut
export function getStatusConfig(status: OrderStatus): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
}

// Helper pour vérifier si un statut est valide
export function isValidOrderStatus(status: string): status is OrderStatus {
  return Object.keys(STATUS_CONFIG).includes(status);
}

// Helper pour générer un numéro de commande unique
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Helper pour formater le montant en euros
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)}€`;
}

// Helper pour formater la date de commande
export function formatOrderDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper pour obtenir la couleur du statut pour les statistiques
export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "text-orange-600";
    case "CONFIRMED":
      return "text-blue-600";
    case "PROCESSING":
      return "text-purple-600";
    case "SHIPPED":
      return "text-blue-600";
    case "DELIVERED":
      return "text-green-600";
    case "CANCELLED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

// Ordre de tri des statuts pour l'affichage
export const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
