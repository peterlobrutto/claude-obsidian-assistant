import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Purposefill — Pharmacy OS",
    short_name: "Purposefill",
    description: "Modern cloud-based pharmacy management for independent pharmacies",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#7C3AED",
    categories: ["medical", "productivity", "business"],
    icons: [
      {
        src: "/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon?size=512&maskable=1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "New Prescription",
        url: "/prescriptions/new",
        description: "Enter a new prescription",
      },
      {
        name: "Patient Search",
        url: "/patients",
        description: "Search patient records",
      },
      {
        name: "Will-Call Queue",
        url: "/will-call",
        description: "View pickups ready",
      },
    ],
  };
}
