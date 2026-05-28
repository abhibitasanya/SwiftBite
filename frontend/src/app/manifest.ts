import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SwiftBite",
    short_name: "SwiftBite",
    description:
      "A premium food ordering PWA for customers, delivery partners, restaurant owners, and the platform team.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4ead0",
    theme_color: "#223326",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}