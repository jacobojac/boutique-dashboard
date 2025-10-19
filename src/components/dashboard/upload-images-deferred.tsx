// Claude Code: Sign
"use client";

import { Button } from "@/components/ui/button";
import { useImageUploadStore } from "@/store/ImageUploadStore";
import { ArrowLeft, ArrowRight, GripVertical, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface UploadImagesDeferredProps {
  value: string[]; // URLs déjà uploadées (pour compatibilité)
  onChange: (urls: string[]) => void; // Callback pour informer le parent des changements
  maxFiles?: number;
}

export default function UploadImagesDeferred({
  value = [],
  onChange,
  maxFiles = 8,
}: UploadImagesDeferredProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { pendingImages, addPendingImage, removePendingImage, reorderPendingImages } =
    useImageUploadStore();

  // Utiliser les images du parent (value) comme base - ce sont les images persistantes
  const totalImages = value.length + pendingImages.length;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      files.forEach((file) => {
        if (file.type.startsWith("image/") && totalImages < maxFiles) {
          addPendingImage(file);
        }
      });

      // Reset l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addPendingImage, totalImages, maxFiles]
  );

  const handleRemovePendingImage = useCallback(
    (id: string) => {
      removePendingImage(id);
    },
    [removePendingImage]
  );

  const handleRemoveUploadedUrl = useCallback(
    (url: string) => {
      // Mettre à jour le parent directement
      const newUrls = value.filter((u) => u !== url);
      onChange(newUrls);
    },
    [value, onChange]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Fonctions de drag & drop pour réorganiser les images
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      const newImages = [...value];
      const draggedImage = newImages[draggedIndex];

      // Supprimer l'image de son ancienne position
      newImages.splice(draggedIndex, 1);

      // L'insérer à la nouvelle position
      newImages.splice(dropIndex, 0, draggedImage);

      onChange(newImages);
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, value, onChange]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Fonctions pour les flèches de navigation
  const moveImageLeft = useCallback(
    (index: number) => {
      if (index <= 0) return;

      const newImages = [...value];
      [newImages[index - 1], newImages[index]] = [
        newImages[index],
        newImages[index - 1],
      ];
      onChange(newImages);
    },
    [value, onChange]
  );

  const moveImageRight = useCallback(
    (index: number) => {
      if (index >= value.length - 1) return;

      const newImages = [...value];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      onChange(newImages);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Images du produit</h3>
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={totalImages >= maxFiles}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Ajouter des images
        </Button>
      </div>
      <label htmlFor="product-images-upload" className="sr-only">
        Ajouter des images du produit
      </label>
      <input
        ref={fileInputRef}
        id="product-images-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {totalImages}/{maxFiles} images sélectionnées
        </span>
        {value.length > 1 && (
          <span className="hidden md:inline text-blue-600 text-xs">
            Glissez-déposez pour réorganiser
          </span>
        )}
      </div>

      {/* Grille des images */}
      {(pendingImages.length > 0 || value.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Images du parent (persistantes) */}
          {value.map((url, index) => (
            <div
              key={`uploaded-${url}`}
              className={`relative group cursor-move ${
                draggedIndex === index ? "opacity-50" : ""
              } ${dragOverIndex === index ? "ring-2 ring-blue-400" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="aspect-square relative rounded-lg overflow-hidden border bg-gray-50">
                {index === 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Principal
                    </div>
                  </div>
                )}

                <Image
                  src={url}
                  alt={`Image uploadée ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />

                {/* Overlay de contrôles */}
                <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    {/* Bouton déplacer à gauche */}
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImageLeft(index);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Icône de drag */}
                    <div className="h-8 w-8 bg-white/90 rounded-md flex items-center justify-center">
                      <GripVertical className="h-4 w-4 text-gray-600" />
                    </div>

                    {/* Bouton déplacer à droite */}
                    {index < value.length - 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImageRight(index);
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bouton de suppression */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveUploadedUrl(url);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Boutons de navigation */}
              <div className="w-full flex items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  disabled={index === 0 || value.length === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImageLeft(index);
                  }}
                  aria-label="Déplacer l'image vers la gauche"
                  title="Déplacer vers la gauche"
                  className="p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5">
                  {index === 0 && value.length > 0 && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" title="Image principale"></div>
                  )}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {index + 1}/{value.length}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={index === value.length - 1 || value.length === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImageRight(index);
                  }}
                  aria-label="Déplacer l'image vers la droite"
                  title="Déplacer vers la droite"
                  className="p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}

          {/* Images en attente */}
          {pendingImages.map((pending, pendingIndex) => (
            <div key={`pending-${pending.id}`} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border bg-gray-50">
                <Image
                  src={pending.preview}
                  alt="Image en attente"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-black/10 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    En attente
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                  onClick={() => handleRemovePendingImage(pending.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Badge "En attente" visible sur mobile */}
                <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
                  En attente
                </div>
              </div>

              {/* Boutons de navigation pour images en attente */}
              <div className="w-full flex items-center justify-center gap-2 mt-2">
                <button
                  type="button"
                  disabled={pendingIndex === 0 || pendingImages.length === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderPendingImages(pendingIndex, pendingIndex - 1);
                  }}
                  aria-label="Déplacer l'image en attente vers la gauche"
                  title="Déplacer vers la gauche"
                  className="p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" title="Image en attente"></div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {value.length + pendingIndex + 1}/{totalImages}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={pendingIndex === pendingImages.length - 1 || pendingImages.length === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderPendingImages(pendingIndex, pendingIndex + 1);
                  }}
                  aria-label="Déplacer l'image en attente vers la droite"
                  title="Déplacer vers la droite"
                  className="p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalImages === 0 && (
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <p className="text-gray-600">
            Cliquez pour ajouter des images ou glissez-déposez
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Maximum {maxFiles} images
          </p>
        </div>
      )}

      {/* Messages d'aide */}
      {value.length > 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GripVertical className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Réorganiser les images
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>
                  • La première image sera utilisée comme image principale
                </li>
                <li className="hidden md:block">• Glissez-déposez les images pour les réorganiser</li>
                <li>• Utilisez les flèches ← → pour déplacer une image</li>
                <li>• L&#39;ordre sera sauvegardé automatiquement</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {pendingImages.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-700 font-medium">
              {pendingImages.length} image{pendingImages.length > 1 ? "s" : ""}{" "}
              en attente d&#39;upload
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Les images seront uploadées lors de l&#39;enregistrement du produit
          </p>
        </div>
      )}
    </div>
  );
}
