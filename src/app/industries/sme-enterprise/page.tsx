import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "SME & Enterprise Technology Solutions",
  description: "Integrated technology solutions for growing SMEs and enterprises in Nepal. ERP, CRM, attendance, networking, and managed IT support scaled to your growth.",
  openGraph: {
    title: "SMEs & Growing Enterprises — Prixna IT Solution",
    description: "Integrated ERP, CRM, attendance, networking and support scaled to your growth.",
  },
};

const industryData = {
  title: "SMEs & Growing Enterprises",
  icon: "Briefcase",
  description: "Integrated ERP, CRM, attendance, networking and support scaled to your growth.",
  challenges: [
    "Outgrowing basic software and spreadsheets",
    "Multiple disconnected tools create data silos",
    "Compliance and reporting becoming complex",
    "Need for centralized visibility across departments",
    "Scaling IT infrastructure with business growth",
    "Strategic technology planning for next phase",
  ],
  typicalSetup: [
    "Jigri ERP: Integrated finance, inventory, sales",
    "Jigri CRM: Sales pipeline and customer management",
    "Jigri eHajiri: Attendance, leave, payroll integration",
    "Enterprise networking: LAN, Wi-Fi, VPN, firewall",
    "Server infrastructure with virtualization",
    "Managed IT support with proactive monitoring",
  ],
  relatedSolutions: [
    { title: "Business Software & SaaS", href: "/solutions/business-software-saas", icon: "Monitor" },
    { title: "Custom Software & Websites", href: "/solutions/custom-development", icon: "Code" },
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
    { title: "Digital Marketing & AI Automation", href: "/solutions/digital-marketing-ai", icon: "Megaphone" },
  ],
  relatedProducts: [
    { title: "Jigri ERP", href: "/products/jigri-erp", badge: "REQUEST DEMO", icon: "Sparkles" },
    { title: "Jigri CRM", href: "/products/jigri-crm", badge: "REQUEST DEMO", icon: "Users" },
    { title: "Jigri eHajiri", href: "/products/jigri-ehajiri", badge: "REQUEST DEMO", icon: "Calendar" },
    { title: "JigriTools", href: "/products/jigritools", badge: "FREE", icon: "Box" },
  ],
  ctaText: "Build Your Technology Roadmap",
  ctaLink: "/contact?service=Free%20Business%20Consultation",
};

export default function SmeEnterprisePage() {
  return <IndustryDetailPage data={industryData} />;
}