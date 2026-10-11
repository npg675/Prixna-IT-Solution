import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "Office & Corporate Technology Solutions",
  description: "Complete IT infrastructure for offices and corporates in Nepal. Structured LAN, managed Wi-Fi, server setup, laptops, printers, and managed IT support.",
  openGraph: {
    title: "Offices & Corporate — Prixna IT Solution",
    description: "Structured LAN + managed Wi-Fi, server/backup setup, laptops & printers, support terms.",
  },
};

const industryData = {
  title: "Offices & Corporate",
  icon: "Building2",
  description: "Structured LAN + managed Wi-Fi, server/backup setup, laptops & printers, support terms.",
  challenges: [
    "Data safety and backup concerns",
    "Network downtime kills productivity",
    "Multiple vendors for every IT issue",
    "No centralized device management",
    "Security vulnerabilities in network",
    "Remote work connectivity challenges",
  ],
  typicalSetup: [
    "Structured CAT6/CAT6a LAN cabling",
    "Enterprise Wi-Fi with centralized controller",
    "Server rack with UPS, cooling, cable management",
    "Laptops, monitors, docking stations for staff",
    "Network printers with secure printing",
    "Firewall, VPN, and network segmentation",
    "Managed IT support with SLA",
  ],
  relatedSolutions: [
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
    { title: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", icon: "Cpu" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
    { title: "CCTV & Security Systems", href: "/solutions/cctv-security", icon: "Shield" },
    { title: "Biometric & Access Control", href: "/solutions/biometric-access", icon: "Shield" },
  ],
  relatedProducts: [
    { title: "Jigri ERP", href: "/products/jigri-erp", badge: "REQUEST DEMO", icon: "Sparkles" },
    { title: "Jigri CRM", href: "/products/jigri-crm", badge: "REQUEST DEMO", icon: "Users" },
    { title: "Jigri eHajiri", href: "/products/jigri-ehajiri", badge: "REQUEST DEMO", icon: "Calendar" },
  ],
  ctaText: "Plan Your Office IT",
  ctaLink: "/contact?service=Networking%20%2F%20Servers",
};

export default function OfficesCorporatePage() {
  return <IndustryDetailPage data={industryData} />;
}