"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Discount } from "@/types/order";
import {
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DiscountEditSheet } from "./discount-edit-sheet";

interface DiscountsTableProps {
  data: Discount[];
}

export function DiscountsTable({ data }: DiscountsTableProps) {
  const discounts = data;
  console.log("discounts:", discounts);
  const [selectedDiscounts, setSelectedDiscounts] = React.useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 10;

  // États pour les dialogues
  const [isDeleteDiscountDialogOpen, setIsDeleteDiscountDialogOpen] =
    React.useState(false);
  const [discountToDelete, setDiscountToDelete] =
    React.useState<Discount | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
  const [discountToEdit, setDiscountToEdit] = React.useState<Discount | null>(
    null
  );

  // États pour les actions
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filtrage des données
  const filteredDiscounts = React.useMemo(() => {
    let filtered = discounts;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (discount) =>
          discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (discount.description &&
            discount.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter((discount) => {
        if (statusFilter === "active") return discount.isActive;
        if (statusFilter === "inactive") return !discount.isActive;
        return true;
      });
    }

    // Filtre par type
    if (typeFilter) {
      filtered = filtered.filter((discount) => discount.type === typeFilter);
    }

    return filtered;
  }, [discounts, searchTerm, statusFilter, typeFilter]);

  // Pagination
  const paginatedDiscounts = React.useMemo(() => {
    const start = currentPage * pageSize;
    return filteredDiscounts.slice(start, start + pageSize);
  }, [filteredDiscounts, currentPage]);

  const totalPages = Math.ceil(filteredDiscounts.length / pageSize);

  // Hooks
  const router = useRouter();

  // Handlers
  const handleDelete = React.useCallback((discount: Discount) => {
    setDiscountToDelete(discount);
    setIsDeleteDiscountDialogOpen(true);
  }, []);

  const handleEdit = React.useCallback((discount: Discount) => {
    setDiscountToEdit(discount);
    setIsEditSheetOpen(true);
  }, []);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(0);
    },
    []
  );

  const handleStatusFilterChange = React.useCallback((value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setCurrentPage(0);
  }, []);

  const handleTypeFilterChange = React.useCallback((value: string) => {
    setTypeFilter(value === "all" ? "" : value);
    setCurrentPage(0);
  }, []);

  const clearSearch = React.useCallback(() => {
    setSearchTerm("");
    setCurrentPage(0);
  }, []);

  const nextPage = React.useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = React.useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Gestion de la sélection
  const toggleDiscountSelection = React.useCallback((discountId: string) => {
    setSelectedDiscounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(discountId)) {
        newSet.delete(discountId);
      } else {
        newSet.add(discountId);
      }
      return newSet;
    });
  }, []);

  const toggleAllSelection = React.useCallback(() => {
    if (selectedDiscounts.size === paginatedDiscounts.length) {
      setSelectedDiscounts(new Set());
    } else {
      setSelectedDiscounts(new Set(paginatedDiscounts.map((d) => d.id)));
    }
  }, [selectedDiscounts.size, paginatedDiscounts]);

  // Actions
  const confirmDeleteDiscount = React.useCallback(async () => {
    if (!discountToDelete?.id) {
      toast.error("Erreur: ID de réduction manquant");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/discounts/${encodeURIComponent(discountToDelete.id)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Réduction supprimée avec succès", {
          duration: 4000,
          position: "top-center",
        });
        setIsDeleteDiscountDialogOpen(false);
        setDiscountToDelete(null);
        router.refresh();
      } else {
        let errorMessage = "Erreur lors de la suppression de la réduction";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore parsing error
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Erreur de suppression de la réduction:", error);
      toast.error("Erreur de connexion lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  }, [discountToDelete, router]);

  const cancelDeleteDiscount = React.useCallback(() => {
    setIsDeleteDiscountDialogOpen(false);
    setDiscountToDelete(null);
  }, []);

  const copyDiscountCode = React.useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié dans le presse-papiers", {
      position: "top-center",
    });
  }, []);

  const handleDiscountUpdate = React.useCallback(() => {
    // Rafraîchir la page pour récupérer les données mises à jour
    router.refresh();
    setIsEditSheetOpen(false);
    setDiscountToEdit(null);
  }, [router]);

  const formatValue = (type: string, value?: number | null) => {
    if (!value && value !== 0) return "N/A";
    if (type === "PERCENTAGE") {
      return `${value}%`;
    }
    return `${value.toFixed(2)} €`;
  };

  const formatMinAmount = (minAmount?: number | null) => {
    if (!minAmount || minAmount === 0) return null;
    return `Min: ${minAmount.toFixed(2)} €`;
  };

  const isExpired = (expiresAt?: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isNotStarted = (startsAt?: Date | null) => {
    if (!startsAt) return false;
    return new Date(startsAt) > new Date();
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:flex-1 sm:items-center sm:space-x-2 sm:space-y-0">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des réductions..."
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

          {/* Filtre par statut */}
          <div className="flex items-center space-x-2">
            <Select
              value={statusFilter || "all"}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par type */}
          <div className="flex items-center space-x-2">
            <Select
              value={typeFilter || "all"}
              onValueChange={handleTypeFilterChange}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                <SelectItem value="AMOUNT">Montant fixe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedDiscounts.size} sur {filteredDiscounts.length} réduction(s)
        sélectionné(s)
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white dark:bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={
                      selectedDiscounts.size === paginatedDiscounts.length &&
                      paginatedDiscounts.length > 0
                    }
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all"
                  />
                </div>
              </TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Utilisations</TableHead>
              <TableHead>Commence le</TableHead>
              <TableHead>Expire le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-muted-foreground text-4xl">🎟️</span>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter || typeFilter
                        ? "Aucune réduction ne correspond aux filtres"
                        : "Aucune réduction trouvée"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDiscounts.map((discount) => {
                const expired = isExpired(discount.expiresAt);
                const notStarted = isNotStarted(discount.startsAt);

                return (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedDiscounts.has(discount.id)}
                          onCheckedChange={() =>
                            toggleDiscountSelection(discount.id)
                          }
                          aria-label="Select row"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-medium">
                          {discount.code}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyDiscountCode(discount.code)}
                          className="h-6 w-6 p-0"
                        >
                          <IconCopy className="h-3 w-3" />
                        </Button>
                      </div>
                      {discount.description && (
                        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {discount.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {discount.type === "PERCENTAGE"
                          ? "Pourcentage"
                          : "Montant fixe"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatValue(discount.type, discount.value)}
                      </div>
                      {formatMinAmount(discount.minAmount) && (
                        <div className="text-sm text-muted-foreground">
                          {formatMinAmount(discount.minAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={discount.isActive && !expired && !notStarted}
                          disabled
                          className={`scale-75 ${
                            discount.isActive && !expired && !notStarted
                              ? "data-[state=checked]:bg-green-500"
                              : ""
                          }`}
                        />
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-medium ${
                              discount.isActive && !expired && !notStarted
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {expired
                              ? "Expiré"
                              : notStarted
                              ? "Pas encore actif"
                              : discount.isActive
                              ? "Actif"
                              : "Inactif"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {discount.usedCount}
                        {discount.maxUses && ` / ${discount.maxUses}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {discount.startsAt
                          ? format(new Date(discount.startsAt), "PPP", {
                              locale: fr,
                            })
                          : "Immédiatement"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {discount.expiresAt
                          ? format(new Date(discount.expiresAt), "PPP", {
                              locale: fr,
                            })
                          : "Pas d'expiration"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <IconDotsVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleEdit(discount)}
                            >
                              <IconEdit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(discount)}
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredDiscounts.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage + 1} sur {totalPages} (
              {filteredDiscounts.length} réduction(s))
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

      {/* Dialog de confirmation de suppression de réduction */}
      <Dialog
        open={isDeleteDiscountDialogOpen}
        onOpenChange={setIsDeleteDiscountDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Supprimer la réduction</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la réduction &#34;
              <span className="font-semibold">{discountToDelete?.code}</span>
              &#34; ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          {/* Aperçu de la réduction */}
          {discountToDelete && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{discountToDelete.code}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {discountToDelete.type === "PERCENTAGE"
                        ? "Pourcentage"
                        : "Montant fixe"}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatValue(
                        discountToDelete.type,
                        discountToDelete.value
                      )}
                    </span>
                  </div>
                  {discountToDelete.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {discountToDelete.description}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">
                    Utilisé {discountToDelete.usedCount} fois
                    {discountToDelete.maxUses &&
                      ` sur ${discountToDelete.maxUses}`}
                  </div>
                </div>
              </div>

              {/* Avertissement */}
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-start">
                  <IconTrash className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">Attention</p>
                    <p>
                      Cette action supprimera définitivement cette réduction et
                      toutes les données associées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={cancelDeleteDiscount}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDiscount}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Suppression en cours...
                </>
              ) : (
                <>
                  <IconTrash className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    Supprimer la réduction
                  </span>
                  <span className="sm:hidden">Supprimer</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet d'édition de réduction */}
      <DiscountEditSheet
        isOpen={isEditSheetOpen}
        onClose={() => {
          setIsEditSheetOpen(false);
          setDiscountToEdit(null);
        }}
        discount={discountToEdit}
        onDiscountUpdate={handleDiscountUpdate}
      />
    </div>
  );
}
