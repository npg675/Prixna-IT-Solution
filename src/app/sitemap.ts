import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://prixnaitsolution.com.np";

  const staticPages = [
    "",
    "/about",
    "/solutions",
    "/solutions/business-software-saas",
    "/solutions/custom-development",
    "/solutions/hardware-infrastructure",
    "/solutions/cctv-security",
    "/solutions/biometric-access",
    "/solutions/networking-servers",
    "/solutions/it-support-maintenance",
    "/solutions/digital-marketing-ai",
    "/products",
    "/products/jigritools",
    "/products/jigri-erp",
    "/products/jigri-crm",
    "/products/jigri-ehajiri",
    "/industries",
    "/industries/retail-wholesale",
    "/industries/restaurants-hospitality",
    "/industries/schools-education",
    "/industries/pharmacy-healthcare",
    "/industries/offices-corporate",
    "/industries/workshops-manufacturing",
    "/industries/home-professionals",
    "/industries/sme-enterprise",
    "/projects",
    "/insights",
    "/insights/choosing-billing-software-nepal",
    "/insights/cctv-cameras-how-many",
    "/insights/biometric-attendance-guide",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: (page === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: page === "" ? 1 : page.includes("/insights/") ? 0.7 : 0.8,
  }));

  return sitemap;
}