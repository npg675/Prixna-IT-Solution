import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prixna IT Solution — Complete Business Technology",
    short_name: "Prixna IT",
    description: "Software, hardware, automation and IT support for businesses in Nepal.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0A1A38",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
