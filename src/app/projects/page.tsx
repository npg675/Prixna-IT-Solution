import { Metadata } from "next";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Projects & Case Studies",
  description: "Real implementation projects, business challenges, delivered solutions, and measurable outcomes. Prixna IT Solution publishes only genuine, client-approved case studies from Kathmandu Valley.",
  openGraph: {
    title: "Projects & Case Studies — Prixna IT Solution",
    description: "Real projects, verified reviews, and case study format from Kathmandu Valley.",
  },
};

export default function ProjectsPage() {
  return (
    <>
      <ProjectsHero />
      <ProjectsGrid />
      <FinalCTA />
    </>
  );
}