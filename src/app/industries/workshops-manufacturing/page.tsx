import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "Workshop & Manufacturing Technology Solutions",
  description: "Ruggedized IT solutions for workshops and manufacturing in Nepal. Job tracking software, dust-resistant hardware, CCTV, and AMC support.",
  openGraph: {
    title: "Workshops & Manufacturing — Prixna IT Solution",
    description: "Ruggedized setup advice, job/invoice tracking software, CCTV for premises, AMC-style support.",
  },
};

const industryData = {
  title: "Workshops & Manufacturing",
  icon: "Factory",
  description: "Ruggedized setup advice, job/invoice tracking software, CCTV for premises, AMC-style support.",
  challenges: [
    "Job tracking across multiple work orders",
    "Dusty, hot environments kill standard PCs",
    "No IT support on call for critical equipment",
    "Inventory management for raw materials",
    "Machine downtime tracking needed",
    "Compliance and safety documentation",
  ],
  typicalSetup: [
    "Ruggedized industrial PCs or protected enclosures",
    "Job tracking and invoicing software",
    "CCTV for premises security and safety monitoring",
    "Industrial-grade networking (shielded cabling)",
    "AMC support with priority response",
    "Backup power for critical machinery controls",
  ],
  relatedSolutions: [
    { title: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", icon: "Cpu" },
    { title: "CCTV & Security Systems", href: "/solutions/cctv-security", icon: "Shield" },
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
    { title: "Custom Software & Websites", href: "/solutions/custom-development", icon: "Code" },
  ],
  relatedProducts: [
    { title: "Jigri ERP", href: "/products/jigri-erp", badge: "REQUEST DEMO", icon: "Sparkles" },
    { title: "JigriTools", href: "/products/jigritools", badge: "FREE", icon: "Box" },
  ],
  ctaText: "Discuss Your Workshop IT",
  ctaLink: "/contact?service=Repair%20%26%20Maintenance",
};

export default function WorkshopsManufacturingPage() {
  return <IndustryDetailPage data={industryData} />;
}