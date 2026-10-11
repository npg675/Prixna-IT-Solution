import { Metadata } from "next";
import { SolutionsHero } from "@/components/solutions/SolutionsHero";
import { SolutionsGrid } from "@/components/solutions/SolutionsGrid";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Solutions",
  description: "Explore our complete range of business technology solutions: ERP/CRM software, custom development, hardware infrastructure, CCTV & security, biometric systems, networking, IT support, and digital marketing.",
  openGraph: {
    title: "Solutions — Prixna IT Solution",
    description: "Complete business technology solutions for companies in Nepal.",
  },
};

export default function SolutionsPage() {
  return (
    <>
      <SolutionsHero />
      <SolutionsGrid />
      <ProcessSteps />
      <FinalCTA />
    </>
  );
}