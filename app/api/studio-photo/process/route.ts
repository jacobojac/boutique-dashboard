import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

const googleImageModel = "gemini-3-pro-image-preview";

const getAiClient = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY n'est pas configurée");
  }
  return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return {
    inlineData: { data: base64, mimeType: file.type },
  };
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const ai = getAiClient();
    const imagePart = await fileToGenerativePart(file);

    const prompt = `Given this image of a fashion product, isolate the product with clean, precise edges. Remove the original background completely. Replace it with a solid, uniform background, specifically the hex color #F6F4F2. The final output must be just the image of the isolated product on the new background. Do not add any text or other elements.`;

    const response = await ai.models.generateContent({
      model: googleImageModel,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: { aspectRatio: "1:1" },
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      return NextResponse.json({
        processedImage: firstPart.inlineData.data,
      });
    }

    throw new Error(
      "Le modèle n'a pas retourné d'image lors du traitement."
    );
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du traitement de l'image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
