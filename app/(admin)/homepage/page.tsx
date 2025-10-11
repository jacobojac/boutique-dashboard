"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SiteConfig {
  id: string;
  key: string;
  value: string;
  type: string;
  section: string;
  description?: string;
}

export default function HomepageEditor() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Configurations par défaut pour la page d'accueil
  const defaultConfigs = [
    {
      key: "homepage_hero_title",
      value: "Bienvenue dans notre boutique",
      type: "text",
      section: "homepage",
      description: "Titre principal de la page d'accueil",
    },
    {
      key: "homepage_hero_subtitle",
      value: "Découvrez nos collections exclusives",
      type: "text",
      section: "homepage",
      description: "Sous-titre de la page d'accueil",
    },
    {
      key: "homepage_hero_image",
      value: "/images/hero-default.jpg",
      type: "image",
      section: "homepage",
      description: "Image principale de la page d'accueil",
    },
    {
      key: "homepage_featured_title",
      value: "Nos dernières nouveautés",
      type: "text",
      section: "homepage",
      description: "Titre de la section produits vedettes",
    },
    {
      key: "homepage_featured_description",
      value: "Découvrez notre sélection exclusive des dernières tendances",
      type: "text",
      section: "homepage",
      description: "Description de la section produits vedettes",
    },
  ];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch("/api/site-config");
      const data = await response.json();

      const homepageConfigs = data.filter(
        (config: SiteConfig) => config.section === "homepage"
      );

      // Si aucune configuration n'existe, créer les configurations par défaut
      if (homepageConfigs.length === 0) {
        await createDefaultConfigs();
      } else {
        setConfigs(homepageConfigs);
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultConfigs = async () => {
    try {
      const promises = defaultConfigs.map((config) =>
        fetch("/api/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        })
      );

      await Promise.all(promises);
      await loadConfigs();
      toast.success("Configurations par défaut créées");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création des configurations");
    }
  };

  const updateConfig = async (key: string, value: string) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/site-config/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        setConfigs((prev) =>
          prev.map((config) =>
            config.key === key ? { ...config, value } : config
          )
        );
        toast.success("Configuration mise à jour");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setIsSaving(true);
      const promises = configs.map((config) => {
        const value = formData.get(config.key) as string;
        if (value !== config.value) {
          return updateConfig(config.key, value);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success("Toutes les configurations ont été sauvegardées");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Édition de la page d&#39;accueil
          </h1>
          <p className="text-gray-600">
            Modifiez les textes et images de votre page d&#39;accueil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {configs.map((config) => (
            <div key={config.key} className="space-y-2">
              <Label htmlFor={config.key} className="text-sm font-medium">
                {config.description}
              </Label>

              {config.type === "text" && config.key.includes("title") ? (
                <Input
                  id={config.key}
                  name={config.key}
                  type="text"
                  defaultValue={config.value}
                  className="w-full"
                  placeholder={config.description}
                />
              ) : config.type === "text" ? (
                <Textarea
                  id={config.key}
                  name={config.key}
                  defaultValue={config.value}
                  className="w-full"
                  rows={3}
                  placeholder={config.description}
                />
              ) : config.type === "image" ? (
                <div className="space-y-2">
                  <Input
                    id={config.key}
                    name={config.key}
                    type="text"
                    defaultValue={config.value}
                    className="w-full"
                    placeholder="URL de l'image ou chemin vers /public"
                  />
                  {config.value && (
                    <div className="mt-2">
                      <Image
                        src={config.value}
                        alt="Aperçu"
                        className="max-w-xs h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  id={config.key}
                  name={config.key}
                  type="text"
                  defaultValue={config.value}
                  className="w-full"
                />
              )}

              <p className="text-xs text-gray-500">Clé: {config.key}</p>
            </div>
          ))}

          <div className="flex gap-4 pt-6 border-t">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isSaving}
            >
              Annuler
            </Button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">💡 Conseils</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Pour les images, utilisez des URLs complètes ou des chemins
              relatifs depuis /public
            </li>
            <li>
              • Les modifications sont visibles immédiatement sur la page
              d&#39;accueil
            </li>
            <li>• Utilisez des textes courts et accrocheurs pour les titres</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
