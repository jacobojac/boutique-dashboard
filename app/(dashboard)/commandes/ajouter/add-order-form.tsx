"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/order-utils";
import { OrderItem } from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconMapPin,
  IconPackage,
  IconPercentage,
  IconPlus,
  IconShoppingCart,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const orderSchema = z.object({
  customerName: z.string().optional(),
  customerEmail: z
    .string()
    .email("Email invalide")
    .optional()
    .or(z.literal("")),
  customerPhone: z.string().optional(),
  customerStreet: z.string().optional(),
  customerPostalCode: z.string().optional(),
  customerCity: z.string().optional(),
  customerCountry: z.string().optional(),
  notes: z.string().optional(),
  discountType: z.enum(["percentage", "amount"]).optional(),
  discountValue: z.number().min(0).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface Product {
  id: string;
  nom: string;
  prix: number;
  images: string[];
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  taille?: string;
  couleur?: string;
  prix?: number;
  quantity: number;
}

export default function AddOrderForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      discountType: "percentage",
      discountValue: 0,
    },
  });

  // Charger les produits disponibles
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      }
    };

    fetchProducts();
  }, []);

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `CMD-${timestamp}-${random}`;
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error("Veuillez sélectionner un produit", {
        position: "top-center",
      });
      return;
    }

    const price = selectedVariant?.prix || selectedProduct.prix;
    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      orderId: "",
      productId: selectedProduct.id,
      variantId: selectedVariant?.id || null,
      nom: selectedProduct.nom,
      prix: price,
      quantite: quantity,
      taille: selectedVariant?.taille || null,
      couleur: selectedVariant?.couleur || null,
      image: selectedProduct.images[0] || null,
      createdAt: new Date(),
    };

    setOrderItems((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
    toast.success("Produit ajouté à la commande", { position: "top-center" });
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.success("Produit retiré de la commande", { position: "top-center" });
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    } else {
      return Math.min(discountValue, subtotal);
    }
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscountAmount());
  };

  const onSubmit = async (data: OrderFormData) => {
    if (orderItems.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à la commande", {
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        orderNumber: generateOrderNumber(),
        ...data,
        subtotalAmount: calculateSubtotal(),
        discountType: discountType,
        discountValue: discountValue,
        discountAmount: calculateDiscountAmount(),
        totalAmount: calculateTotal(),
        items: orderItems,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la commande"
        );
      }

      await response.json();

      toast.success("Commande créée avec succès", {
        position: "top-center",
      });

      router.push("/commandes");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la commande",
        {
          position: "top-center",
        }
      );
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/commandes">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 cursor-pointer"
          >
            <IconArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nouvelle commande
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Créer une nouvelle commande client
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <IconUser className="h-4 w-4 text-blue-600" />
              </div>
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="customerName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nom du client
                </Label>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  placeholder="Nom du client"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="customerEmail"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Adresse email
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register("customerEmail")}
                  placeholder="email@exemple.com"
                  className="h-10"
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="customerPhone"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Numéro de téléphone
              </Label>
              <Input
                id="customerPhone"
                {...register("customerPhone")}
                placeholder="Numéro de téléphone"
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Adresse de livraison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <IconMapPin className="h-4 w-4 text-green-600" />
              </div>
              Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="customerStreet"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adresse
              </Label>
              <Input
                id="customerStreet"
                {...register("customerStreet")}
                placeholder="123 Rue de la Paix"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="customerPostalCode"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Code postal
                </Label>
                <Input
                  id="customerPostalCode"
                  {...register("customerPostalCode")}
                  placeholder="75001"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="customerCity"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ville
                </Label>
                <Input
                  id="customerCity"
                  {...register("customerCity")}
                  placeholder="Paris"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="customerCountry"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Pays
                </Label>
                <Input
                  id="customerCountry"
                  {...register("customerCountry")}
                  placeholder="France"
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles de la commande */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                <IconPackage className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex items-center justify-between w-full">
                <span>Articles de la commande</span>
                <div className="text-sm text-gray-600 bg-gray-100 dark:bg-card px-3 py-1 rounded-full">
                  {orderItems.length} article{orderItems.length > 1 ? "s" : ""}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderItems.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-card">
                      <TableHead className="font-semibold">Produit</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">
                        Quantité
                      </TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">
                        Prix unit.
                      </TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow
                        key={item.id}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-card"
                            : "bg-gray-50/30 dark:bg-card"
                        }
                      >
                        <TableCell>
                          <div className="py-2">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {item.nom}
                            </div>
                            {(item.taille || item.couleur) && (
                              <div className="text-sm text-gray-500 mt-1">
                                {item.taille && (
                                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs mr-2">
                                    Taille: {item.taille}
                                  </span>
                                )}
                                {item.couleur && (
                                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                    Couleur: {item.couleur}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-sm text-gray-500 mt-1 sm:hidden">
                              Qté: {item.quantite} • {formatPrice(item.prix)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium hidden sm:table-cell">
                          {item.quantite}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-100 hidden sm:table-cell">
                          {formatPrice(item.prix)}
                        </TableCell>
                        <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                          {formatPrice(item.prix * item.quantite)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <IconShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>Aucun article dans cette commande</p>
                <p className="text-sm mt-1">Ajoutez des produits ci-dessous</p>
              </div>
            )}

            {/* Ajouter un produit */}
            <div className="space-y-4 p-5 border-2 border-dashed border-gray-200 rounded-lg bg-white dark:bg-card">
              <div className="flex items-center gap-2">
                <IconPlus className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Ajouter un produit
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Produit
                  </Label>
                  <Select
                    value={selectedProduct?.id || ""}
                    onValueChange={(value) => {
                      const product = products.find((p) => p.id === value);
                      setSelectedProduct(product || null);
                      setSelectedVariant(null);
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white dark:bg-black">
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{product.nom}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {formatPrice(product.prix)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct &&
                  selectedProduct.variants &&
                  selectedProduct.variants.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Variante
                      </Label>
                      <Select
                        value={selectedVariant?.id || ""}
                        onValueChange={(value) => {
                          const variant = selectedProduct.variants.find(
                            (v) => v.id === value
                          );
                          setSelectedVariant(variant || null);
                        }}
                      >
                        <SelectTrigger className="h-10 bg-white dark:bg-black">
                          <SelectValue placeholder="Sélectionner une variante" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProduct.variants.map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              <div className="flex justify-between items-center w-full">
                                <span>
                                  {variant.taille && `${variant.taille}`}
                                  {variant.taille && variant.couleur && " • "}
                                  {variant.couleur && `${variant.couleur}`}
                                </span>
                                {variant.prix && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    {formatPrice(variant.prix)}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
              </div>

              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quantité
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-10 bg-white dark:bg-black"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-6 h-10 bg-white cursor-pointer w-full md:w-auto"
                  disabled={!selectedProduct}
                >
                  <IconPlus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Réduction */}
            <div className="space-y-4 p-5 border rounded-lg bg-white dark:bg-card">
              <div className="flex items-center gap-2">
                <IconPercentage className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Réduction
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type de réduction
                  </Label>
                  <Select
                    value={discountType}
                    onValueChange={(value: "percentage" | "amount") => {
                      setDiscountType(value);
                      setValue("discountType", value);
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white dark:bg-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        Pourcentage (%)
                      </SelectItem>
                      <SelectItem value="amount">Montant fixe (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Valeur de la réduction
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={
                      discountType === "percentage"
                        ? "100"
                        : calculateSubtotal().toString()
                    }
                    step={discountType === "percentage" ? "1" : "0.01"}
                    value={discountValue}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setDiscountValue(value);
                      setValue("discountValue", value);
                    }}
                    placeholder={discountType === "percentage" ? "0" : "0.00"}
                    className="h-10 bg-white dark:bg-black"
                  />
                </div>
              </div>

              {discountValue > 0 && (
                <div className="text-sm text-green-700 bg-green-100 p-3 rounded">
                  Réduction appliquée : {formatPrice(calculateDiscountAmount())}
                  {discountType === "percentage" && ` (${discountValue}%)`}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-white dark:bg-card p-5 rounded-lg border">
              <div className="space-y-3">
                {/* Sous-total */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Sous-total
                  </span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {formatPrice(calculateSubtotal())}
                  </span>
                </div>

                {/* Réduction */}
                {discountValue > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-600">
                      Réduction{" "}
                      {discountType === "percentage"
                        ? `(${discountValue}%)`
                        : ""}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      -{formatPrice(calculateDiscountAmount())}
                    </span>
                  </div>
                )}

                {/* Ligne de séparation */}
                <hr className="border-gray-300" />

                {/* Total final */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Total de la commande
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>

                {orderItems.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {orderItems.reduce((sum, item) => sum + item.quantite, 0)}{" "}
                    articles au total
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes internes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("notes")}
              placeholder="Ajouter des notes sur cette commande..."
              className="min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <Link href="/dashboard/commandes" className="w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="w-full cursor-pointer"
            >
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading || orderItems.length === 0}
            className="w-full bg-white cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Création...
              </div>
            ) : (
              "Créer la commande"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
