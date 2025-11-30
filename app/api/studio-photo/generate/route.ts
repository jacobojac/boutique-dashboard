import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

const googleImageModel = "gemini-3-pro-image-preview";

type ImageKey = "productOnly" | "full" | "closeup";
type ProductType = "clothing" | "shoes" | "leather";
type ModelGender = "male" | "female";
type ModelEthnicity = "white" | "black" | "asian" | "mixed" | "Maghrebi";
type ModelBeard = "beard" | "no_beard" | null;
type Style = {
  name: string;
  description: string;
};

const getAiClient = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY n'est pas configurée");
  }
  return new GoogleGenAI({ apiKey });
};

const base64ToGenerativePart = (
  base64: string,
  mimeType: string = "image/png"
) => {
  return {
    inlineData: { data: base64, mimeType },
  };
};

const HAIR_STYLES = [
  "Short textured crop",
  "Long flowing natural hair",
  "Slicked back ponytail",
  "Buzz cut fade",
  "Shoulder-length sharp bob",
  "Braided intricate hairstyle",
  "Messy chic bun",
  "Curly natural afro",
  "Wavy mid-length hair",
  "Clean side-part",
];

const FACE_FEATURES = [
  "High cheekbones, sharp jawline",
  "Soft facial features, natural look",
  "Distinct eyebrows, intense gaze",
  "Freckles, warm expression",
  "Angular face structure, model look",
  "Round face, youthful appearance",
  "Strong chin, defined features",
  "Elegant and symmetrical features",
];

