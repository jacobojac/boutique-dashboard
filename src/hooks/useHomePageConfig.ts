"use client";

import { Discount } from "@/types/order";
import { useCallback, useEffect, useState } from "react";

interface HomePageConfig {
  // Hero Section
  homepage_hero_image: string;
  homepage_hero_title: string;
  homepage_hero_subtitle: string;
  homepage_hero_button_text: string;

  // Announcement
  announcement_message: string;
  announcement_message_2: string;

  // Categories
  categories_section_title: string;
  categories_section_description: string;
  category_1_name: string;
  category_1_subtitle: string;
  category_1_button_text: string;
  category_1_link: string;
  category_1_image: string;
  category_2_name: string;
  category_2_subtitle: string;
  category_2_button_text: string;
  category_2_link: string;
  category_2_image: string;
  category_3_name: string;
  category_3_subtitle: string;
  category_3_button_text: string;
  category_3_link: string;
  category_3_image: string;
  category_4_name: string;
  category_4_subtitle: string;
  category_4_button_text: string;
  category_4_link: string;
  category_4_image: string;

  // Video/Promo Section
  promo_section_title: string;
  promo_section_description: string;

  // Discount Configuration
  promo_section_image: string;
  promo_discount_enabled: boolean;
  promo_discount_text: string;
  selected_discount_id: string;
  selectedDiscount: Discount | null;
}

const defaultConfig: HomePageConfig = {
  // Hero Section
  homepage_hero_image: "/images/banniere.png",
  homepage_hero_title: "Ta personnalité mérite le meilleur style",
  homepage_hero_subtitle: "Nouvelle Collection",
  homepage_hero_button_text: "Découvrir la collection",

  // Announcement
  announcement_message: "Nouvelle collection disponible",
  announcement_message_2: "🔥 Profitez de nos codes de réduction sur tous nos produits !",

  // Categories
  categories_section_title: "Nos catégories",
  categories_section_description: "Découvrez notre sélection soigneusement choisie pour chaque style et occasion",
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

  // Video/Promo Section
  promo_section_title: "LIMITED OFFER",
  promo_section_description: "Des arrivages permanents pour tous les goûts.",

  // Discount Configuration
  promo_section_image: "/images/promo-background.jpg",
  promo_discount_enabled: false,
  promo_discount_text: "Bénéficiez de votre réduction dès maintenant",
  selected_discount_id: "",
  selectedDiscount: null,
};

export function useHomePageConfig() {
  const [config, setConfig] = useState<HomePageConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load site configurations
      const configResponse = await fetch("/api/site-config");
      if (!configResponse.ok) {
        throw new Error("Failed to load site configuration");
      }

      const configs = await configResponse.json();
      const configMap: Record<string, string> = {};
      configs.forEach((c: { key: string; value: string }) => {
        configMap[c.key] = c.value;
      });

      // Load discounts if discount is enabled
      let selectedDiscount: Discount | null = null;
      if (
        configMap["selected_discount_id"] &&
        configMap["promo_discount_enabled"] === "true"
      ) {
        try {
          const discountResponse = await fetch("/api/discounts");
          if (discountResponse.ok) {
            const discounts = await discountResponse.json();
            selectedDiscount = discounts.find(
              (d: Discount) => d.id === configMap["selected_discount_id"]
            ) || null;
          }
        } catch (discountError) {
          console.error("Error loading discount:", discountError);
          // Continue without discount data rather than failing entirely
        }
      }

      // Update config with loaded values
      setConfig({
        // Hero Section
        homepage_hero_image: configMap["homepage_hero_image"] || defaultConfig.homepage_hero_image,
        homepage_hero_title: configMap["homepage_hero_title"] || defaultConfig.homepage_hero_title,
        homepage_hero_subtitle: configMap["homepage_hero_subtitle"] || defaultConfig.homepage_hero_subtitle,
        homepage_hero_button_text: configMap["homepage_hero_button_text"] || defaultConfig.homepage_hero_button_text,

        // Announcement
        announcement_message: configMap["announcement_message"] || defaultConfig.announcement_message,
        announcement_message_2: configMap["announcement_message_2"] || defaultConfig.announcement_message_2,

        // Categories
        categories_section_title: configMap["categories_section_title"] || defaultConfig.categories_section_title,
        categories_section_description: configMap["categories_section_description"] || defaultConfig.categories_section_description,
        category_1_name: configMap["category_1_name"] || defaultConfig.category_1_name,
        category_1_subtitle: configMap["category_1_subtitle"] || defaultConfig.category_1_subtitle,
        category_1_button_text: configMap["category_1_button_text"] || defaultConfig.category_1_button_text,
        category_1_link: configMap["category_1_link"] || defaultConfig.category_1_link,
        category_1_image: configMap["category_1_image"] || defaultConfig.category_1_image,
        category_2_name: configMap["category_2_name"] || defaultConfig.category_2_name,
        category_2_subtitle: configMap["category_2_subtitle"] || defaultConfig.category_2_subtitle,
        category_2_button_text: configMap["category_2_button_text"] || defaultConfig.category_2_button_text,
        category_2_link: configMap["category_2_link"] || defaultConfig.category_2_link,
        category_2_image: configMap["category_2_image"] || defaultConfig.category_2_image,
        category_3_name: configMap["category_3_name"] || defaultConfig.category_3_name,
        category_3_subtitle: configMap["category_3_subtitle"] || defaultConfig.category_3_subtitle,
        category_3_button_text: configMap["category_3_button_text"] || defaultConfig.category_3_button_text,
        category_3_link: configMap["category_3_link"] || defaultConfig.category_3_link,
        category_3_image: configMap["category_3_image"] || defaultConfig.category_3_image,
        category_4_name: configMap["category_4_name"] || defaultConfig.category_4_name,
        category_4_subtitle: configMap["category_4_subtitle"] || defaultConfig.category_4_subtitle,
        category_4_button_text: configMap["category_4_button_text"] || defaultConfig.category_4_button_text,
        category_4_link: configMap["category_4_link"] || defaultConfig.category_4_link,
        category_4_image: configMap["category_4_image"] || defaultConfig.category_4_image,

        // Video/Promo Section
        promo_section_title: configMap["promo_section_title"] || defaultConfig.promo_section_title,
        promo_section_description: configMap["promo_section_description"] || defaultConfig.promo_section_description,

        // Discount Configuration
        promo_section_image: configMap["promo_section_image"] || defaultConfig.promo_section_image,
        promo_discount_enabled: configMap["promo_discount_enabled"] === "true",
        promo_discount_text: configMap["promo_discount_text"] || defaultConfig.promo_discount_text,
        selected_discount_id: configMap["selected_discount_id"] || defaultConfig.selected_discount_id,
        selectedDiscount,
      });

    } catch (err) {
      console.error("Error loading home page configuration:", err);
      setError(err instanceof Error ? err.message : "Failed to load configuration");
      // Use default config on error
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshConfig = useCallback(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    isLoading,
    error,
    refreshConfig,
  };
}