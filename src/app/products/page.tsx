import { Metadata } from "next";
import { ProductsHero } from "@/components/products/ProductsHero";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Products & Platforms",
  description: "Explore the Jigri product family: JigriTools (30+ free utilities), Jigri ERP, Jigri CRM, and Jigri eHajiri. Built and supported by Prixna IT Solution for businesses in Nepal.",
  openGraph: {
    title: "Products & Platforms — Prixna IT Solution",
    description: "The Jigri product family: free tools and business platforms for Nepal.",
  },
};

export default function ProductsPage() {
  return (
    <>
      <ProductsHero />
      <ProductsGrid />
      <FinalCTA />
    </>
  );
}