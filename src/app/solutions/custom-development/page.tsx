import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "Custom Software & Websites",
  description: "Custom web applications, mobile apps, API integrations, and legacy modernization for businesses in Nepal. Tailored software built around your workflow.",
  openGraph: {
    title: "Custom Software & Websites — Prixna IT Solution",
    description: "Websites, web apps and tailored software built around your workflow.",
  },
};

const solutionData = {
  title: "Custom Software & Websites",
  icon: "Code",
  category: "Software",
  businessProblem: [
    "Off-the-shelf software doesn't match your unique workflow",
    "Multiple disconnected tools create data silos",
    "Legacy systems are expensive to maintain and hard to extend",
    "Manual processes that could be automated",
    "No API integrations between critical systems",
  ],
  proposedSolution: [
    "Custom web applications built for your exact requirements",
    "Mobile apps for field staff, sales teams, or customers",
    "API development and third-party integrations",
    "Legacy system modernization and migration",
    "Automated workflows replacing manual processes",
  ],
  benefits: [
    "Software that fits your business — not the other way around",
    "Single source of truth across all operations",
    "Scalable architecture that grows with you",
    "Full ownership of IP and source code",
    "Local development team for ongoing support",
  ],
  scopeOfService: [
    "Requirements gathering and technical specification",
    "UI/UX design and prototyping",
    "Agile development with regular demos",
    "Testing, deployment, and training",
    "Post-launch support and feature enhancements",
  ],
  implementationApproach: [
    "Discovery workshop to understand pain points",
    "Technical architecture and technology selection",
    "MVP definition and phased delivery plan",
    "Iterative development with stakeholder feedback",
    "Production deployment and knowledge transfer",
    "Ongoing maintenance and feature development",
  ],
  ctaText: "Discuss Your Project",
  ctaLink: "/contact?service=Custom%20Software%20%2F%20Website%20Development",
};

export default function CustomDevelopmentPage() {
  return <SolutionDetailPage data={solutionData} />;
}