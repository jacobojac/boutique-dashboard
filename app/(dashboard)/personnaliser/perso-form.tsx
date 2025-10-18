"use client";

import UploadSiteImageDeferred from "@/components/dashboard/upload-site-image-deferred";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useImageUploadStore } from "@/store/ImageUploadStore";
import { Discount } from "@/types/order";
import { useUploadThing } from "@/utils/uploadthing";
import { SiteHeader } from "@app/(dashboard)/site-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Schemas de validation pour chaque section
const headerSchema = z.object({
  announcement_message: z.string().optional(),
  announcement_message_2: z.string().optional(),
});
const heroSchema = z.object({
  homepage_hero_image: z.string(),
  homepage_hero_title: z.string().min(1, "Le titre est requis"),
  homepage_hero_subtitle: z.string().min(1, "Le sous-titre est requis"),
  homepage_hero_button_text: z.string().min(1, "Le texte du bouton est requis"),
});

const categoriesSchema = z.object({
  categories_section_title: z.string().min(1, "Le titre est requis"),
  categories_section_description: z
    .string()
    .min(1, "La description est requise"),
  category_1_name: z.string().min(1, "Le nom est requis"),
  category_1_subtitle: z.string(),
  category_1_button_text: z.string(),
  category_1_link: z.string(),
  category_1_image: z.string(),
  category_2_name: z.string().min(1, "Le nom est requis"),
  category_2_subtitle: z.string(),
  category_2_button_text: z.string(),
  category_2_link: z.string(),
  category_2_image: z.string(),
  category_3_name: z.string().min(1, "Le nom est requis"),
  category_3_subtitle: z.string(),
  category_3_button_text: z.string(),
  category_3_link: z.string(),
  category_3_image: z.string(),
  category_4_name: z.string().min(1, "Le nom est requis"),
  category_4_subtitle: z.string(),
  category_4_button_text: z.string(),
  category_4_link: z.string(),
  category_4_image: z.string(),
});

const promoSchema = z.object({
  promo_section_title: z.string().min(1, "Le titre est requis"),
  promo_section_description: z.string().min(1, "La description est requise"),
});

const discountConfigSchema = z.object({
  selected_discount_id: z.string().optional(),
  promo_discount_enabled: z.boolean().default(false),
  promo_discount_text: z.string().optional(),
  promo_section_image: z.string(),
});

type HeaderFormData = z.infer<typeof headerSchema>;
type HeroFormData = z.infer<typeof heroSchema>;
type CategoriesFormData = z.infer<typeof categoriesSchema>;
type PromoFormData = z.infer<typeof promoSchema>;
type DiscountConfigFormData = z.infer<typeof discountConfigSchema>;

