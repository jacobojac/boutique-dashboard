"use client";

import { Button } from "@/components/ui/button";
import { useImageUploadStore } from "@/store/ImageUploadStore";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef } from "react";

interface UploadImageDeferredProps {
  value: string; // URL déjà uploadée
  onChange: (url: string) => void; // Callback pour informer le parent des changements
}

export default function UploadImageDeferred({
  value = "",
  onChange,
}: UploadImageDeferredProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    pendingImages,
    uploadedUrls,
    addPendingImage,
    removePendingImage,
    removeUploadedUrl,
  } = useImageUploadStore();

  // Pour les collections, on ne prend que la première image en attente
  const currentPendingImage = pendingImages[0];
  const hasImage = value || currentPendingImage;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file && file.type.startsWith("image/")) {
        // Supprimer l'image en attente précédente s'il y en a une
        if (currentPendingImage) {
          removePendingImage(currentPendingImage.id);
        }

        addPendingImage(file);
      }

      // Reset l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addPendingImage, removePendingImage, currentPendingImage]
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Image de la collection</h3>
        {!hasImage && (
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            className="gap-2"
            size="sm"
          >
            <Upload className="h-4 w-4" />
            Sélectionner une image
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {hasImage ? (
        <div className="relative group">
          <div className="aspect-video relative rounded-lg overflow-hidden border bg-gray-50 max-w-md">
            <Image
              src={currentPendingImage ? currentPendingImage.preview : value}
              alt="Image de collection"
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
                <div className="bg-white/90 text-xs px-2 py-1 rounded">
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
              Changer l&#39;image
            </Button>

            {currentPendingImage && (
              <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1">
                <span className="text-xs text-blue-700 font-medium">
                  En attente d&#39;upload
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer max-w-md"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <p className="text-gray-600">Cliquez pour ajouter une image</p>
          <p className="text-sm text-gray-500 mt-2">
            Format: JPG, PNG, WebP (max 4MB)
          </p>
        </div>
      )}

      {currentPendingImage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-700 font-medium">
              Image en attente d&#39;upload
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            L&#39;image sera uploadée lors de l&#39;enregistrement de la
            collection
          </p>
        </div>
      )}
    </div>
  );
}
