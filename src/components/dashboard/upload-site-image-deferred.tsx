"use client";

import { Button } from "@/components/ui/button";
import { useImageUploadStore } from "@/store/ImageUploadStore";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef } from "react";

interface UploadSiteImageDeferredProps {
  value: string; // URL déjà uploadée
  onChange: (url: string) => void; // Callback pour informer le parent des changements
  label: string;
  description?: string;
  imageKey: string; // Clé unique pour identifier cette image dans le store
}

export default function UploadSiteImageDeferred({
  value = "",
  onChange,
  label,
  description,
  imageKey,
}: UploadSiteImageDeferredProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    pendingImages,
    addPendingImage,
    removePendingImage,
    removeUploadedUrl,
  } = useImageUploadStore();

  // Trouver l'image en attente pour cette clé spécifique
  const currentPendingImage = pendingImages.find((img) =>
    img.id.startsWith(imageKey)
  );
  const hasImage = value || currentPendingImage;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file && file.type.startsWith("image/")) {
        // Supprimer l'image en attente précédente s'il y en a une pour cette clé
        if (currentPendingImage) {
          removePendingImage(currentPendingImage.id);
        }

        // Créer un ID unique avec la clé d'image
        const customId = `${imageKey}_${Math.random()
          .toString(36)
          .substring(7)}`;

        // Ajouter avec un ID personnalisé
        addPendingImage(file, customId);
      }

      // Reset l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addPendingImage, removePendingImage, currentPendingImage, imageKey]
  );

  const handleRemovePendingImage = useCallback(() => {
    if (currentPendingImage) {
      removePendingImage(currentPendingImage.id);
    }
  }, [removePendingImage, currentPendingImage]);

  const handleRemoveUploadedImage = useCallback(() => {
    if (value) {
      removeUploadedUrl(value);
      onChange("");
    }
  }, [removeUploadedUrl, value, onChange]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">{label}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {!hasImage && (
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            className="gap-2"
            size="sm"
          >
            <Upload className="h-4 w-4" />
            Sélectionner
          </Button>
        )}
      </div>
      <label htmlFor="product-images-deferred" className="sr-only">
        Ajouter des images du produit
      </label>
      <input
        ref={fileInputRef}
        id="product-images-deferred"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {hasImage ? (
        <div className="relative group">
          <div className="aspect-video relative rounded-lg overflow-hidden border bg-gray-50 max-w-xs">
            <Image
              src={currentPendingImage ? currentPendingImage.preview : value}
              alt={label}
              fill
              className="object-cover"
            />
            {currentPendingImage && (
              <div className="absolute top-0 left-0 w-full h-full bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  En attente
                </div>
              </div>
            )}
            {value && !currentPendingImage && (
              <div className="absolute top-0 left-0 w-full h-full bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Uploadée
                </div>
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={
                currentPendingImage
                  ? handleRemovePendingImage
                  : handleRemoveUploadedImage
              }
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              size="sm"
            >
              Changer
            </Button>

            {currentPendingImage && (
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1">
                <span className="text-xs text-blue-700 font-medium">
                  En attente
                </span>
              </div>
            )}
          </div>

          {/* URL pour référence */}
          {value && !currentPendingImage && (
            <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded mt-2">
              URL: {value}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer max-w-xs"
        >
          <Upload className="mx-auto h-6 w-6 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">
            Cliquez pour ajouter une image
          </p>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (max 4MB)</p>
        </div>
      )}

      {currentPendingImage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">
              Image en attente d&#39;upload
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            L&#39;image sera uploadée lors de la sauvegarde
          </p>
        </div>
      )}

      {/* Mode URL alternative */}
      <div className="border-t pt-3">
        <p className="text-xs text-gray-500 mb-2">
          Ou saisissez une URL directement :
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg ou /images/image.jpg"
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
