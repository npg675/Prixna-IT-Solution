import { Metadata } from "next";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";

export const metadata: Metadata = {
  title: "Jigri CRM — Customer Relationship Management",
  description: "Jigri CRM: Track leads, manage sales pipelines, and nurture customer relationships. Built for Nepali businesses with local workflow support.",
  openGraph: {
    title: "Jigri CRM — Customer Relationship Management",
    description: "Track customers, follow-ups and sales pipelines with Jigri CRM. Talk to us for early access.",
  },
};

const productData = {
  title: "Jigri CRM",
  tagline: "Track Leads, Manage Pipelines, Close More Deals",
  badge: "REQUEST DEMO · COMING SOON",
  badgeVariant: "secondary" as const,
  icon: "Users",
  purpose: [
    "Jigri CRM helps Nepali businesses organize their customer interactions, track sales opportunities, and never miss a follow-up.",
    "Designed for sales teams, distributors, and service businesses that need a simple but powerful CRM without the complexity of enterprise tools.",
  ],
  coreCapabilities: [
    "Lead Capture & Qualification",
    "Contact & Account Management",
    "Sales Pipeline with Custom Stages",
    "Follow-up Tasks & Reminders",
    "Communication History (Calls, Meetings, Notes)",
    "Quotation & Proposal Generation",
    "Activity Dashboard & Reports",
    "Mobile-friendly for Field Teams",
    "WhatsApp & Email Integration",
    "Import/Export from Excel/CSV",
  ],
  businessBenefits: [
    "Never lose a lead or forget a follow-up",
    "Clear visibility into sales pipeline health",
    "Faster quote-to-close cycle",
    "Team collaboration on shared accounts",
    "Data-driven sales coaching",
    "Mobile access for on-the-go updates",
  ],
  integrationOptions: [
    "Jigri ERP (orders, invoices, payments)",
    "Jigri eHajiri (field staff attendance)",
    "WhatsApp Business API",
    "Email providers (Gmail, Outlook)",
    "Calendar (Google, Outlook)",
    "Custom API for other systems",
  ],
  screenshots: [],
  demoUrl: "#",
  ctaText: "Request Early Access",
  ctaLink: "/contact?service=JigriTools%20Enquiry",
  ctaVariant: "primary" as const,
  externalLink: undefined,
  isFree: false,
  freeTierDetails: undefined,
};

export default function JigriCrmPage() {
  return <ProductDetailPage data={productData} />;
}