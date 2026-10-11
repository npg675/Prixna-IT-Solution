import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "Retail & Wholesale Technology Solutions",
  description: "Complete technology solutions for retail shops, supermarkets, and wholesale distributors in Nepal. Billing software, inventory management, barcode, CCTV, and IT support.",
  openGraph: {
    title: "Retail & Wholesale — Prixna IT Solution",
    description: "Billing, stock control, barcode & CCTV that cut shrinkage for retail and wholesale businesses.",
  },
};

const industryData = {
  title: "Retail & Wholesale",
  icon: "Store",
  description: "Billing, stock control, barcode & CCTV that cut shrinkage.",
  challenges: [
    "Slow billing at rush hour frustrates customers and loses sales",
    "Stock leakage and shrinkage eat into profits",
    "No real-time view of daily profit and loss",
    "Manual price updates across multiple counters",
    "Credit management for wholesale customers is messy",
    "No integration between billing, stock, and accounting",
  ],
  typicalSetup: [
    "Jigri ERP: Integrated billing, inventory, accounting",
    "Barcode printer, scanner, and label rolls",
    "Billing PCs with UPS backup for each counter",
    "CCTV cameras covering cash counters and stock rooms",
    "LAN network connecting all billing terminals",
    "Thermal receipt printers for fast checkout",
  ],
  relatedSolutions: [
    { title: "Business Software & SaaS", href: "/solutions/business-software-saas", icon: "Monitor" },
    { title: "CCTV & Security Systems", href: "/solutions/cctv-security", icon: "Shield" },
    { title: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", icon: "Cpu" },
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
  ],
  relatedProducts: [
    { title: "Jigri ERP", href: "/products/jigri-erp", badge: "REQUEST DEMO", icon: "Sparkles" },
    { title: "JigriTools", href: "/products/jigritools", badge: "FREE", icon: "Box" },
  ],
  ctaText: "Discuss Your Retail Setup",
  ctaLink: "/contact?service=Business%20Software%20%2F%20SaaS%20Demo",
};

export default function RetailWholesalePage() {
  return <IndustryDetailPage data={industryData} />;
}