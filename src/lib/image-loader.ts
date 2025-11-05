import { ImageLoaderProps } from "next/image";

export default function uploadthingLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  // Si c'est une URL complète UploadThing, on la retourne directement
  if (src.startsWith("https://utfs.io")) {
    return src;
  }

  // Sinon on la retourne telle quelle
  return src;
}
