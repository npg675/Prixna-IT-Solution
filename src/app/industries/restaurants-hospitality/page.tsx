import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "Restaurant & Hotel Technology Solutions",
  description: "Complete technology solutions for restaurants, cafés, and hotels in Nepal. KOT billing, table management, kitchen printers, guest Wi-Fi, and CCTV.",
  openGraph: {
    title: "Restaurants & Hospitality — Prixna IT Solution",
    description: "KOT billing, table management, kitchen printers & Wi-Fi for guests.",
  },
};

const industryData = {
  title: "Restaurants & Hospitality",
  icon: "Utensils",
  description: "KOT billing, table management, kitchen printers & Wi-Fi for guests.",
  challenges: [
    "Wrong KOTs (Kitchen Order Tickets) lead to food waste",
    "Table mix-ups during peak hours",
    "No visibility into food costs and margins",
    "Manual billing slows down service",
    "Guest Wi-Fi complaints and security concerns",
    "Cash counter disputes with no video evidence",
  ],
  typicalSetup: [
    "Restaurant POS with KOT printing to kitchen",
    "Table management with floor plan view",
    "Kitchen display system (KDS) or thermal printers",
    "Guest Wi-Fi with captive portal and bandwidth control",
    "CCTV covering cash counter, dining, and entry",
    "Billing PCs with UPS backup for power cuts",
  ],
  relatedSolutions: [
    { title: "Business Software & SaaS", href: "/solutions/business-software-saas", icon: "Monitor" },
    { title: "CCTV & Security Systems", href: "/solutions/cctv-security", icon: "Shield" },
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
    { title: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", icon: "Cpu" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
  ],
  relatedProducts: [
    { title: "Jigri ERP", href: "/products/jigri-erp", badge: "REQUEST DEMO", icon: "Sparkles" },
    { title: "JigriTools", href: "/products/jigritools", badge: "FREE", icon: "Box" },
  ],
  ctaText: "Discuss Your Hospitality Setup",
  ctaLink: "/contact?service=Restaurant%20%2F%20Hospitality%20Solution",
};

export default function RestaurantsHospitalityPage() {
  return <IndustryDetailPage data={industryData} />;
}