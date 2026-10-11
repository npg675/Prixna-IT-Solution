import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "Pharmacy & Healthcare Technology Solutions",
  description: "Complete technology solutions for pharmacies and healthcare providers in Nepal. Pharmacy billing with batch/expiry tracking, reliable hardware, and data backup.",
  openGraph: {
    title: "Pharmacy & Healthcare — Prixna IT Solution",
    description: "Batch/expiry tracking, billing accuracy & reliable backups for pharmacies.",
  },
};

const industryData = {
  title: "Pharmacy & Healthcare",
  icon: "Pill",
  description: "Batch/expiry tracking, billing accuracy & reliable backups.",
  challenges: [
    "Batch and expiry tracking errors risk patient safety",
    "Billing inaccuracies lead to revenue loss",
    "Prescription rush hours slow down service",
    "No automated alerts for near-expiry stock",
    "Data loss risk with no backup strategy",
    "Regulatory compliance for drug records",
  ],
  typicalSetup: [
    "Pharmacy billing software with batch/expiry alerts",
    "Barcode scanner for fast prescription entry",
    "Reliable billing PC with UPS and SSD",
    "Automated daily backup to local + cloud",
    "Thermal label printer for medicine labels",
    "CCTV for security and compliance",
  ],
  relatedSolutions: [
    { title: "Business Software & SaaS", href: "/solutions/business-software-saas", icon: "Monitor" },
    { title: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", icon: "Cpu" },
    { title: "CCTV & Security Systems", href: "/solutions/cctv-security", icon: "Shield" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
  ],
  relatedProducts: [
    { title: "Jigri ERP", href: "/products/jigri-erp", badge: "REQUEST DEMO", icon: "Sparkles" },
    { title: "JigriTools", href: "/products/jigritools", badge: "FREE", icon: "Box" },
  ],
  ctaText: "Request a Pharmacy Demo",
  ctaLink: "/contact?service=Business%20Software%20%2F%20SaaS%20Demo",
};

export default function PharmacyHealthcarePage() {
  return <IndustryDetailPage data={industryData} />;
}