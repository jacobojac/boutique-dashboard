"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Wand2, Download, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CLOTHING_STYLES,
  SHOE_STYLES,
  LEATHER_GOODS_STYLES,
} from "@/lib/studio-photo/constants";
import type {
  ImageKey,
  ProductType,
  ModelGender,
  ModelEthnicity,
  ModelBeard,
  Style,
  GeneratedImages,
} from "@/lib/studio-photo/types";

type ImageType = ImageKey;

export default function StudioPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImageBase64, setProcessedImageBase64] = useState<string | null>(null);

  // Generation parameters
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [modelGender, setModelGender] = useState<ModelGender | null>(null);
  const [modelEthnicity, setModelEthnicity] = useState<ModelEthnicity | null>(null);
  const [modelBeard, setModelBeard] = useState<ModelBeard>(null);

  // Get styles based on product type
  const availableStyles = useMemo(() => {
    switch (productType) {
      case "shoes":
        return SHOE_STYLES;
      case "leather":
        return LEATHER_GOODS_STYLES;
      case "clothing":
      default:
        return CLOTHING_STYLES;
    }
  }, [productType]);

  const [selectedStyle, setSelectedStyle] = useState<Style>(CLOTHING_STYLES[0]);

  // Generated images
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({});

  // Images to generate selection
  const [selectedImages, setSelectedImages] = useState<ImageType[]>([
    "productOnly",
    "full",
    "closeup",
  ]);

  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState<ImageType | null>(null);

  // Reset style when product type changes
  useEffect(() => {
    setSelectedStyle(availableStyles[0]);
  }, [availableStyles]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImageBase64(null);
      setGeneratedImages({});
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez déposer une image");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImageBase64(null);
      setGeneratedImages({});
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleProcessImage = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/studio-photo/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors du traitement de l'image");
      }

      const data = await response.json();
      setProcessedImageBase64(data.processedImage);
      toast.success("Image traitée avec succès");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Erreur lors du traitement de l'image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleImage = (imageType: ImageType) => {
    setSelectedImages((prev) => {
      if (prev.includes(imageType)) {
        return prev.filter((type) => type !== imageType);
      } else {
        return [...prev, imageType];
      }
    });
  };

  const handleGenerateImages = async () => {
    if (!processedImageBase64) {
      toast.error("Veuillez d'abord traiter l'image");
      return;
    }

    if (!productType) {
      toast.error("Veuillez sélectionner un type de produit");
      return;
    }

    if (!modelGender) {
      toast.error("Veuillez sélectionner le genre du modèle");
      return;
    }

    if (!modelEthnicity) {
      toast.error("Veuillez sélectionner l'origine du modèle");
      return;
    }

    if (selectedImages.length === 0) {
      toast.error("Veuillez sélectionner au moins une image à générer");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/studio-photo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processedImageBase64,
          productType,
          modelGender,
          modelEthnicity,
          modelBeard,
          style: selectedStyle,
          keysToGenerate: selectedImages,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération des images");
      }

      const data = await response.json();
      setGeneratedImages(data.images);
      toast.success("Images générées avec succès");
    } catch (error) {
      console.error("Error generating images:", error);
      toast.error("Erreur lors de la génération des images");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = async (imageKey: ImageType) => {
    if (!processedImageBase64) return;

    setRegeneratingKey(imageKey);
    try {
      const response = await fetch("/api/studio-photo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processedImageBase64,
          productType,
          modelGender,
          modelEthnicity,
          modelBeard,
          style: selectedStyle,
          keysToGenerate: [imageKey],
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la régénération");
      }

      const data = await response.json();
      setGeneratedImages((prev) => ({ ...prev, ...data.images }));
      toast.success("Image régénérée avec succès");
    } catch (error) {
      console.error("Error regenerating image:", error);
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegeneratingKey(null);
    }
  };

  const handleDownloadImage = (base64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = filename;
    link.click();
  };

  const imageCards = [
    {
      key: "productOnly" as ImageType,
      title: "Produit seul",
      description: "Photo produit sur fond blanc",
    },
    {
      key: "full" as ImageType,
      title: "Vue complète",
      description: "Modèle en pied avec le produit",
    },
    {
      key: "closeup" as ImageType,
      title: "Focus produit",
      description: "Gros plan sur le produit porté",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Studio Photo</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Image du produit</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {previewUrl ? (
                    <div className="space-y-2">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-muted-foreground">
                        Cliquer ou déposer pour changer
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Cliquer ou déposer une image
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {selectedFile && (
              <>
                {/* Product Type */}
                <div className="space-y-2">
                  <Label>Type de produit</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={productType === "clothing" ? "default" : "outline"}
                      onClick={() => setProductType("clothing")}
                      className="w-full"
                    >
                      Vêtement
                    </Button>
                    <Button
                      type="button"
                      variant={productType === "shoes" ? "default" : "outline"}
                      onClick={() => setProductType("shoes")}
                      className="w-full"
                    >
                      Chaussures
                    </Button>
                    <Button
                      type="button"
                      variant={productType === "leather" ? "default" : "outline"}
                      onClick={() => setProductType("leather")}
                      className="w-full"
                    >
                      Maroquinerie
                    </Button>
                  </div>
                </div>

                {productType && (
                  <>
                    {/* Style */}
                    <div className="space-y-2">
                      <Label>Style</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedStyle(availableStyles[0])}
                          className="shrink-0"
                        >
                          Automatique
                        </Button>
                        <Select
                          value={selectedStyle.name}
                          onValueChange={(name) => {
                            const style = availableStyles.find((s) => s.name === name);
                            if (style) setSelectedStyle(style);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStyles.map((style) => (
                              <SelectItem key={style.name} value={style.name}>
                                {style.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Model Gender */}
                    <div className="space-y-2">
                      <Label>Genre du modèle</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={modelGender === "female" ? "default" : "outline"}
                          onClick={() => setModelGender("female")}
                          className="w-full"
                        >
                          Femme
                        </Button>
                        <Button
                          type="button"
                          variant={modelGender === "male" ? "default" : "outline"}
                          onClick={() => setModelGender("male")}
                          className="w-full"
                        >
                          Homme
                        </Button>
                      </div>
                    </div>

                    {/* Beard (only for male) */}
                    {modelGender === "male" && (
                      <div className="space-y-2">
                        <Label>Style de barbe</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={modelBeard === "beard" ? "default" : "outline"}
                            onClick={() => setModelBeard("beard")}
                            className="w-full"
                          >
                            Avec barbe
                          </Button>
                          <Button
                            type="button"
                            variant={modelBeard === "no_beard" ? "default" : "outline"}
                            onClick={() => setModelBeard("no_beard")}
                            className="w-full"
                          >
                            Sans barbe
                          </Button>
                        </div>
                      </div>
                    )}

                    {modelGender && (
                      <div className="space-y-2">
                        <Label>Origine du modèle</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={modelEthnicity === "Maghrebi" ? "default" : "outline"}
                            onClick={() => setModelEthnicity("Maghrebi")}
                            className="w-full"
                          >
                            Maghrébin
                          </Button>
                          <Button
                            type="button"
                            variant={modelEthnicity === "African" ? "default" : "outline"}
                            onClick={() => setModelEthnicity("African")}
                            className="w-full"
                          >
                            Africain
                          </Button>
                          <Button
                            type="button"
                            variant={modelEthnicity === "Latin" ? "default" : "outline"}
                            onClick={() => setModelEthnicity("Latin")}
                            className="w-full"
                          >
                            Latino
                          </Button>
                          <Button
                            type="button"
                            variant={modelEthnicity === "Asian" ? "default" : "outline"}
                            onClick={() => setModelEthnicity("Asian")}
                            className="w-full"
                          >
                            Asiatique
                          </Button>
                          <Button
                            type="button"
                            variant={modelEthnicity === "European" ? "default" : "outline"}
                            onClick={() => setModelEthnicity("European")}
                            className="w-full col-span-2"
                          >
                            Européen
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Process Image Button */}
                    {modelEthnicity && !processedImageBase64 && (
                      <Button
                        onClick={handleProcessImage}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Traitement de l'image...
                          </>
                        ) : (
                          "Traiter l'image"
                        )}
                      </Button>
                    )}
                  </>
                )}

                {/* Images to generate */}
                {processedImageBase64 && productType && modelGender && modelEthnicity && (
                  <>
                    <div className="space-y-2">
                      <Label>Images à générer</Label>
                      <div className="space-y-3 border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="productOnly"
                            checked={selectedImages.includes("productOnly")}
                            onCheckedChange={() => handleToggleImage("productOnly")}
                          />
                          <label
                            htmlFor="productOnly"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Produit seul
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="full"
                            checked={selectedImages.includes("full")}
                            onCheckedChange={() => handleToggleImage("full")}
                          />
                          <label
                            htmlFor="full"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Vue complète
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="closeup"
                            checked={selectedImages.includes("closeup")}
                            onCheckedChange={() => handleToggleImage("closeup")}
                          />
                          <label
                            htmlFor="closeup"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Focus produit
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateImages}
                      disabled={
                        isGenerating ||
                        !productType ||
                        !modelGender ||
                        !modelEthnicity ||
                        selectedImages.length === 0
                      }
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Générer les images
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Generated Images */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {imageCards.map((card) => {
              const imageData = generatedImages[card.key];
              const isRegenerating = regeneratingKey === card.key;

              return (
                <Card key={card.key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {imageData ? (
                        <Image
                          src={`data:image/png;base64,${imageData}`}
                          alt={card.title}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          En attente de génération
                        </p>
                      )}
                    </div>

                    {imageData && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateImage(card.key)}
                          disabled={isRegenerating || isGenerating}
                          className="flex-1"
                        >
                          {isRegenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                              Régénération...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3" />
                              Régénérer
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadImage(
                              imageData,
                              `${card.key}-${Date.now()}.png`
                            )
                          }
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
