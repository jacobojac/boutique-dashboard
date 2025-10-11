"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Order, OrderStatus } from "@/types/order";
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconTruck,
} from "@tabler/icons-react";
import { useMemo } from "react";

interface OrdersStatsProps {
  orders: Order[];
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  // Recalculer les statistiques à chaque changement des commandes
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order: Order) => order.status === "PENDING").length,
      confirmed: orders.filter((order: Order) => order.status === "CONFIRMED").length,
      processing: orders.filter((order: Order) => order.status === "PROCESSING").length,
      shipped: orders.filter((order: Order) => order.status === "SHIPPED").length,
      delivered: orders.filter((order: Order) => order.status === "DELIVERED").length,
      cancelled: orders.filter((order: Order) => order.status === "CANCELLED").length,
      totalRevenue: orders
        .filter((order: Order) => ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status as OrderStatus))
        .reduce((sum: number, order: Order) => sum + order.totalAmount, 0),
    };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total commandes
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <IconPackage className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                En attente
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </p>
            </div>
            <IconClock className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Confirmées
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.confirmed}
              </p>
            </div>
            <IconCheck className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenus
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalRevenue.toFixed(2)}€
              </p>
            </div>
            <IconTruck className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}