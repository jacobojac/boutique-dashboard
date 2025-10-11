"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadThing } from "@/utils/uploadthing";
import { Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface SingleImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
}

export function SingleImageUploader({
  value,
  onChange,
  label,
  description,
}: SingleImageUploaderProps) {
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);

  // Hook UploadThing utilisant l'endpoint existant qui fonctionne
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onChange(res[0].url);
        toast.success("Image uploadée avec succès");
        setIsUploading(false);
      }
    },
    onUploadError: (error: Error) => {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'upload");
      setIsUploading(false);
    },
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    setIsUploading(true);
    try {
      await startUpload([file]);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload");
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-gray-500">{description}</p>}

      {/* Mode selection */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadMode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMode("url")}
        >
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setUploadMode("upload")}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* URL Mode */}
      {uploadMode === "url" && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg ou /images/image.jpg"
          className="w-full"
        />
      )}

      {/* Upload Mode */}
      {uploadMode === "upload" && !value && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
          <div className="text-center space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-semibold text-gray-900">
                  {isUploading
                    ? "Upload en cours..."
                    : "Cliquez pour uploader une image"}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  PNG, JPG, WebP jusqu&#39;à 4MB
                </span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="space-y-3">
          <div className="relative border rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Aperçu :</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeImage}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="relative w-full max-w-xs mx-auto">
              <Image
                src={value}
                alt="Aperçu"
                width={300}
                height={200}
                className="w-full h-auto max-h-32 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <div className="w-full h-32 bg-gray-100 border rounded flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  Image non disponible
                </span>
              </div>
            </div>
          </div>

          {/* Show URL for reference */}
          <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
            URL: {value}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500">
        <p>
          💡 <strong>Conseils :</strong>
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>URL :</strong> Utilisez une URL complète ou un chemin
            /images/
          </li>
          <li>
            <strong>Upload :</strong> Les images sont hébergées sur UploadThing
          </li>
          <li>
            <strong>Format :</strong> JPG, PNG, WebP recommandés
          </li>
          <li>
            <strong>Taille :</strong> Maximum 4MB
          </li>
        </ul>
      </div>
    </div>
  );
}
