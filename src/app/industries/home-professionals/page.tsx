import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "Home Users & Professionals Technology Solutions",
  description: "Technology solutions for home users and professionals in Nepal. Laptop/desktop repair, upgrades, genuine accessories, home Wi-Fi, and free JigriTools.",
  openGraph: {
    title: "Home Users & Professionals — Prixna IT Solution",
    description: "Laptop/desktop repair & upgrades, genuine accessories, home Wi-Fi fix, free JigriTools.",
  },
};

const industryData = {
  title: "Home Users & Professionals",
  icon: "Home",
  description: "Laptop/desktop repair & upgrades, genuine accessories, home Wi-Fi fix, free JigriTools.",
  challenges: [
    "Slow laptops and desktops need upgrades",
    "Data loss from failed drives with no backup",
    "Home Wi-Fi dead zones and slow speeds",
    "Genuine accessories hard to find locally",
    "Software issues: viruses, slow boot, errors",
    "No trusted local repair service",
  ],
  typicalSetup: [
    "Laptop/desktop repair, SSD upgrades, RAM upgrades",
    "Genuine accessories: chargers, bags, mice, keyboards",
    "Home Wi-Fi mesh systems for full coverage",
    "Data recovery and backup setup",
    "Virus removal and Windows optimization",
    "Free JigriTools for daily calculations",
  ],
  relatedSolutions: [
    { title: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", icon: "Cpu" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
    { title: "Digital Marketing & AI Automation", href: "/solutions/digital-marketing-ai", icon: "Megaphone" },
  ],
  relatedProducts: [
    { title: "JigriTools", href: "/products/jigritools", badge: "FREE · LIVE NOW", icon: "Box" },
  ],
  ctaText: "Book a Repair or Upgrade",
  ctaLink: "/contact?service=Repair%20%26%20Maintenance",
};

export default function HomeProfessionalsPage() {
  return <IndustryDetailPage data={industryData} />;
}