export default function PersoForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Store d'images différées
  const { pendingImages, clearPendingImages } = useImageUploadStore();

  // Hook UploadThing
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      // Upload completed successfully
    },
    onUploadError: (error: Error) => {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'upload des images", {
        position: "top-center",
      });
      setIsUploading(false);
    },
  });

  // Formulaires pour chaque section
  const headerForm = useForm<HeaderFormData>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      announcement_message: "Nouvelle collection disponible",
      announcement_message_2:
        "🔥 Profitez de nos codes de réduction sur tous nos produits !",
    },
  });

  const heroForm = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      homepage_hero_image: "/images/banniere.png",
      homepage_hero_title: "Ta personnalité mérite le meilleur style",
      homepage_hero_subtitle: "Nouvelle Collection",
      homepage_hero_button_text: "Découvrir la collection",
    },
  });

  const categoriesForm = useForm<CategoriesFormData>({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      categories_section_title: "Nos catégories",
      categories_section_description:
        "Découvrez notre sélection soigneusement choisie pour chaque style et occasion",
      category_1_name: "Vêtements Femme",
      category_1_subtitle: "Style élégant pour toutes occasions",
      category_1_button_text: "Découvrir",
      category_1_link: "/store/vetements-femme",
      category_1_image: "/images/category-femme.jpg",
      category_2_name: "Vêtements Homme",
      category_2_subtitle: "Collection moderne et raffinée",
      category_2_button_text: "Explorer",
      category_2_link: "/store/vetements-homme",
      category_2_image: "/images/category-homme.jpg",
      category_3_name: "Accessoires",
      category_3_subtitle: "Complétez votre look parfait",
      category_3_button_text: "Voir tout",
      category_3_link: "/store/accessoires",
      category_3_image: "/images/category-accessoires.jpg",
      category_4_name: "Chaussures",
      category_4_subtitle: "Confort et style à chaque pas",
      category_4_button_text: "Découvrir",
      category_4_link: "/store/chaussures",
      category_4_image: "/images/category-chaussures.jpg",
    },
  });

  const promoForm = useForm<PromoFormData>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      promo_section_title: "LIMITED OFFER",
      promo_section_description:
        "Des arrivages permanents pour tous les goûts.",
    },
  });

  const discountConfigForm = useForm({
    resolver: zodResolver(discountConfigSchema),
    defaultValues: {
      selected_discount_id: "",
      promo_discount_enabled: false,
      promo_discount_text: "Bénéficiez de votre réduction dès maintenant",
      promo_section_image: "/images/promo-background.jpg",
    },
  });

  const loadDiscounts = useCallback(async () => {
    try {
      const response = await fetch("/api/discounts");
      const data = await response.json();
      setDiscounts(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des réductions:", error);
      toast.error("Erreur lors du chargement des réductions", {
        position: "top-center",
      });
    }
  }, []);

  const loadConfigurations = useCallback(async () => {
    try {
      const response = await fetch("/api/site-config");
      const configs = await response.json();

      if (configs.length === 0) {
        await createDefaultConfigurations();
        return;
      }

      // Créer un map des configurations
      const configMap: Record<string, string> = {};
      configs.forEach((config: { key: string; value: string }) => {
        configMap[config.key] = config.value;
      });

      // Mettre à jour les formulaires avec les valeurs de la base
      headerForm.reset({
        announcement_message:
          configMap["announcement_message"] || "Nouvelle collection disponible",
        announcement_message_2:
          configMap["announcement_message_2"] ||
          "🔥 Profitez de nos codes de réduction sur tous nos produits !",
      });

      heroForm.reset({
        homepage_hero_image:
          configMap["homepage_hero_image"] ?? "/images/banniere.png",
        homepage_hero_title:
          configMap["homepage_hero_title"] ??
          "Ta personnalité mérite le meilleur style",
        homepage_hero_subtitle:
          configMap["homepage_hero_subtitle"] ?? "Nouvelle Collection",
        homepage_hero_button_text:
          configMap["homepage_hero_button_text"] ?? "Découvrir la collection",
      });

      categoriesForm.reset({
        categories_section_title:
          configMap["categories_section_title"] || "Nos catégories",
        categories_section_description:
          configMap["categories_section_description"] ||
          "Découvrez notre sélection soigneusement choisie pour chaque style et occasion",
        category_1_name: configMap["category_1_name"] || "Vêtements Femme",
        category_1_subtitle:
          configMap["category_1_subtitle"] ||
          "Style élégant pour toutes occasions",
        category_1_button_text:
          configMap["category_1_button_text"] || "Découvrir",
        category_1_link:
          configMap["category_1_link"] || "/store/vetements-femme",
        category_1_image:
          configMap["category_1_image"] || "/images/category-femme.jpg",
        category_2_name: configMap["category_2_name"] || "Vêtements Homme",
        category_2_subtitle:
          configMap["category_2_subtitle"] || "Collection moderne et raffinée",
        category_2_button_text:
          configMap["category_2_button_text"] || "Explorer",
        category_2_link:
          configMap["category_2_link"] || "/store/vetements-homme",
        category_2_image:
          configMap["category_2_image"] || "/images/category-homme.jpg",
        category_3_name: configMap["category_3_name"] || "Accessoires",
        category_3_subtitle:
          configMap["category_3_subtitle"] || "Complétez votre look parfait",
        category_3_button_text:
          configMap["category_3_button_text"] || "Voir tout",
        category_3_link: configMap["category_3_link"] || "/store/accessoires",
        category_3_image:
          configMap["category_3_image"] || "/images/category-accessoires.jpg",
        category_4_name: configMap["category_4_name"] || "Chaussures",
        category_4_subtitle:
          configMap["category_4_subtitle"] || "Confort et style à chaque pas",
        category_4_button_text:
          configMap["category_4_button_text"] || "Découvrir",
        category_4_link: configMap["category_4_link"] || "/store/chaussures",
        category_4_image:
          configMap["category_4_image"] || "/images/category-chaussures.jpg",
      });

      promoForm.reset({
        promo_section_title:
          configMap["promo_section_title"] || "LIMITED OFFER",
        promo_section_description:
          configMap["promo_section_description"] ||
          "Des arrivages permanents pour tous les goûts.",
      });

      discountConfigForm.reset({
        selected_discount_id: configMap["selected_discount_id"] || "",
        promo_discount_enabled: configMap["promo_discount_enabled"] === "true",
        promo_discount_text:
          configMap["promo_discount_text"] ||
          "Bénéficiez de votre réduction dès maintenant",
        promo_section_image:
          configMap["promo_section_image"] || "/images/promo-background.jpg",
      });
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des configurations", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  }, [heroForm, promoForm]);

  useEffect(() => {
    loadConfigurations();
    loadDiscounts();
  }, [loadConfigurations, loadDiscounts]);

  const createDefaultConfigurations = async () => {
    const defaultConfigs = [
      // Header Section
      {
        key: "announcement_message",
        value: "Nouvelle collection disponible",
        type: "text",
        section: "header",
        description: "Premier message d'annonce en haut de la page",
      },
      {
        key: "announcement_message_2",
        value: "🔥 Profitez de nos codes de réduction sur tous nos produits !",
        type: "text",
        section: "header",
        description: "Deuxième message d'annonce en haut de la page",
      },
      // Hero Section
      {
        key: "homepage_hero_image",
        value: "/images/banniere.png",
        type: "image",
        section: "homepage",
        description: "Image principale de la page &#39;accueil",
      },
      {
        key: "homepage_hero_title",
        value: "Ta personnalité mérite le meilleur style",
        type: "text",
        section: "homepage",
        description: "Titre principal de la page &#39;accueil",
      },
      {
        key: "homepage_hero_subtitle",
        value: "Nouvelle Collection",
        type: "text",
        section: "homepage",
        description: "Sous-titre de la page &#39;accueil",
      },
      {
        key: "homepage_hero_button_text",
        value: "Découvrir la collection",
        type: "text",
        section: "homepage",
        description: "Texte du bouton",
      },

      // Categories Section
      {
        key: "categories_section_title",
        value: "Nos catégories",
        type: "text",
        section: "categories",
        description: "Titre de la section catégories",
      },
      {
        key: "categories_section_description",
        value:
          "Découvrez notre sélection soigneusement choisie pour chaque style et occasion",
        type: "text",
        section: "categories",
        description: "Description de la section catégories",
      },

      // Categories 1-4
      {
        key: "category_1_name",
        value: "Vêtements Femme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 1",
      },
      {
        key: "category_1_subtitle",
        value: "ÉLEGANCE & Confort",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 1",
      },
      {
        key: "category_1_button_text",
        value: "Découvrir",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 1",
      },
      {
        key: "category_1_link",
        value: "/store/vetements-femme",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 1",
      },
      {
        key: "category_1_image",
        value: "/images/category-femme.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 1",
      },

      {
        key: "category_2_name",
        value: "Vêtements Homme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 2",
      },
      {
        key: "category_2_subtitle",
        value: "Style & Performace",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 2",
      },
      {
        key: "category_2_button_text",
        value: "Explorer",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 2",
      },
      {
        key: "category_2_link",
        value: "/store/vetements-homme",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 2",
      },
      {
        key: "category_2_image",
        value: "/images/category-homme.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 2",
      },

      {
        key: "category_3_name",
        value: "Chaussures femme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 3",
      },
      {
        key: "category_3_subtitle",
        value: "Tendance & Qualité",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 3",
      },
      {
        key: "category_3_button_text",
        value: "Voir tout",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 3",
      },
      {
        key: "category_3_link",
        value: "/store/accessoires",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 3",
      },
      {
        key: "category_3_image",
        value: "/images/category-accessoires.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 3",
      },

      {
        key: "category_4_name",
        value: "Chaussures homme",
        type: "text",
        section: "categories",
        description: "Nom de la catégorie 4",
      },
      {
        key: "category_4_subtitle",
        value: "Confort & Durabilité",
        type: "text",
        section: "categories",
        description: "Sous-titre de la catégorie 4",
      },
      {
        key: "category_4_button_text",
        value: "Découvrir",
        type: "text",
        section: "categories",
        description: "Texte du bouton catégorie 4",
      },
      {
        key: "category_4_link",
        value: "/store/chaussures",
        type: "text",
        section: "categories",
        description: "Lien de la catégorie 4",
      },
      {
        key: "category_4_image",
        value: "/images/category-chaussures.jpg",
        type: "image",
        section: "categories",
        description: "Image de la catégorie 4",
      },

      // Promo Section
      {
        key: "promo_section_image",
        value: "/images/promo-background.jpg",
        type: "image",
        section: "promo",
        description: "Image de fond de la section promotionnelle",
      },
      {
        key: "promo_section_title",
        value: "LIMITED OFFER",
        type: "text",
        section: "promo",
        description: "Titre de la section vidéo",
      },
      {
        key: "promo_section_description",
        value: "Des arrivages permanents pour tous les goûts.",
        type: "text",
        section: "promo",
        description: "Description de la section vidéo",
      },

      // Discount Configuration
      {
        key: "selected_discount_id",
        value: "",
        type: "text",
        section: "discount",
        description: "ID de la réduction sélectionnée",
      },
      {
        key: "promo_discount_enabled",
        value: "false",
        type: "text",
        section: "discount",
        description: "Activer l'affichage des réductions",
      },
      {
        key: "promo_discount_text",
        value: "Bénéficiez de votre réduction dès maintenant",
        type: "text",
        section: "discount",
        description: "Texte d'accroche pour la réduction",
      },
    ];

    try {
      const promises = defaultConfigs.map((config) =>
        fetch("/api/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        })
      );

      await Promise.all(promises);
      toast.success("Configurations par défaut créées", {
        position: "top-center",
      });
      await loadConfigurations();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création des configurations", {
        position: "top-center",
      });
    }
  };

  const uploadPendingImages = async () => {
    if (pendingImages.length === 0) return {};

    setIsUploading(true);
    try {
      const files = pendingImages.map((img) => img.file);
      const results = await startUpload(files);

      if (!results || results.length === 0) {
        throw new Error("Upload échoué");
      }

      // Mapper les résultats avec les IDs d'origine
      const uploadMap: Record<string, string> = {};
      results.forEach((result, index) => {
        const pendingImage = pendingImages[index];
        if (pendingImage && result.url) {
          uploadMap[pendingImage.id] = result.url;
        }
      });

      return uploadMap;
    } finally {
      setIsUploading(false);
    }
  };

  const saveHeroSection = async (data: HeroFormData) => {
    try {
      setIsUploading(true);

      // Upload des images en attente
      const uploadMap = await uploadPendingImages();

      // Mettre à jour les URLs dans les données avec les URLs uploadées
      const updatedData = { ...data };
      Object.entries(updatedData).forEach(([key, value]) => {
        if (key.includes("image") && typeof value === "string") {
          // Chercher si cette image correspond à une image en attente
          const pendingImg = pendingImages.find((img) =>
            img.id.startsWith(key.replace("homepage_", ""))
          );
          if (pendingImg && uploadMap[pendingImg.id]) {
            updatedData[key as keyof HeroFormData] = uploadMap[
              pendingImg.id
            ] as string;
          }
        }
      });

      const promises = Object.entries(updatedData).map(([key, value]) =>
        fetch(`/api/site-config/${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value,
            type: key.includes("image") ? "image" : "text",
            section: "homepage",
            description: getDescription(key),
          }),
        })
      );

      await Promise.all(promises);

      // Nettoyer les images en attente
      clearPendingImages();

      toast.success("Section Hero sauvegardée avec succès", {
        position: "top-center",
      });

      // Recharger les configurations
      await loadConfigurations();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde", {
        position: "top-center",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveCategoriesSection = async (data: CategoriesFormData) => {
    try {
      setIsUploading(true);

      // Upload des images en attente
      const uploadMap = await uploadPendingImages();

      // Mettre à jour les URLs dans les données avec les URLs uploadées
      const updatedData = { ...data };
      Object.entries(updatedData).forEach(([key, value]) => {
        if (key.includes("image") && typeof value === "string") {
          // Chercher si cette image correspond à une image en attente
          const pendingImg = pendingImages.find((img) =>
            img.id.startsWith(key)
          );
          if (pendingImg && uploadMap[pendingImg.id]) {
            updatedData[key as keyof CategoriesFormData] = uploadMap[
              pendingImg.id
            ] as string;
          }
        }
      });

      const promises = Object.entries(updatedData).map(([key, value]) =>
        fetch(`/api/site-config/${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value,
            type: key.includes("image") ? "image" : "text",
            section: "categories",
            description: getDescription(key),
          }),
        })
      );

      await Promise.all(promises);

      // Nettoyer les images en attente
      clearPendingImages();

      toast.success("Section Catégories sauvegardée avec succès", {
        position: "top-center",
      });

      // Recharger les configurations
      await loadConfigurations();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde", {
        position: "top-center",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const savePromoSection = async (data: PromoFormData) => {
    try {
      setIsUploading(true);

      // Upload des images en attente
      const uploadMap = await uploadPendingImages();

      // Mettre à jour les URLs dans les données avec les URLs uploadées
      const updatedData = { ...data };
      Object.entries(updatedData).forEach(([key, value]) => {
        if (key.includes("image") && typeof value === "string") {
          // Chercher si cette image correspond à une image en attente
          const pendingImg = pendingImages.find((img) =>
            img.id.startsWith(key.replace("promo_section_", "promo_"))
          );
          if (pendingImg && uploadMap[pendingImg.id]) {
            updatedData[key as keyof PromoFormData] = uploadMap[
              pendingImg.id
            ] as string;
          }
        }
      });

      const promises = Object.entries(updatedData).map(([key, value]) =>
        fetch(`/api/site-config/${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value,
            type: key.includes("image") ? "image" : "text",
            section: "promo",
            description: getDescription(key),
          }),
        })
      );

      await Promise.all(promises);

      // Nettoyer les images en attente
      clearPendingImages();

      toast.success("Section Promotion sauvegardée avec succès", {
        position: "top-center",
      });

      // Recharger les configurations
      await loadConfigurations();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde", {
        position: "top-center",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveDiscountConfig = async (data: DiscountConfigFormData) => {
    try {
      setIsUploading(true);

      console.log("Saving discount config:", data);

      // Handle image uploads first
      if (pendingImages.length > 0) {
        const uploads = pendingImages.map((pendingImg) =>
          startUpload([pendingImg.file])
        );
        const uploadResults = await Promise.all(uploads);

        // Update form with uploaded URLs
        uploadResults.forEach((results, index) => {
          if (results && results[0]) {
            const pendingImg = pendingImages[index];
            if (pendingImg.id === "promo_image") {
              discountConfigForm.setValue(
                "promo_section_image",
                results[0].url
              );
            }
          }
        });

        clearPendingImages();
      }

      const promises = Object.entries(data).map(async ([key, value]) => {
        const payload = {
          key,
          value: value?.toString(),
          type: key === "promo_section_image" ? "image" : "text",
          section: "discount",
          description: getDescription(key),
        };
        console.log(`Saving ${key}:`, payload);

        // Essayer PUT d'abord, puis POST si ça échoue
        const putResponse = await fetch(`/api/site-config/${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!putResponse.ok) {
          console.log(`PUT failed for ${key}, trying POST`);
          // Si PUT échoue, essayer POST pour créer
          return fetch(`/api/site-config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        return putResponse;
      });

      const results = await Promise.all(promises);

      // Vérifier les réponses
      for (const result of results) {
        if (!result.ok) {
          const errorText = await result.text();
          console.error("Error response:", errorText);
        }
      }

      toast.success("Configuration des réductions sauvegardée avec succès", {
        position: "top-center",
      });

      // Recharger les configurations
      await loadConfigurations();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde", {
        position: "top-center",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveHeaderSection = async (data: HeaderFormData) => {
    try {
      setIsUploading(true);

      const promises = Object.entries(data).map(([key, value]) =>
        fetch(`/api/site-config/${key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value,
            type: "text",
            section: "header",
            description: getDescription(key),
          }),
        })
      );

      await Promise.all(promises);

      toast.success("Section Header sauvegardée avec succès", {
        position: "top-center",
      });

      // Recharger les configurations
      await loadConfigurations();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde", {
        position: "top-center",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      announcement_message: "Premier message d'annonce dans le header",
      announcement_message_2: "Deuxième message d'annonce dans le header",
      homepage_hero_image: "Image principale de la page &#39;accueil",
      homepage_hero_title: "Titre principal de la page &#39;accueil",
      homepage_hero_subtitle: "Sous-titre de la page &#39;accueil",
      homepage_hero_button_text: "Texte du bouton",
      categories_section_title: "Titre de la section catégories",
      categories_section_description: "Description de la section catégories",
      category_1_name: "Nom de la catégorie 1",
      category_1_subtitle: "Sous-titre de la catégorie 1",
      category_1_button_text: "Texte du bouton catégorie 1",
      category_1_link: "Lien de la catégorie 1",
      category_1_image: "Image de la catégorie 1",
      category_2_name: "Nom de la catégorie 2",
      category_2_subtitle: "Sous-titre de la catégorie 2",
      category_2_button_text: "Texte du bouton catégorie 2",
      category_2_link: "Lien de la catégorie 2",
      category_2_image: "Image de la catégorie 2",
      category_3_name: "Nom de la catégorie 3",
      category_3_subtitle: "Sous-titre de la catégorie 3",
      category_3_button_text: "Texte du bouton catégorie 3",
      category_3_link: "Lien de la catégorie 3",
      category_3_image: "Image de la catégorie 3",
      category_4_name: "Nom de la catégorie 4",
      category_4_subtitle: "Sous-titre de la catégorie 4",
      category_4_button_text: "Texte du bouton catégorie 4",
      category_4_link: "Lien de la catégorie 4",
      category_4_image: "Image de la catégorie 4",
      promo_section_image: "Image de fond de la section promotionnelle",
      promo_section_title: "Titre de la section vidéo",
      promo_section_description: "Description de la section vidéo",
      selected_discount_id: "ID de la réduction sélectionnée",
      promo_discount_enabled: "Activer l'affichage des réductions",
      promo_discount_text: "Texte d'accroche pour la réduction",
    };
    return descriptions[key] || key;
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Personnaliser la page d'accueil" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="animate-pulse space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Personnaliser la page d'accueil" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
            <div className="px-4 lg:px-6 space-y-10">
              {/* Section Header message */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Header</CardTitle>
                  <CardDescription>
                    Messages d&#39;annonce qui défilent en haut de la page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...headerForm}>
                    <form
                      onSubmit={headerForm.handleSubmit(saveHeaderSection)}
                      className="space-y-6"
                    >
                      <FormField
                        control={headerForm.control}
                        name="announcement_message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Premier message d&#39;annonce</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nouvelle Collection"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={headerForm.control}
                        name="announcement_message_2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Deuxième message d&#39;annonce
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Livraison gratuite à partir de 180€"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={isUploading}
                      >
                        {isUploading
                          ? "Upload et sauvegarde..."
                          : "Sauvegarder la section Header"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              {/* Section Hero */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Hero</CardTitle>
                  <CardDescription>
                    Image principale, titre principal, sous-titre et texte du
                    bouton de la page d&#39;accueil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...heroForm}>
                    <form
                      onSubmit={heroForm.handleSubmit(saveHeroSection)}
                      className="space-y-6"
                    >
                      <FormField
                        control={heroForm.control}
                        name="homepage_hero_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <UploadSiteImageDeferred
                                value={field.value}
                                onChange={field.onChange}
                                label="Image principale de la page d'accueil"
                                description="Sélectionnez une image à uploader ou saisissez une URL directement. Recommandé: 1920 x 820 px"
                                imageKey="hero_image"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={heroForm.control}
                        name="homepage_hero_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Titre principal de la page &#39;accueil
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ta personnalité mérite le meilleur style"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={heroForm.control}
                        name="homepage_hero_subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Sous-titre de la page &#39;accueil
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nouvelle Collection"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={heroForm.control}
                        name="homepage_hero_button_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texte du bouton</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Découvrir la collection"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={isUploading}
                      >
                        {isUploading
                          ? "Upload et sauvegarde..."
                          : "Sauvegarder la section Hero"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Section Catégories */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Catégories</CardTitle>
                  <CardDescription>
                    Configuration des catégories de produits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...categoriesForm}>
                    <form
                      onSubmit={categoriesForm.handleSubmit(
                        saveCategoriesSection
                      )}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={categoriesForm.control}
                          name="categories_section_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titre de la section</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nos catégories"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={categoriesForm.control}
                          name="categories_section_description"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Description de la section</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Découvrez notre sélection..."
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Catégories 1-4 */}
                      <div className="space-y-6">
                        {[1, 2, 3, 4].map((num) => (
                          <div
                            key={num}
                            className="border rounded-lg p-4 space-y-4"
                          >
                            <h4 className="font-medium text-sm text-gray-700">
                              Catégorie {num}
                            </h4>

                            {/* Image de la catégorie */}
                            <FormField
                              control={categoriesForm.control}
                              name={
                                `category_${num}_image` as keyof CategoriesFormData
                              }
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <UploadSiteImageDeferred
                                      value={field.value}
                                      onChange={field.onChange}
                                      label={`Image de la catégorie ${num}`}
                                      description="Sélectionnez une image à uploader ou saisissez une URL directement"
                                      imageKey={`category_${num}_image`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={categoriesForm.control}
                                name={
                                  `category_${num}_name` as keyof CategoriesFormData
                                }
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={categoriesForm.control}
                                name={
                                  `category_${num}_subtitle` as keyof CategoriesFormData
                                }
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Sous-titre</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={categoriesForm.control}
                                name={
                                  `category_${num}_button_text` as keyof CategoriesFormData
                                }
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Texte du bouton</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={categoriesForm.control}
                                name={
                                  `category_${num}_link` as keyof CategoriesFormData
                                }
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lien</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="/store/..."
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={isUploading}
                      >
                        {isUploading
                          ? "Upload et sauvegarde..."
                          : "Sauvegarder la section Catégories"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Section Vidéo */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Video</CardTitle>
                  <CardDescription>
                    Configuration de la section vidéo promotionnelle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...promoForm}>
                    <form
                      onSubmit={promoForm.handleSubmit(savePromoSection)}
                      className="space-y-6"
                    >
                      <FormField
                        control={promoForm.control}
                        name="promo_section_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titre de la section vidéo</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Titre" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={promoForm.control}
                        name="promo_section_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Description de la section vidéo
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Description"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={isUploading}
                      >
                        {isUploading
                          ? "Upload et sauvegarde..."
                          : "Sauvegarder la section Promotion"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Section Configuration des Réductions */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Réductions</CardTitle>
                  <CardDescription>
                    Configuration de l&#39;affichage des réductions avec timer
                    dans la section promo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...discountConfigForm}>
                    <form
                      onSubmit={discountConfigForm.handleSubmit(
                        saveDiscountConfig
                      )}
                      className="space-y-6"
                    >
                      <FormField
                        control={discountConfigForm.control}
                        name="promo_discount_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Afficher les réductions
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Active l&#39;affichage du timer et du code de
                                réduction dans la section promo
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {discountConfigForm.watch("promo_discount_enabled") && (
                        <>
                          <FormField
                            control={discountConfigForm.control}
                            name="promo_section_image"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <UploadSiteImageDeferred
                                    value={field.value}
                                    onChange={field.onChange}
                                    label="Image de fond de la section promotionnelle"
                                    description="Sélectionnez une image à uploader ou saisissez une URL directement"
                                    imageKey="promo_image"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={discountConfigForm.control}
                            name="promo_discount_text"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Texte d&#39;accroche pour la réduction
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Bénéficiez de votre réduction dès maintenant"
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={discountConfigForm.control}
                            name="selected_discount_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Réduction à afficher ({discounts.length}{" "}
                                  disponible(s))
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner une réduction" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {discounts.length === 0 ? (
                                      <SelectItem value="no-discount" disabled>
                                        Aucune réduction disponible - Créez-en
                                        une d&#39;abord
                                      </SelectItem>
                                    ) : (
                                      <>
                                        <SelectItem value="none">
                                          Aucune réduction sélectionnée
                                        </SelectItem>
                                        {discounts.map((discount) => (
                                          <SelectItem
                                            key={discount.id}
                                            value={discount.id}
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium">
                                                {discount.code}
                                              </span>
                                              <span className="text-sm text-gray-500">
                                                {discount.type === "PERCENTAGE"
                                                  ? `${discount.value}%`
                                                  : `${discount.value}€`}{" "}
                                                -{" "}
                                                {discount.isActive
                                                  ? "Active"
                                                  : "Inactive"}
                                              </span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />

                                {/* Bouton pour supprimer la sélection */}
                                {field.value &&
                                  field.value !== "none" &&
                                  field.value !== "no-discount" && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        field.onChange("none");
                                        toast.success(
                                          "Sélection de réduction supprimée",
                                          {
                                            position: "top-center",
                                          }
                                        );
                                      }}
                                      className="mt-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                    >
                                      Supprimer la sélection
                                    </Button>
                                  )}

                                {field.value &&
                                  field.value !== "none" &&
                                  field.value !== "no-discount" && (
                                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                      {(() => {
                                        const selectedDiscount = discounts.find(
                                          (d) => d.id === field.value
                                        );
                                        if (!selectedDiscount) return null;

                                        return (
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Aperçu de la réduction
                                                sélectionnée
                                              </span>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                              <div className="flex items-center justify-between mb-3">
                                                <span className="font-mono bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 px-3 py-1.5 rounded-md text-sm font-semibold tracking-wider">
                                                  {selectedDiscount.code}
                                                </span>
                                                <div
                                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    selectedDiscount.isActive
                                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                  }`}
                                                >
                                                  {selectedDiscount.isActive
                                                    ? "Actif"
                                                    : "Inactif"}
                                                </div>
                                              </div>

                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-2">
                                                  <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                      Réduction:
                                                    </span>
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                      {selectedDiscount.type ===
                                                      "PERCENTAGE"
                                                        ? `${selectedDiscount.value}%`
                                                        : `${selectedDiscount.value}€`}
                                                    </span>
                                                  </div>

                                                  {selectedDiscount.minAmount && (
                                                    <div className="flex items-center gap-2">
                                                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                      <span className="text-gray-600 dark:text-gray-400">
                                                        Montant min:
                                                      </span>
                                                      <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {
                                                          selectedDiscount.minAmount
                                                        }
                                                        €
                                                      </span>
                                                    </div>
                                                  )}

                                                  {selectedDiscount.maxUses && (
                                                    <div className="flex items-center gap-2">
                                                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                                      <span className="text-gray-600 dark:text-gray-400">
                                                        Utilisations max:
                                                      </span>
                                                      <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {
                                                          selectedDiscount.maxUses
                                                        }
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>

                                                <div className="space-y-2">
                                                  {selectedDiscount.startsAt && (
                                                    <div className="flex items-start gap-2">
                                                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1"></span>
                                                      <div>
                                                        <span className="text-gray-600 dark:text-gray-400 block text-xs">
                                                          Début:
                                                        </span>
                                                        <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                                                          {new Date(
                                                            selectedDiscount.startsAt
                                                          ).toLocaleString(
                                                            "fr-FR",
                                                            {
                                                              day: "2-digit",
                                                              month: "2-digit",
                                                              year: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                            }
                                                          )}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  )}

                                                  {selectedDiscount.expiresAt && (
                                                    <div className="flex items-start gap-2">
                                                      <span className="w-2 h-2 bg-red-500 rounded-full mt-1"></span>
                                                      <div>
                                                        <span className="text-gray-600 dark:text-gray-400 block text-xs">
                                                          Expiration:
                                                        </span>
                                                        <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                                                          {new Date(
                                                            selectedDiscount.expiresAt
                                                          ).toLocaleString(
                                                            "fr-FR",
                                                            {
                                                              day: "2-digit",
                                                              month: "2-digit",
                                                              year: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                            }
                                                          )}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {selectedDiscount.description && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                    {
                                                      selectedDiscount.description
                                                    }
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={isUploading}
                      >
                        {isUploading
                          ? "Sauvegarde en cours..."
                          : "Sauvegarder la configuration des réductions"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Conseils */}
              <Card>
                <CardHeader>
                  <CardTitle>💡 Conseils d&#39;utilisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>
                      • <strong>Images :</strong> Sélectionnez une image à
                      uploader ou saisissez directement une URL
                    </li>
                    <li>
                      • <strong>Upload différé :</strong> Les images sont
                      uploadées automatiquement lors de la sauvegarde
                    </li>
                    <li>
                      • <strong>UploadThing :</strong> Images hébergées de façon
                      sécurisée et optimisées
                    </li>
                    <li>
                      • <strong>Modifications :</strong> Visibles immédiatement
                      sur la page d&#39;accueil après sauvegarde
                    </li>
                    <li>
                      • <strong>Aperçu :</strong> Les images sélectionnées
                      s&#39;affichent en attente d&#39;upload
                    </li>
                    <li>
                      • <strong>Format :</strong> JPG, PNG, WebP - Max 4MB par
                      image
                    </li>
                    <li>
                      • <strong>Sauvegarde :</strong> Par section avec upload
                      automatique des images
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