const getRandomElement = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      processedImageBase64,
      style,
      productType,
      modelGender,
      modelEthnicity,
      modelBeard,
      keysToGenerate = ["full", "closeup", "productOnly"],
    }: {
      processedImageBase64: string;
      style: Style;
      productType: ProductType;
      modelGender: ModelGender;
      modelEthnicity: ModelEthnicity;
      modelBeard: ModelBeard;
      keysToGenerate: ImageKey[];
    } = body;

    if (!processedImageBase64) {
      return NextResponse.json(
        { error: "Image traitée non fournie" },
        { status: 400 }
      );
    }

    const ai = getAiClient();
    const randomHair = getRandomElement(HAIR_STYLES);
    const randomFace = getRandomElement(FACE_FEATURES);

    let beardInstruction = "";
    if (modelGender === "male") {
      if (modelBeard === "beard") {
        beardInstruction =
          "The model must have a light stubble beard (barbe de 3 jours), well-groomed and masculine.";
      } else if (modelBeard === "no_beard") {
        beardInstruction =
          "The model must be completely clean-shaven, with absolutely no beard or mustache.";
      }
    }

    const safeStyleDescription = style.description.replace(
      /outdoor|nature|mountain|street|city/gi,
      "studio fashion"
    );

    const buildCommonPrompt = (key: ImageKey) => `
      You are a world-class fashion photographer working for a luxury sportswear brand.
      **Task:** Create a premium e-commerce photo of a model wearing the provided product.

      **Input:** Use the product shown in the image. The product MUST be perfectly preserved (color, texture, logo, shape).

      **Model:**
      - Gender: ${modelGender}.
      - Ethnicity: ${modelEthnicity}.
      - **Hair:** ${randomHair}.
      - **Face:** ${randomFace}. ${beardInstruction}
      - Look: Professional, fit, elegant.
      - Style: **Sportswear Chic**.
      - Outfit: The model is wearing the product.
      - **CRITICAL STYLING RULE:** If the product is a jacket, coat, down jacket (doudoune), or shirt, the model MUST wear it **FULLY CLOSED** (zipped up or buttoned up). Do not style it open.
      - **Pairing:** **Paired with a trendy mix of sportswear and casual chic items** (e.g., tailored joggers, premium denim, architectural sneakers, or minimalist layers) to create a high-end look. The style must resemble high-end luxury fashion catalogs (clean, minimalist, premium).

      **Studio Setting (ABSOLUTE PRIORITY - NON-NEGOTIABLE):**
      - **LOCATION:** The shoot takes place in a **WINDOWLESS INDOOR PHOTO STUDIO**.
      - **Background:** **SOLID, FLAT, MATTE, UNIFORM BACKGROUND**. Color hex code strictly **#F6F4F2**.
      - **Texture:** The background must be perfectly smooth wall paint. No clouds, no gradients, no texture, no outdoors.
      - **NEGATIVE CONSTRAINTS:** **ABSOLUTELY NO NATURE.** Do NOT generate mountains, sky, snow, grass, rocks, trees, streets, buildings, or rooms. Even if the product looks like outdoor gear, you MUST place it in a sterile studio environment.
      - **Override:** Ignore any location suggestions from the "Sportswear" theme. The theme applies ONLY to the model's outfit and attitude, NOT the environment.
      - **Output:** A flattened image with **NO alpha channel** (no transparency).

      **Quality:** 1k resolution, photorealistic, highly detailed, masterpiece.
    `;

    const fullBodyPrompt = `
      ${buildCommonPrompt("full")}
      **Shot Type:** Full Body Shot (or 3/4 length).
      **Instructions:** The model is standing confidently. Ensure the product is fully visible and naturally worn. The pose should be elegant and strong, centered in the square frame.
    `;

    const closeupPrompt = `
      ${buildCommonPrompt("closeup")}
      **Shot Type:** **Close-Up on Model (Zoomed In)**.
      **Instructions:**
      - **Core Requirement:** The product MUST be worn by the model. This is NOT a product-only shot; it is a detail shot of the model wearing the item.
      - **Framing & Zoom:**
          - **Zoom:** significant zoom on the product itself to show texture and details.
          - ${
            productType === "shoes"
              ? "Camera at ankle height. Focus on the shoes on the model's feet. Show the interaction with the pants cuff."
              : "Frame the shot from the chin to the hips. Focus on the chest/torso area where the product is worn. Cut the head just above the chin to focus on the garment."
          }
      - **Composition:** The product is the main subject, filling most of the square frame, but the model's body provides the structure and fit.
    `;

    const productOnlyPrompt_default = `
      You are an AI specialized in **E-commerce Packshots**.
      **Task:** Generate a perfectly isolated product on a pure white background.

      **Instructions for the final image:**
      1.  **Composition:** Square format (1:1).
      2.  **Angle:** Front-facing.
      3.  **Background:** **SOLID PURE WHITE (#FFFFFF)**.
          - **TECHNIQUE:** Digital Background Replacement.
          - **RESULT:** The background must be uniformly #FFFFFF (RGB 255,255,255).
          - **NO GRADIENTS/NO SHADOWS:** No floor, no vignette.
      4.  **Lighting:** Neutral, even studio lighting.
      5.  **Framing:** Centered, approx 75% width.
      6.  **Fidelity:** Perfect replica of the product.
    `;

    const productOnlyPrompt_clothing = `
      You are an AI specialized in **E-commerce Packshots**.
      **Task:** Generate a perfectly isolated clothing item on a pure white background.

      **Instructions for the final image:**
      1.  **Subject:** The clothing item provided.
      2.  **Angle:** **Perfect Front-Facing**. Straight on.
      3.  **Background:** **SOLID PURE WHITE (#FFFFFF)**.
          - **TECHNIQUE:** **Digital Background Replacement**.
          - **RESULT:** The background must be uniformly #FFFFFF (RGB 255,255,255).
          - **NO FLOOR:** Do NOT render a floor or wall. It is a digital fill.
      4.  **Shadows:** **NO SHADOWS**. Flat lay / Ghost mannequin style.
      5.  **Framing:** Centered, approx 75% width.
    `;

    const productOnlyPrompt_shoes = `
      You are an AI specialized in **Technical E-commerce Photography**.
      **Task:** Generate a standardized catalog image of a pair of shoes with strict geometric consistency.

      **CRITICAL: YOU MUST ALIGN THE SHOES TO A FIXED VIRTUAL GRID.**

      1.  **Camera & Geometry (GRID LOCK):**
          - **View:** **PURE SIDE PROFILE (Vue de Profil Stricte)**.
          - **Orientation:** Pointing **RIGHT**.
          - **Camera Position:** **GROUND LEVEL (0 Degrees)**. The camera is placed low, perfectly parallel to the ground. NOT looking down.
          - **Horizontal Alignment:** The soles must be perfectly flat and parallel to the horizon.
          - **Vertical Anchor (Flotation Line):** The bottom of the soles MUST be positioned at **70% of the image height** (meaning 30% of the image is empty white space BELOW the shoes).
          - **Scale (Width):** The total width of the pair (foreground + background shoe) must occupy **EXACTLY 55%** of the image width.

      2.  **Subject Arrangement:**
          - **Pose:** **STAGGERED PROFILE (Décalé)**.
          - Place one shoe in the foreground (fully visible profile).
          - Place the other shoe slightly behind and offset.
          - Both pointing RIGHT.
          - This ensures a consistent compact shape.

      3.  **Background & Lighting:**
          - **BACKGROUND:** **SOLID #FFFFFF** (Pure White).
          - **TECHNIQUE:** **Digital Background Replacement**. Do NOT photograph a floor.
          - **RESULT:** The background must be RGB(255,255,255) everywhere.
          - **LIGHTING:** Soft, even, studio lighting.

      4.  **Shadows:**
          - **GOAL:** Ground the shoes at the 70% line.
          - **TYPE:** **Soft Contact Shadow Only**.
          - **APPEARANCE:** A small, blurred light gray shadow directly under the soles.
          - **TRANSITION:** The shadow must fade quickly into the pure white background.
    `;

    const productOnlyPrompt_leather = `
      You are an AI specialized in **E-commerce Packshots**.
      **Task:** Generate a perfectly isolated leather product on a pure white background.

      1.  **Subject:** The specific bag/wallet/accessory provided.
          - Fidelity: Exact replica of material and details.

      2.  **Geometry (LOCKED):**
          - **View:** Front view, slightly elevated (approx 15 degrees).
          - **Lens:** 85mm (flat perspective).
          - **Scale:** Product width is approx 50-60% of image width.
          - **Centering:** Perfectly centered.

      3.  **Background & Lighting:**
          - **BACKGROUND:** **SOLID #FFFFFF** (Pure White).
          - **TECHNIQUE:** **Digital Background Replacement**. Do NOT photograph a floor.
          - **RESULT:** The background must be RGB(255,255,255) everywhere.
          - **LIGHTING:** Soft, even, studio lighting.

      4.  **Shadows:**
          - **TYPE:** **Soft Contact Shadow** (Ambient Occlusion).
          - **PLACEMENT:** Strictly underneath the object.
          - **OPACITY:** Low. Just enough to prevent floating.
          - **NO CAST SHADOWS:** The shadow must NOT extend outwards.
    `;

    let productOnlyPrompt = productOnlyPrompt_default;
    if (productType === "shoes") {
      productOnlyPrompt = productOnlyPrompt_shoes;
    } else if (productType === "clothing") {
      productOnlyPrompt = productOnlyPrompt_clothing;
    } else if (productType === "leather") {
      productOnlyPrompt = productOnlyPrompt_leather;
    }

    const generateSingleImage = async (prompt: string): Promise<string> => {
      const processedImagePart = base64ToGenerativePart(processedImageBase64);
      const response = await ai.models.generateContent({
        model: googleImageModel,
        contents: { parts: [processedImagePart, { text: prompt }] },
        config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: { aspectRatio: "1:1" },
        },
      });
      const data =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) throw new Error("Google GenAI did not return an image.");
      return data;
    };

    const promises: Promise<string>[] = [];
    const keys: ImageKey[] = [];

    if (keysToGenerate.includes("full")) {
      promises.push(generateSingleImage(fullBodyPrompt));
      keys.push("full");
    }

    if (keysToGenerate.includes("closeup")) {
      promises.push(generateSingleImage(closeupPrompt));
      keys.push("closeup");
    }

    if (keysToGenerate.includes("productOnly")) {
      promises.push(generateSingleImage(productOnlyPrompt));
      keys.push("productOnly");
    }

    const responses = await Promise.allSettled(promises);

    const result: Record<string, string> = {};

    responses.forEach((res, index) => {
      const key = keys[index];
      if (res.status === "fulfilled") {
        result[key] = res.value;
      } else {
        console.error(`Failed to generate ${key}:`, res.reason);
      }
    });

    if (Object.keys(result).length === 0) {
      throw new Error("Toutes les générations d'images ont échoué");
    }

    return NextResponse.json({
      images: result,
    });
  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des images",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
