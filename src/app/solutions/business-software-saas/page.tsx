import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "Business Software & SaaS",
  description: "Billing, inventory, ERP, CRM and JigriTools products that simplify daily operations for businesses in Nepal. Free consultation available.",
  openGraph: {
    title: "Business Software & SaaS — Prixna IT Solution",
    description: "Complete business software solutions including Jigri ERP, CRM, and free JigriTools.",
  },
};

const solutionData = {
  title: "Business Software & SaaS",
  icon: "Monitor",
  category: "Software",
  businessProblem: [
    "Manual billing slows down checkout and creates errors",
    "No real-time stock visibility leads to overstocking or stockouts",
    "Disconnected systems for accounting, sales, and inventory",
    "Compliance challenges with VAT/PAN reporting in Nepal",
    "Paper-based processes don't scale with business growth",
  ],
  proposedSolution: [
    "Jigri ERP: Integrated accounting, billing, inventory, and reporting",
    "Jigri CRM: Customer management, lead tracking, sales pipeline",
    "Jigri eHajiri: Digital attendance and leave management",
    "JigriTools: 30+ free utilities (BS↔AD, EMI, tax, Unicode, QR, PDF)",
    "Industry-specific modules: Retail, Restaurant, Pharmacy, Wholesale",
  ],
  benefits: [
    "Real-time stock and sales visibility",
    "Automated VAT/PAN compliance for Nepal",
    "Faster checkout with barcode scanning",
    "Business dashboards for decision-making",
    "Free tools available immediately via JigriTools",
    "Local support and training included",
  ],
  scopeOfService: [
    "Software selection and requirements analysis",
    "Installation, configuration, and data migration",
    "Staff training and user documentation",
    "Integration with existing hardware (printers, scanners, biometric)",
    "Ongoing support and annual maintenance",
  ],
  implementationApproach: [
    "Free consultation to understand your workflow",
    "Live demo with your actual data scenarios",
    "Transparent quotation in NPR with no hidden costs",
    "Phased rollout: core modules first, then advanced features",
    "Hands-on training for your team",
    "Post-go-live support with defined SLAs",
  ],
  ctaText: "Request a Software Demo",
  ctaLink: "/contact?service=Business%20Software%20%2F%20SaaS%20Demo",
};

export default function BusinessSoftwareSaasPage() {
  return <SolutionDetailPage data={solutionData} />;
}