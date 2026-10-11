import { Metadata } from "next";
import { InsightsHero } from "@/components/insights/InsightsHero";
import { InsightsGrid } from "@/components/insights/InsightsGrid";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Insights & Knowledge Center",
  description: "Practical, Nepal-focused guides on business software, automation, IT infrastructure, cybersecurity, digital transformation, and industry-specific technology. Learn to make better technology decisions.",
  openGraph: {
    title: "Insights — Prixna IT Solution",
    description: "Guides from the knowledge center: business software, security, hardware, and productivity.",
  },
};

export default function InsightsPage() {
  return (
    <>
      <InsightsHero />
      <InsightsGrid />
      <FinalCTA />
    </>
  );
}