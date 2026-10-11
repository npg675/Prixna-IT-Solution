import { Metadata } from "next";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";

export const metadata: Metadata = {
  title: "Jigri eHajiri — Digital Attendance & Leave Management",
  description: "Jigri eHajiri: Digital attendance system with biometric integration, leave management, and payroll-ready reports. Built for Nepali businesses.",
  openGraph: {
    title: "Jigri eHajiri — Digital Attendance & Leave Management",
    description: "Manage staff attendance and leave digitally with Jigri eHajiri. Works with biometric devices we install.",
  },
};

const productData = {
  title: "Jigri eHajiri",
  tagline: "Paperless Attendance, Leave & Payroll Integration",
  badge: "REQUEST DEMO · COMING SOON",
  badgeVariant: "secondary" as const,
  icon: "Calendar",
  purpose: [
    "Jigri eHajiri replaces paper registers and manual spreadsheets with a digital attendance and leave management system.",
    "It works seamlessly with the biometric devices we supply and install, giving you real-time attendance data that feeds directly into payroll.",
  ],
  coreCapabilities: [
    "Biometric Device Integration (Fingerprint, Face, RFID)",
    "Real-time Attendance Dashboard",
    "Shift & Roster Management",
    "Overtime & Late/Early Tracking",
    "Leave Requests & Approval Workflow",
    "Holiday Calendar (Nepal + Custom)",
    "Payroll-ready Attendance Reports",
    "Mobile App for Staff & Managers",
    "Geo-fencing for Field Staff",
    "Integration with Payroll Software",
  ],
  businessBenefits: [
    "Eliminate buddy punching and time theft",
    "Automated payroll calculations from attendance",
    "Real-time visibility: who's in, who's late, who's absent",
    "Paperless leave management with audit trail",
    "Compliance-ready records for labor laws",
    "Managers approve on mobile — no bottlenecks",
  ],
  integrationOptions: [
    "Biometric devices we supply (ZKTeco, Realtime, etc.)",
    "Payroll software: custom, Tally, Excel",
    "Jigri ERP (HR & Payroll module)",
    "HRMS platforms via API",
    "Accounting software for salary processing",
  ],
  screenshots: [],
  demoUrl: "#",
  ctaText: "Request Early Access",
  ctaLink: "/contact?service=Attendance%20%26%20Payroll",
  ctaVariant: "primary" as const,
  externalLink: undefined,
  isFree: false,
  freeTierDetails: undefined,
};

export default function JigriEhajiriPage() {
  return <ProductDetailPage data={productData} />;
}