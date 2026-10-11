import { Metadata } from "next";
import { IndustriesHero } from "@/components/industries/IndustriesHero";
import { IndustriesGrid } from "@/components/industries/IndustriesGrid";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Industries",
  description: "Technology solutions tailored for your industry: retail, restaurants, schools, healthcare, offices, manufacturing, and more. Software, hardware, and support combined for your specific challenges.",
  openGraph: {
    title: "Industries — Prixna IT Solution",
    description: "Industry-specific technology solutions for businesses in Nepal.",
  },
};

export default function IndustriesPage() {
  return (
    <>
      <IndustriesHero />
      <IndustriesGrid />
      <FinalCTA />
    </>
  );
}