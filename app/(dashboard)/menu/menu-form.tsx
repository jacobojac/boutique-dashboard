"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

type Collection = {
  id: string;
  nom: string;
  slug: string;
  description?: string;
};

type MenuItem = {
  id: string;
  collectionSlug: string;
};

const menuSchema = z.object({
  menu_homme: z.array(
    z.object({
      id: z.string(),
      collectionSlug: z.string(),
    })
  ),
  menu_femme: z.array(
    z.object({
      id: z.string(),
      collectionSlug: z.string(),
    })
  ),
});

type MenuFormData = z.infer<typeof menuSchema>;

export default function MenuForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    category: "homme" | "femme";
    index: number;
  } | null>(null);

  const menuForm = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      menu_homme: [],
      menu_femme: [],
    },
  });

  const loadCollections = useCallback(async () => {
    try {
      const response = await fetch("/api/collections");
      const data = await response.json();
      setCollections(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des collections:", error);
      toast.error("Erreur lors du chargement des collections", {
        position: "top-center",
      });
    }
  }, []);

  const loadConfigurations = useCallback(async () => {
    try {
      const response = await fetch("/api/site-config");
      const configs = await response.json();

      const configMap: Record<string, string> = {};
      configs.forEach((config: { key: string; value: string }) => {
        configMap[config.key] = config.value;
      });

      // Charger les menus depuis le format JSON stocké
      const menuHomme: MenuItem[] = configMap["menu_homme"]
        ? JSON.parse(configMap["menu_homme"])
        : [];
      const menuFemme: MenuItem[] = configMap["menu_femme"]
        ? JSON.parse(configMap["menu_femme"])
        : [];

      menuForm.reset({
        menu_homme: menuHomme,
        menu_femme: menuFemme,
      });
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des configurations", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  }, [menuForm]);

  useEffect(() => {
    loadCollections();
    loadConfigurations();
  }, [loadCollections, loadConfigurations]);

  const generateId = () => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addMenuItem = (category: "homme" | "femme") => {
    const currentItems = menuForm.getValues()[`menu_${category}`] || [];
    const newItem: MenuItem = {
      id: generateId(),
      collectionSlug: "",
    };
    menuForm.setValue(`menu_${category}`, [...currentItems, newItem]);
  };

  const removeMenuItem = (category: "homme" | "femme", index: number) => {
    const currentItems = menuForm.getValues()[`menu_${category}`] || [];
    const newItems = currentItems.filter((_, i) => i !== index);
    menuForm.setValue(`menu_${category}`, newItems);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const updateMenuItem = (
    category: "homme" | "femme",
    index: number,
    collectionSlug: string
  ) => {
    const currentItems = [...(menuForm.getValues()[`menu_${category}`] || [])];
    currentItems[index] = {
      ...currentItems[index],
      collectionSlug,
    };
    menuForm.setValue(`menu_${category}`, currentItems);
  };

  const saveMenuSection = async (data: MenuFormData) => {
    try {
      setIsSaving(true);

      // Filtrer les items vides
      const menuHomme = data.menu_homme.filter((item) => item.collectionSlug);
      const menuFemme = data.menu_femme.filter((item) => item.collectionSlug);

      const configs = [
        {
          key: "menu_homme",
          value: JSON.stringify(menuHomme),
          type: "json",
          section: "menu",
          description: "Configuration du menu Homme",
        },
        {
          key: "menu_femme",
          value: JSON.stringify(menuFemme),
          type: "json",
          section: "menu",
          description: "Configuration du menu Femme",
        },
      ];

      const promises = configs.map(async (payload) => {
        const putResponse = await fetch(`/api/site-config/${payload.key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!putResponse.ok) {
          return fetch(`/api/site-config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        return putResponse;
      });

      await Promise.all(promises);

      toast.success("Configuration du menu sauvegardée avec succès", {
        position: "top-center",
      });

      await loadConfigurations();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde", {
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getCollectionName = (slug: string) => {
    const collection = collections.find((c) => c.slug === slug);
    return collection?.nom || slug;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configuration du Menu</CardTitle>
          <CardDescription>
            Configuration des liens du menu de navigation. Ajoutez des
            sous-menus et sélectionnez les collections à afficher pour chaque
            catégorie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...menuForm}>
            <form
              onSubmit={menuForm.handleSubmit(saveMenuSection)}
              className="space-y-6"
            >
              {/* Menu Homme */}
              <FormField
                control={menuForm.control}
                name="menu_homme"
                render={({ field }) => (
                  <FormItem>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            Menu HOMME
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Les liens seront générés sous la forme :
                            /homme/&#123;slug-collection&#125;
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addMenuItem("homme")}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter un sous-menu
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(field.value || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                            Aucun sous-menu configuré. Cliquez sur
                            &quot;Ajouter un sous-menu&quot; pour commencer.
                          </p>
                        ) : (
                          (field.value || []).map((item, index) => (
                            <Card key={item.id} className="p-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground w-8">
                                  #{index + 1}
                                </span>
                                <div className="flex-1">
                                  <Select
                                    value={item.collectionSlug || "none"}
                                    onValueChange={(value) =>
                                      updateMenuItem(
                                        "homme",
                                        index,
                                        value === "none" ? "" : value
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner une collection" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">
                                        Sélectionner une collection
                                      </SelectItem>
                                      {collections.map((collection) => (
                                        <SelectItem
                                          key={collection.id}
                                          value={collection.slug}
                                        >
                                          {collection.nom}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {item.collectionSlug && (
                                  <p className="text-xs text-muted-foreground min-w-[150px]">
                                    /homme/{item.collectionSlug}
                                  </p>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete({
                                      category: "homme",
                                      index,
                                    });
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Menu Femme */}
              <FormField
                control={menuForm.control}
                name="menu_femme"
                render={({ field }) => (
                  <FormItem>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            Menu FEMME
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Les liens seront générés sous la forme :
                            /femme/&#123;slug-collection&#125;
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addMenuItem("femme")}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter un sous-menu
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(field.value || []).length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                            Aucun sous-menu configuré. Cliquez sur
                            &quot;Ajouter un sous-menu&quot; pour commencer.
                          </p>
                        ) : (
                          (field.value || []).map((item, index) => (
                            <Card key={item.id} className="p-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground w-8">
                                  #{index + 1}
                                </span>
                                <div className="flex-1">
                                  <Select
                                    value={item.collectionSlug || "none"}
                                    onValueChange={(value) =>
                                      updateMenuItem(
                                        "femme",
                                        index,
                                        value === "none" ? "" : value
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner une collection" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">
                                        Sélectionner une collection
                                      </SelectItem>
                                      {collections.map((collection) => (
                                        <SelectItem
                                          key={collection.id}
                                          value={collection.slug}
                                        >
                                          {collection.nom}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {item.collectionSlug && (
                                  <p className="text-xs text-muted-foreground min-w-[150px]">
                                    /femme/{item.collectionSlug}
                                  </p>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete({
                                      category: "femme",
                                      index,
                                    });
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSaving}
              >
                {isSaving
                  ? "Sauvegarde en cours..."
                  : "Sauvegarder la configuration du menu"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le sous-menu</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce sous-menu ? Cette action est
              irréversible.
            </p>
            {itemToDelete && (
              <p className="text-sm text-muted-foreground mt-2">
                Sous-menu #{itemToDelete.index + 1} de la catégorie{" "}
                <strong>
                  {itemToDelete.category === "homme" ? "HOMME" : "FEMME"}
                </strong>
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (itemToDelete) {
                  removeMenuItem(itemToDelete.category, itemToDelete.index);
                }
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
