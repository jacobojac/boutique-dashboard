"use client";

import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { CheckCircle, X } from "lucide-react";
import Image from "next/image";

interface UploadImagesProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function UploadImages({ value, onChange }: UploadImagesProps) {
  const handleUploadComplete = (newUrls: string[]) => {
    onChange([...value, ...newUrls]);
  };

  const handleRemoveImage = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-8 mt-20">
      {/* Version complète avec preview */}
      <div className="max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">Images du produit</h3>
        <ImageUpload
          maxFiles={1}
          onUploadComplete={handleUploadComplete}
        />

        {/* Aperçu des images uploadées */}
        {value.length > 0 && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {value.length} image
                {value.length > 1 ? "s" : ""} uploadée
                {value.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {value.map((url, index) => (
                <div key={url} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden border bg-gray-50">
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(url)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
