"use client";

import Image from "next/image";
import * as React from "react";

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
import { Label } from "@/components/ui/label";
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
import { useProductDashboardStore } from "@/store/ProductDashboardStore";
import { TypeProduct } from "@/types/product";
import {
  IconDotsVertical,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductsTableProps {
  data: TypeProduct[];
  //onDataChange?: () => void;
}

export function ProductsTable({ data }: ProductsTableProps) {
  const products = data;
  const [selectedProducts, setSelectedProducts] = React.useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCollection, setSelectedCollection] =
    React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 10;

  // Extraire toutes les collections uniques
  const allCollections = React.useMemo(() => {
    const collectionsSet = new Set<string>();
    data.forEach((product) => {
      product.collections.forEach((pc) => {
        collectionsSet.add(pc.collection.nom);
      });
    });
    return Array.from(collectionsSet).sort();
  }, [data]);

  // États pour les dialogues
  const [isAddCollectionDialogOpen, setIsAddCollectionDialogOpen] =
    React.useState(false);
  const [isRemoveCollectionDialogOpen, setIsRemoveCollectionDialogOpen] =
    React.useState(false);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] =
    React.useState(false);
  const [productToDelete, setProductToDelete] =
    React.useState<TypeProduct | null>(null);

  // États pour les actions
  const [availableCollections, setAvailableCollections] = React.useState<
    { id: string; nom: string }[]
  >([]);
  const [selectedCollectionToAdd, setSelectedCollectionToAdd] =
    React.useState<string>("");
  const [selectedCollectionToRemove, setSelectedCollectionToRemove] =
    React.useState<string>("");
  const [isAddingCollection, setIsAddingCollection] = React.useState(false);
  const [isRemovingCollection, setIsRemovingCollection] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filtrage des données
  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par collection
    if (selectedCollection) {
      filtered = filtered.filter((product) =>
        product.collections.some(
          (pc) => pc.collection.nom === selectedCollection
        )
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCollection]);

  // Pagination
  const paginatedProducts = React.useMemo(() => {
    const start = currentPage * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Hooks
  const { setProduct } = useProductDashboardStore();
  const router = useRouter();

  // Handlers
  const handleSlug = React.useCallback(
    (myProduct: TypeProduct) => {
      setProduct(myProduct);
      router.push(`/dashboard/produits/${myProduct.id}`);
    },
    [setProduct, router]
  );

  const handleDelete = React.useCallback((product: TypeProduct) => {
    setProductToDelete(product);
    setIsDeleteProductDialogOpen(true);
  }, []);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(0);
    },
    []
  );

  const handleCollectionFilterChange = React.useCallback((value: string) => {
    setSelectedCollection(value === "all" ? "" : value);
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
  const toggleProductSelection = React.useCallback((productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const toggleAllSelection = React.useCallback(() => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
    }
  }, [selectedProducts.size, paginatedProducts]);

  const selectedProductsList = React.useMemo(
    () => products.filter((p) => selectedProducts.has(p.id)),
    [products, selectedProducts]
  );

  // Actions existantes adaptées
  const confirmDeleteProduct = React.useCallback(async () => {
    if (!productToDelete?.id) {
      toast.error("Erreur: ID de produit manquant");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/produits/${encodeURIComponent(productToDelete.id)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Produit supprimé avec succès", {
          duration: 4000,
          position: "top-center",
        });
        setIsDeleteProductDialogOpen(false);
        setProductToDelete(null);
        //onDataChange?.();
        router.refresh();
      } else {
        let errorMessage = "Erreur lors de la suppression du produit";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Ignore parsing error
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Erreur de suppression du produit:", error);
      toast.error("Erreur de connexion lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  }, [productToDelete, router]);

  const cancelDeleteProduct = React.useCallback(() => {
    setIsDeleteProductDialogOpen(false);
    setProductToDelete(null);
  }, []);

  // Récupérer les collections disponibles
  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections");
        if (response.ok) {
          const collections = await response.json();
          setAvailableCollections(collections);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des collections:", error);
      }
    };

    fetchCollections();
  }, []);

  // Actions pour les collections
  const handleOpenAddCollectionDialog = React.useCallback(() => {
    if (selectedProducts.size === 0) {
      toast.error("Veuillez sélectionner au moins un produit");
      return;
    }
    setIsAddCollectionDialogOpen(true);
  }, [selectedProducts.size]);

  const handleOpenRemoveCollectionDialog = React.useCallback(() => {
    if (selectedProducts.size === 0) {
      toast.error("Veuillez sélectionner au moins un produit");
      return;
    }
    setIsRemoveCollectionDialogOpen(true);
  }, [selectedProducts.size]);

  const handleAddCollectionToSelectedProducts = React.useCallback(async () => {
    if (!selectedCollectionToAdd) {
      toast.error("Veuillez sélectionner une collection");
      return;
    }

    const selectedProductIds = Array.from(selectedProducts);

    setIsAddingCollection(true);
    try {
      const response = await fetch("/api/products/bulk-add-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selectedProductIds,
          collectionId: selectedCollectionToAdd,
        }),
      });

      if (response.ok) {
        toast.success(
          `Collection ajoutée à ${selectedProductIds.length} produit(s)`,
          {
            position: "top-center",
          }
        );
        setIsAddCollectionDialogOpen(false);
        setSelectedCollectionToAdd("");
        setSelectedProducts(new Set());
        //onDataChange?.();
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de l'ajout de la collection");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la collection:", error);
      toast.error("Erreur lors de l'ajout de la collection");
    } finally {
      setIsAddingCollection(false);
    }
  }, [selectedCollectionToAdd, selectedProducts, router]);

  const handleRemoveCollectionFromSelectedProducts =
    React.useCallback(async () => {
      if (!selectedCollectionToRemove) {
        toast.error("Veuillez sélectionner une collection");
        return;
      }

      const selectedProductIds = Array.from(selectedProducts);

      setIsRemovingCollection(true);
      try {
        const response = await fetch("/api/products/bulk-remove-collection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productIds: selectedProductIds,
            collectionId: selectedCollectionToRemove,
          }),
        });

        if (response.ok) {
          toast.success(
            `Collection supprimée de ${selectedProductIds.length} produit(s)`,
            {
              position: "top-center",
            }
          );
          setIsRemoveCollectionDialogOpen(false);
          setSelectedCollectionToRemove("");
          setSelectedProducts(new Set());
          //onDataChange?.();
          router.refresh();
        } else {
          const error = await response.json();
          toast.error(
            error.message || "Erreur lors de la suppression de la collection"
          );
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la collection:", error);
        toast.error("Erreur lors de la suppression de la collection");
      } finally {
        setIsRemovingCollection(false);
      }
    }, [selectedCollectionToRemove, selectedProducts, router]);

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:flex-1 sm:items-center sm:space-x-2 sm:space-y-0">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des produits..."
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

          {/* Filtre par collection */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium hidden sm:block">
              Collection:
            </Label>
            <Select
              value={selectedCollection || "all"}
              onValueChange={handleCollectionFilterChange}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Toutes les collections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les collections</SelectItem>
                {allCollections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
          {selectedProducts.size > 0 && (
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                onClick={handleOpenAddCollectionDialog}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-white cursor-pointer"
              >
                <IconPlus className="mr-2 h-4 w-4" />
                <span className="sm:hidden">
                  Ajouter ({selectedProducts.size})
                </span>
                <span className="hidden sm:inline">
                  Ajouter collection ({selectedProducts.size})
                </span>
              </Button>

              <Button
                onClick={handleOpenRemoveCollectionDialog}
                size="sm"
                variant="destructive"
                className="w-full sm:w-auto cursor-pointer"
              >
                <IconMinus className="mr-2 h-4 w-4" />
                <span className="sm:hidden">
                  Retirer ({selectedProducts.size})
                </span>
                <span className="hidden sm:inline">
                  Retirer collection ({selectedProducts.size})
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedProducts.size} sur {filteredProducts.length} produit(s)
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
                      selectedProducts.size === paginatedProducts.length &&
                      paginatedProducts.length > 0
                    }
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all"
                  />
                </div>
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-muted-foreground text-4xl">📦</span>
                    <p className="text-muted-foreground">
                      {searchTerm || selectedCollection
                        ? "Aucun produit ne correspond aux filtres"
                        : "Aucun produit trouvé"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const hasNouveautesCollection = product.collections.some(
                  (pc) => pc.collection.nom.toLowerCase() === "nouveautés"
                );
                const hasReduction =
                  product.prixReduit != null && product.prixReduit > 0;

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() =>
                            toggleProductSelection(product.id)
                          }
                          aria-label="Select row"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-muted">
                        {product.images &&
                        product.images.length > 0 &&
                        product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.nom}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate">
                        {product.nom}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.actif}
                          disabled
                          className={`scale-75 ${product.actif ? 'data-[state=checked]:bg-green-500' : ''}`}
                        />
                        <span className={`text-sm font-medium ${
                          product.actif ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {product.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {hasNouveautesCollection && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                            N
                          </span>
                        )}
                        {hasReduction && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            P
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        {hasReduction ? (
                          <>
                            <span className="font-semibold text-green-600">
                              {product.prixReduit!.toFixed(2)} €
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                              {product.prix.toFixed(2)} €
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold">
                            {product.prix.toFixed(2)} €
                          </span>
                        )}
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
                              onClick={() => handleSlug(product)}
                            >
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(product)}
                            >
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
        {filteredProducts.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage + 1} sur {totalPages} ({filteredProducts.length}{" "}
              produit(s))
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

      {/* Dialog pour ajouter une collection aux produits sélectionnés */}
      <Dialog
        open={isAddCollectionDialogOpen}
        onOpenChange={setIsAddCollectionDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Ajouter à une collection</DialogTitle>
            <DialogDescription>
              Sélectionnez une collection à ajouter aux {selectedProducts.size}{" "}
              produit(s) sélectionné(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-select">Collection</Label>
              <Select
                value={selectedCollectionToAdd}
                onValueChange={setSelectedCollectionToAdd}
              >
                <SelectTrigger id="collection-select">
                  <SelectValue placeholder="Sélectionner une collection" />
                </SelectTrigger>
                <SelectContent>
                  {availableCollections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aperçu des produits sélectionnés */}
            <div className="space-y-2">
              <Label>Produits sélectionnés :</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                {selectedProductsList.map((product) => (
                  <div
                    key={product.id}
                    className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.nom}
                          width={24}
                          height={24}
                          className="object-cover rounded"
                          sizes="24px"
                        />
                      ) : (
                        <span className="text-xs">📦</span>
                      )}
                    </div>
                    <span className="truncate">{product.nom}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddCollectionDialogOpen(false);
                setSelectedCollectionToAdd("");
              }}
              disabled={isAddingCollection}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddCollectionToSelectedProducts}
              disabled={isAddingCollection || !selectedCollectionToAdd}
              className="w-full sm:w-auto"
            >
              {isAddingCollection ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <IconPlus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    Ajouter à la collection
                  </span>
                  <span className="sm:hidden">Ajouter</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer une collection des produits sélectionnés */}
      <Dialog
        open={isRemoveCollectionDialogOpen}
        onOpenChange={setIsRemoveCollectionDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Retirer d&apos;une collection</DialogTitle>
            <DialogDescription>
              Sélectionnez une collection à retirer des {selectedProducts.size}{" "}
              produit(s) sélectionné(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-remove-select">
                Collection à retirer
              </Label>
              <Select
                value={selectedCollectionToRemove}
                onValueChange={setSelectedCollectionToRemove}
              >
                <SelectTrigger id="collection-remove-select">
                  <SelectValue placeholder="Sélectionner une collection à retirer" />
                </SelectTrigger>
                <SelectContent>
                  {availableCollections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aperçu des produits sélectionnés */}
            <div className="space-y-2">
              <Label>Produits sélectionnés :</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                {selectedProductsList.map((product) => (
                  <div
                    key={product.id}
                    className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.nom}
                          width={24}
                          height={24}
                          className="object-cover rounded"
                          sizes="24px"
                        />
                      ) : (
                        <span className="text-xs">📦</span>
                      )}
                    </div>
                    <span className="truncate">{product.nom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avertissement */}
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-start">
                <IconTrash className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  <p className="font-medium">Attention</p>
                  <p>
                    Cette action retirera la collection sélectionnée de tous les
                    produits choisis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRemoveCollectionDialogOpen(false);
                setSelectedCollectionToRemove("");
              }}
              disabled={isRemovingCollection}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveCollectionFromSelectedProducts}
              disabled={isRemovingCollection || !selectedCollectionToRemove}
              className="w-full sm:w-auto"
            >
              {isRemovingCollection ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Suppression en cours...
                </>
              ) : (
                <>
                  <IconTrash className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    Retirer de la collection
                  </span>
                  <span className="sm:hidden">Retirer</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression de produit */}
      <Dialog
        open={isDeleteProductDialogOpen}
        onOpenChange={setIsDeleteProductDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit &quot;
              <span className="font-semibold">{productToDelete?.nom}</span>
              &quot; ? Cette action est irréversible et supprimera toutes les
              données associées.
            </DialogDescription>
          </DialogHeader>

          {/* Aperçu du produit */}
          {productToDelete && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {productToDelete.images?.[0] ? (
                    <Image
                      src={productToDelete.images[0]}
                      alt={productToDelete.nom}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">📦</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{productToDelete.nom}</h4>
                  <p className="text-sm text-muted-foreground">
                    {productToDelete.prixReduit &&
                    productToDelete.prixReduit > 0 ? (
                      <>
                        <span className="font-semibold text-green-600">
                          {productToDelete.prixReduit.toFixed(2)} €
                        </span>
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          {productToDelete.prix.toFixed(2)} €
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold">
                        {productToDelete.prix.toFixed(2)} €
                      </span>
                    )}
                  </p>
                  {productToDelete.collections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {productToDelete.collections.slice(0, 2).map((pc) => (
                        <span
                          key={pc.collection.id}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-1.5 py-0.5 rounded"
                        >
                          {pc.collection.nom}
                        </span>
                      ))}
                      {productToDelete.collections.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{productToDelete.collections.length - 2} autre(s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Avertissement */}
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-start">
                  <IconTrash className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">Attention</p>
                    <p>
                      Cette action supprimera définitivement ce produit, toutes
                      ses variantes, ses images et toutes les données associées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={cancelDeleteProduct}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProduct}
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
                  <span className="hidden sm:inline">Supprimer le produit</span>
                  <span className="sm:hidden">Supprimer</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
