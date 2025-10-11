// components/ui/image-upload.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/utils/uploadthing";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";
import { useState } from "react";

interface ImageUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onUploadComplete,
  maxFiles = 1,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = (res: { url: string }[]) => {
    const urls = res.map((file) => file.url);
    setUploadedImages((prev) => [...prev, ...urls]);
    setIsUploading(false);
    setUploadError(null);
    onUploadComplete?.(urls);
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    setUploadError(error.message);
    setIsUploading(false);
  };


  const canUploadMore = uploadedImages.length < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-4">
        <Label htmlFor="image-upload mb-4">
          Images {maxFiles > 1 && `(${uploadedImages.length}/${maxFiles})`}
        </Label>

        {/* Zone d'upload personnalisée */}
        <Card
          className={cn(
            "border-dashed border-2 transition-colors",
            isUploading && "border-blue-300 bg-blue-50",
            uploadError && "border-red-300 bg-red-50",
            !canUploadMore && "opacity-50"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-600">Upload en cours...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {canUploadMore
                      ? "Glissez vos images ici ou cliquez pour sélectionner"
                      : "Limite d'upload atteinte"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG jusqu&#39;à 4MB
                  </p>
                </div>
              </>
            )}

            {canUploadMore && !disabled && (
              <div className="mt-4">
                <UploadButton
                  endpoint="imageUploader" // Remplacez par votre endpoint
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  onUploadBegin={() => {
                    setIsUploading(true);
                    setUploadError(null);
                  }}
                  appearance={{
                    button: cn(
                      "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      "transition-colors duration-200",
                      "ut-ready:bg-blue-600 ut-uploading:bg-blue-700",
                      "ut-uploading:after:bg-blue-400"
                    ),
                    container: "flex items-center justify-center",
                    allowedContent: "hidden",
                  }}
                  content={{
                    button: ({ ready, isUploading }) => {
                      if (isUploading)
                        return (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Upload...
                          </div>
                        );
                      if (ready)
                        return (
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            {/* Choisir {multiple ? "des images" : "une image"} */}
                            Choisir
                          </div>
                        );
                      return "Préparation...";
                    },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages d'erreur */}
        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>Erreur: {uploadError}</span>
          </div>
        )}
      </div>

    </div>
  );
}

// Version simplifiée pour un usage basique
export function SimpleImageUpload({
  onUploadComplete,
}: {
  onUploadComplete?: (url: string) => void;
}) {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        onUploadComplete?.(res[0]?.url);
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`);
      }}
      appearance={{
        button: cn(
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "px-4 py-2 rounded-md font-medium",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "transition-colors duration-200"
        ),
        container: "w-full max-w-none",
        allowedContent: "text-xs text-muted-foreground mt-2",
      }}
      content={{
        button: ({ ready, isUploading }) => {
          if (isUploading) return "Upload...";
          if (ready) return "Choisir une image";
          return "Préparation...";
        },
      }}
    />
  );
}
