import React from "react";

export type OrderStatus =
  | 'PENDING'     // En attente
  | 'CONFIRMED'   // Confirmée
  | 'PROCESSING'  // En cours de préparation
  | 'SHIPPED'     // Expédiée
  | 'DELIVERED'   // Livrée
  | 'CANCELLED';  // Annulée

export type DiscountType =
  | 'PERCENTAGE'  // Pourcentage
  | 'AMOUNT';     // Montant fixe

export interface Discount {
  id: string;
  code: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  nom: string;
  prix: number;
  quantite: number;
  taille?: string | null;
  couleur?: string | null;
  image?: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerStreet?: string | null;
  customerPostalCode?: string | null;
  customerCity?: string | null;
  customerCountry?: string | null;
  status: OrderStatus;
  subtotalAmount: number;      // Montant avant réduction
  discountType?: string | null; // "percentage" ou "amount"
  discountValue?: number | null; // Valeur de la réduction
  discountId?: string | null;   // Référence au discount appliqué (optionnel)
  discount?: Discount | null;   // Relation vers le discount
  discountAmount?: number | null; // Montant de la réduction calculée
  totalAmount: number;         // Montant final après réduction
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

// Type pour la création d'une nouvelle commande
export interface CreateOrderData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerStreet?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerCountry?: string;
  subtotalAmount: number;
  discountType?: string;
  discountValue?: number;
  discountId?: string;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  productId: string;
  variantId?: string;
  nom: string;
  prix: number;
  quantite: number;
  taille?: string;
  couleur?: string;
  image?: string;
}

// Type pour la mise à jour d'une commande
export interface UpdateOrderData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerStreet?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerCountry?: string;
  status?: OrderStatus;
  subtotalAmount?: number;
  discountType?: string;
  discountValue?: number;
  discountId?: string;
  discountAmount?: number;
  totalAmount?: number;
  notes?: string;
}

// Type pour la création d'un nouveau discount
export interface CreateDiscountData {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minAmount?: number;
  maxUses?: number;
  isActive?: boolean;
  startsAt?: Date;
  expiresAt?: Date;
}

// Type pour la mise à jour d'un discount
export interface UpdateDiscountData {
  code?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  minAmount?: number;
  maxUses?: number;
  isActive?: boolean;
  startsAt?: Date;
  expiresAt?: Date;
}

// Type pour les statistiques des commandes
export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

// Type pour la réponse API des commandes avec pagination
export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Type pour les filtres de recherche des commandes
export interface OrderFilters {
  status?: OrderStatus[];
  customerName?: string;
  customerEmail?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

// Configuration du statut pour l'affichage UI
export interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ComponentType<{ className?: string }>; // Type pour les icônes Tabler
  color: string;
  description: string;
}