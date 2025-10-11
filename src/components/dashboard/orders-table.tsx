"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, getStatusConfig, STATUS_CONFIG } from "@/lib/order-utils";
import { Order, OrderStatus } from "@/types/order";
import {
  IconEdit,
  IconFilter,
  IconPackage,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { ClientDate } from "./client-date";
import { OrderDeleteDialog } from "./order-delete-dialog";
import { OrderEditSheet } from "./order-edit-sheet";
import { OrderStatusDialog } from "./order-status-dialog";

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void;
  onOrderUpdate?: (orderId: string, updatedOrder: Order) => void;
  onOrderDeleted?: (orderId: string) => void;
}

export function OrdersTable({
  orders,
  onStatusUpdate,
  onOrderUpdate,
  onOrderDeleted
}: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const handleStatusClick = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsStatusDialogOpen(true);
  }, []);

  const handleStatusUpdate = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      if (onStatusUpdate) {
        onStatusUpdate(orderId, newStatus);
      }
    },
    [onStatusUpdate]
  );

  const handleEditClick = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsEditSheetOpen(true);
  }, []);

  const handleOrderUpdate = useCallback(
    (orderId: string, updatedOrder: Order) => {
      if (onOrderUpdate) {
        onOrderUpdate(orderId, updatedOrder);
      }
    },
    [onOrderUpdate]
  );

  const handleDeleteClick = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleOrderDeleted = useCallback((orderId: string) => {
    if (onOrderDeleted) {
      onOrderDeleted(orderId);
    }
  }, [onOrderDeleted]);

  // Filtrage des données
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(0);
    },
    []
  );

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(0);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-card border rounded-lg mb-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:flex-1 sm:items-center sm:space-x-2 sm:space-y-0">
          <div className="flex items-center gap-2">
            <IconFilter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtres:
            </span>
          </div>

          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par client, numéro..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 w-full sm:max-w-sm"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                <IconX className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium hidden sm:block">
              Statut:
            </span>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredOrders.length} sur {orders.length} commande(s)
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white dark:bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">N° Commande</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="font-semibold">Articles</TableHead>
              <TableHead className="font-semibold">Réduction</TableHead>
              <TableHead className="font-semibold">Montant total</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <IconPackage className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm || statusFilter !== "all"
                        ? "Aucune commande ne correspond aux filtres"
                        : "Aucune commande trouvée"}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {searchTerm || statusFilter !== "all"
                        ? "Essayez de modifier vos critères de recherche"
                        : "Les commandes apparaîtront ici une fois créées"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-medium">#{order.orderNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {order.customerName || "Client anonyme"}
                        </div>
                        {order.customerEmail && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customerEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => handleStatusClick(order)}
                      >
                        <Badge
                          variant={statusConfig.variant}
                          className="cursor-pointer"
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {order.items.length} article
                        {order.items.length > 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.discountAmount && order.discountAmount > 0 ? (
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            -{formatPrice(order.discountAmount)}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.discountType === "percentage"
                              ? `${order.discountValue}%`
                              : `${formatPrice(order.discountValue || 0)}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ClientDate
                        date={order.createdAt}
                        className="text-sm text-muted-foreground"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          className="cursor-pointer"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(order)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(order)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredOrders.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage + 1} sur {totalPages} ({filteredOrders.length}{" "}
              résultat(s))
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <>
          <OrderStatusDialog
            isOpen={isStatusDialogOpen}
            onClose={() => {
              setIsStatusDialogOpen(false);
              setSelectedOrder(null);
            }}
            orderId={selectedOrder.id}
            currentStatus={selectedOrder.status}
            orderNumber={selectedOrder.orderNumber}
            onStatusUpdate={handleStatusUpdate}
          />

          <OrderEditSheet
            isOpen={isEditSheetOpen}
            onClose={() => {
              setIsEditSheetOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            onOrderUpdate={handleOrderUpdate}
          />

          <OrderDeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            onOrderDeleted={handleOrderDeleted}
          />
        </>
      )}
    </>
  );
}
