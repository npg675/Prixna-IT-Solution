import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "Hardware & IT Equipment",
  description: "Computers, laptops, printers, scanners, servers and genuine accessories supplied and professionally installed across Kathmandu Valley. Transparent NPR pricing.",
  openGraph: {
    title: "Hardware & IT Equipment — Prixna IT Solution",
    description: "Genuine computers, laptops, printers, servers and accessories with professional installation.",
  },
};

const solutionData = {
  title: "Hardware & IT Equipment",
  icon: "Cpu",
  category: "Hardware",
  businessProblem: [
    "Unreliable equipment causes frequent downtime",
    "No local support when hardware fails",
    "Counterfeit or grey-market products with no warranty",
    "Difficulty sourcing compatible components",
    "No unified procurement for IT equipment",
  ],
  proposedSolution: [
    "Branded desktops, laptops, and workstations (HP, Dell, Lenovo, ASUS)",
    "Enterprise servers and storage solutions",
    "Printers, scanners, and multifunction devices",
    "Genuine accessories: monitors, keyboards, mice, cables, adapters",
    "Power backup: UPS, router UPS with PoE",
    "Professional installation and configuration",
  ],
  benefits: [
    "Genuine products with manufacturer warranty",
    "Local service center for fast repairs",
    "Pre-configured and tested before delivery",
    "Volume pricing for bulk orders",
    "Single vendor for all IT hardware needs",
  ],
  scopeOfService: [
    "Hardware consultation and specification",
    "Procurement and delivery across Kathmandu Valley",
    "Installation, setup, and network integration",
    "Data migration from old systems",
    "Staff orientation and basic training",
    "Warranty management and repair coordination",
  ],
  implementationApproach: [
    "Site assessment and requirements analysis",
    "Transparent quotation with NPR pricing",
    "Procurement from authorized distributors",
    "Staged delivery and installation",
    "Post-installation verification and handover",
    "Ongoing AMC support available",
  ],
  ctaText: "Request Hardware Quote",
  ctaLink: "/contact?service=Computers%20%2F%20Laptops%20%2F%20Equipment",
};

export default function HardwareInfrastructurePage() {
  return <SolutionDetailPage data={solutionData} />;
}