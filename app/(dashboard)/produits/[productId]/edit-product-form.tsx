"use client";
import UploadImagesDeferred from "@/components/dashboard/upload-images-deferred";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useImageUploadStore } from "@/store/ImageUploadStore";
import { Collection, TypeProduct } from "@/types/product";
import { uploadFiles } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const variantSchema = z.object({
  taille: z.string().optional(),
  couleur: z.string().optional(),
  couleurHex: z.string().optional(),
  prix: z.string().optional(),
  quantity: z.string(),
  sku: z.string().optional(),
});

const productSchema = z.object({
  nom: z.string().min(3, {
    message: "Précisez un titre",
  }),
  description: z.string().optional(),
  prix: z.string(),
  prixReduit: z.string().optional(),
  actif: z.boolean(),
  collections: z.array(z.string()),
  images: z.array(z.string()),
  variants: z.array(variantSchema).default([]),
});

export const EditProductForm = ({ product }: { product: TypeProduct }) => {
  const router = useRouter();
  const { pendingImages, clearPendingImages, resetAll } = useImageUploadStore();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [customColors, setCustomColors] = useState<
    { nom: string; hex: string }[]
  >([]);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#FFFFFF");
  const [currentVariantIndex, setCurrentVariantIndex] = useState<number | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<{
    index: number;
    fieldOnChange: (value: unknown[]) => void;
  } | null>(null);
  const fieldOnChangeRef = useRef<((value: unknown[]) => void) | null>(null);

  // Listes prédéfinies pour les variantes
  const tailles = [
    "Taille unique",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
  ];
  const couleurs = [
    { nom: "Noir", hex: "#000000" },
    { nom: "Blanc", hex: "#FFFFFF" },
    { nom: "Rouge", hex: "#FF0000" },
    { nom: "Bleu", hex: "#0000FF" },
    { nom: "Vert", hex: "#00FF00" },
    { nom: "Jaune", hex: "#FFFF00" },
    { nom: "Rose", hex: "#FFC0CB" },
    { nom: "Violet", hex: "#800080" },
    { nom: "Orange", hex: "#FFA500" },
    { nom: "Gris", hex: "#808080" },
  ];

  useEffect(() => {
    const getColections = async () => {
      try {
        const response = await fetch("/api/collections");
        if (response.ok) {
          const data = await response.json();
          setCollections(data);
        }
      } catch (error) {}
    };
    getColections();
  }, []);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nom: "",
      description: "",
      prix: "",
      prixReduit: "",
      actif: true,
      collections: [],
      images: [],
      variants: [],
    },
  });

  // Réinitialiser le formulaire avec les données du produit
  useEffect(() => {
    if (product) {
      // Clean the store when starting to edit a product
      resetAll();

      form.reset({
        nom: product.nom || "",
        description: product.description || "",
        prix: product.prix ? String(product.prix) : "",
        prixReduit: product.prixReduit ? String(product.prixReduit) : "",
        actif: product.actif,
        collections: product.collections?.map((pc) => pc.collection.nom) || [],
        images: product.images || [],
        variants:
          product.variants?.map((variant) => ({
            taille: variant.taille || undefined,
            couleur: variant.couleur || undefined,
            couleurHex: variant.couleurHex || undefined,
            prix: variant.prix ? String(variant.prix) : "",
            quantity: variant.quantity ? String(variant.quantity) : "0",
            sku: variant.sku || undefined,
          })) || [],
      });
    }
  }, [product, form, resetAll]);

  const handleDeleteVariant = () => {
    if (variantToDelete) {
      const newVariants = (form.getValues().variants || []).filter(
        (_, i) => i !== variantToDelete.index
      );
      variantToDelete.fieldOnChange(newVariants);

      // Reset et fermer la modal
      setIsDeleteModalOpen(false);
      setVariantToDelete(null);
    }
  };

  const handleAddCustomColor = () => {
    if (newColorName && newColorHex) {
      // Vérifier si la couleur n'existe pas déjà
      const exists = [...couleurs, ...customColors].some(
        (c) => c.nom.toLowerCase() === newColorName.toLowerCase()
      );

      if (!exists) {
        const newColor = {
          nom: newColorName,
          hex: newColorHex,
        };

        // Ajouter la couleur personnalisée
        setCustomColors((prev) => {
          const updated = [...prev, newColor];

          // Si c'est pour une variante spécifique, la sélectionner automatiquement
          if (currentVariantIndex !== null && fieldOnChangeRef.current) {
            const currentVariants = form.getValues().variants || [];
            const newVariants = [...currentVariants];
            newVariants[currentVariantIndex].couleur = newColor.nom;

            // Utiliser setTimeout pour s'assurer que la couleur est ajoutée avant la sélection
            setTimeout(() => {
              fieldOnChangeRef.current?.(newVariants);
            }, 0);
          }

          return updated;
        });

        // Reset et fermer la modal
        setNewColorName("");
        setNewColorHex("#FFFFFF");
        setIsColorModalOpen(false);
        setCurrentVariantIndex(null);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      let imageUrls = values.images || [];

      // Upload pending images if there are any
      if (pendingImages.length > 0) {
        try {
          const uploadedImages = await uploadFiles("imageUploader", {
            files: pendingImages.map((img) => img.file),
          });

          if (uploadedImages && uploadedImages.length > 0) {
            const newImageUrls = uploadedImages.map((img) => img.url);
            // Add new uploaded images to existing ones
            imageUrls = [...imageUrls, ...newImageUrls];
            console.log("Images uploaded successfully:", newImageUrls);
          }
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          toast.error("Erreur lors de l'upload des images");
          // Continue without new images if upload fails
        }
      }

      const productData = {
        ...values,
        images: imageUrls,
      };

      console.log("Sending product data:", productData);

      const response = await fetch(`/api/produits/modifier/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const updatedProduct = await response.json();
        console.log("Produit modifié:", updatedProduct);

        // Clear pending images after successful update
        clearPendingImages();

        // Update the form with the new image URLs
        form.setValue("images", imageUrls);

        toast.success("Produit modifié avec succès", {
          position: "top-center",
        });
        router.push("/dashboard/produits");
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        console.error(
          "Erreur lors de la modification:",
          response.status,
          errorData
        );
        toast.error("Erreur lors de la modification");
      }
    } catch (error) {
      console.error("General error:", error);
      toast.error("Erreur lors de la modification");
    }
  }

  return (
    <Card className="w-full">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="actif"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Statut du produit</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value ? "Produit actif" : "Produit inactif"}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={`scale-125 ${
                          field.value ? "data-[state=checked]:bg-green-500" : ""
                        }`}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-8 mt-10">
              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="rounded-e-none"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                        <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                          EUR
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prixReduit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix réduit</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="rounded-e-none"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                        <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                          EUR
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="collections"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Collections</FormLabel>
                  <FormControl>
                    <Popover
                      open={isPopoverOpen}
                      onOpenChange={setIsPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {field.value.length > 0
                            ? `${field.value.length} collection(s) sélectionné(s)`
                            : "Sélectionner des collections"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <div className="max-h-64 overflow-auto">
                          {collections &&
                            collections.map((collection) => (
                              <div
                                key={collection.id}
                                className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  const currentCollections = field.value || [];
                                  const isSelected =
                                    currentCollections.includes(collection.nom);

                                  if (isSelected) {
                                    field.onChange(
                                      currentCollections.filter(
                                        (t) => t !== collection.nom
                                      )
                                    );
                                  } else {
                                    field.onChange([
                                      ...currentCollections,
                                      collection.nom,
                                    ]);
                                  }
                                  setIsPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={`h-4 w-4 ${
                                    field.value?.includes(collection.nom)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                <span>{collection.nom}</span>
                              </div>
                            ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  {/* Affichage des collections sélectionnés */}
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 p-2"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto w-auto p-0 ml-1 hover:opacity-70"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const newValue = field.value.filter(
                                (t) => t !== tag
                              );
                              field.onChange(newValue);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <UploadImagesDeferred
                      value={field.value}
                      onChange={(urls) => field.onChange(urls)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section Variantes */}
            <FormField
              control={form.control}
              name="variants"
              render={({ field }) => (
                <FormItem className="mt-8">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-lg font-medium">
                      Variantes
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newVariant = {
                          taille: "",
                          couleur: "",
                          couleurHex: "",
                          prix: "",
                          quantity: "0",
                          sku: "",
                        };
                        field.onChange([...(field.value || []), newVariant]);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une variante
                    </Button>
                  </div>

                  <div className="space-y-4 mt-4">
                    {(field.value || []).map((variant, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Variante {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setVariantToDelete({
                                index,
                                fieldOnChange: field.onChange,
                              });
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Sélecteur de taille */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Taille
                            </label>
                            <Select
                              value={variant.taille}
                              onValueChange={(value) => {
                                const newVariants = [...(field.value || [])];
                                newVariants[index].taille = value;
                                field.onChange(newVariants);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une taille" />
                              </SelectTrigger>
                              <SelectContent>
                                {tailles.map((taille) => (
                                  <SelectItem key={taille} value={taille}>
                                    {taille}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Sélecteur de couleur */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Couleur
                            </label>
                            <Select
                              value={variant.couleur}
                              onValueChange={(value) => {
                                const newVariants = [...(field.value || [])];
                                newVariants[index].couleur = value;

                                // Trouver le hex de la couleur sélectionnée
                                const allColors = [
                                  ...couleurs,
                                  ...customColors,
                                ];
                                const selectedColor = allColors.find(
                                  (c) => c.nom === value
                                );
                                newVariants[index].couleurHex =
                                  selectedColor?.hex;

                                field.onChange(newVariants);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une couleur">
                                  {variant.couleur &&
                                    (() => {
                                      // Trouver la couleur sélectionnée
                                      const allColors = [
                                        ...couleurs,
                                        ...customColors,
                                      ];
                                      const selectedColor = allColors.find(
                                        (c) => c.nom === variant.couleur
                                      );

                                      if (selectedColor) {
                                        return (
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                              style={{
                                                backgroundColor:
                                                  selectedColor.hex,
                                              }}
                                            />
                                            <span className="truncate">
                                              {selectedColor.nom}
                                            </span>
                                          </div>
                                        );
                                      }
                                      return variant.couleur;
                                    })()}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {/* Couleurs prédéfinies */}
                                {couleurs.map((couleur) => (
                                  <SelectItem
                                    key={couleur.nom}
                                    value={couleur.nom}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                          style={{
                                            backgroundColor: couleur.hex,
                                          }}
                                        />
                                        <span>{couleur.nom}</span>
                                      </div>
                                      <span className="text-xs text-gray-500 font-mono ml-2">
                                        {couleur.hex}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}

                                {/* Couleurs personnalisées */}
                                {customColors.map((couleur) => (
                                  <SelectItem
                                    key={`custom-${couleur.nom}`}
                                    value={couleur.nom}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                          style={{
                                            backgroundColor: couleur.hex,
                                          }}
                                        />
                                        <span>{couleur.nom}</span>
                                      </div>
                                      <span className="text-xs text-gray-500 font-mono ml-2">
                                        {couleur.hex}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}

                                {/* Bouton pour ajouter une couleur */}
                                <div className="p-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                    onClick={() => {
                                      setCurrentVariantIndex(index);
                                      setIsColorModalOpen(true);
                                      fieldOnChangeRef.current = field.onChange;
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                    Ajouter une couleur
                                  </Button>
                                </div>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Prix spécifique */}

                          {/* Quantité */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Quantité
                            </label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={variant.quantity}
                              onChange={(e) => {
                                const newVariants = [...(field.value || [])];
                                newVariants[index].quantity = e.target.value;
                                field.onChange(newVariants);
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="ghost"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear mt-20 cursor-pointer"
            >
              Modifier
            </Button>
          </form>
        </Form>

        {/* Modal pour ajouter une couleur personnalisée */}
        <Dialog open={isColorModalOpen} onOpenChange={setIsColorModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter une couleur personnalisée</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de la couleur</label>
                <Input
                  placeholder="Ex: Bleu marine, Vert pomme..."
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomColor();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Couleur</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#FFFFFF"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsColorModalOpen(false);
                    setNewColorName("");
                    setNewColorHex("#FFFFFF");
                    setCurrentVariantIndex(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleAddCustomColor}
                  disabled={!newColorName.trim()}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter la couleur
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression de variante */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Supprimer la variante</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Êtes-vous sûr de vouloir supprimer cette variante ? Cette action
                est irréversible.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setVariantToDelete(null);
                }}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteVariant}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
