import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
    ],
    /* formats: ["image/webp", "image/avif"],
    qualities: [75, 90, 95, 100],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", */
    // Utiliser le loader d'UploadThing directement au lieu de l'optimisation Vercel
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
