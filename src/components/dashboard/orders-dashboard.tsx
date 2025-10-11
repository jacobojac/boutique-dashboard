"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Order, OrderStatus } from "@/types/order";
import { OrdersTable } from "./orders-table";
import { OrdersStats } from "./orders-stats";

interface OrdersDashboardProps {
  initialOrders: Order[];
}

export function OrdersDashboard({ initialOrders }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Fonction pour mettre à jour le statut d'une commande
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Fonction pour mettre à jour une commande complète
  const handleOrderUpdate = (orderId: string, updatedOrder: Order) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? updatedOrder : order
      )
    );
  };

  // Fonction pour supprimer une commande
  const handleOrderDeleted = (orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  };

  return (
    <>
      {/* Statistiques dynamiques */}
      <OrdersStats orders={orders} />

      {/* Table des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            Gérez toutes les commandes de votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={orders}
            onStatusUpdate={handleStatusUpdate}
            onOrderUpdate={handleOrderUpdate}
            onOrderDeleted={handleOrderDeleted}
          />
        </CardContent>
      </Card>
    </>
  );
}