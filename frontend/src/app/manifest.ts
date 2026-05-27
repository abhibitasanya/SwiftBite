import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SwiftBite",
    short_name: "SwiftBite",
    description:
      "A food ordering PWA for customers, delivery partners, restaurant owners, and the core platform team.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6efe2",
    theme_color: "#e6e1d3",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192 512x512",
        type: "image/png",
      },
    ],
  };
}