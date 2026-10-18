import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Davey's Daisies",
    short_name: "Daisies",
    description: "Arrange a digital bouquet, write a heartfelt letter, and share it with someone you love.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ee",
    theme_color: "#fbf7ee",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
