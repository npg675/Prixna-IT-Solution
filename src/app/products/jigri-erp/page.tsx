import { Metadata } from "next";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";

export const metadata: Metadata = {
  title: "Jigri ERP — Business Management Platform",
  description: "Jigri ERP: Complete business management platform for retail, wholesale, and distribution. Accounting, billing, inventory, and reporting with setup, migration, and training included.",
  openGraph: {
    title: "Jigri ERP — Business Management Platform",
    description: "Accounting, billing, inventory and reporting in one place for retail, wholesale and distribution businesses.",
  },
};

const productData = {
  title: "Jigri ERP",
  tagline: "Accounting, Billing, Inventory & Reporting in One Platform",
  badge: "REQUEST DEMO · COMING SOON",
  badgeVariant: "secondary" as const,
  icon: "Sparkles",
  purpose: [
    "Jigri ERP is built for retail, wholesale, and distribution businesses in Nepal that need a complete, integrated system for accounting, billing, and inventory management.",
    "Unlike generic ERPs, Jigri ERP is designed for Nepali compliance (VAT/PAN, BS calendar, lakh/crore) and local workflows from day one.",
  ],
  coreCapabilities: [
    "Sales & Purchase Billing with GST/VAT",
    "Real-time Inventory & Stock Management",
    "Multi-location / Godown Stock Tracking",
    "Party-wise Ledger & Credit Management",
    "Financial Accounting (Journal, Ledger, Trial Balance)",
    "GST/VAT Returns & Compliance Reports",
    "Business Dashboard & Analytics",
    "Barcode Scanning & Label Printing",
    "User Roles & Permission Management",
    "Data Import/Export & Backup",
  ],
  businessBenefits: [
    "Single system for billing, stock, and accounts",
    "Real-time stock visibility across locations",
    "Automated VAT/PAN compliance for Nepal",
    "Faster decision-making with live dashboards",
    "Reduced manual errors and reconciliation",
    "Scalable from single shop to multi-branch",
    "Local support, training, and customization",
  ],
  integrationOptions: [
    "Biometric attendance (Jigri eHajiri)",
    "POS hardware: printers, scanners, cash drawers",
    "Accounting software: Tally export, Excel",
    "E-commerce platforms (API)",
    "Payment gateways: eSewa, Khalti, IME Pay",
    "Bank statement import",
  ],
  screenshots: [],
  demoUrl: "#",
  ctaText: "Request a Live Demo",
  ctaLink: "/contact?service=Accounting%20%2F%20ERP%20%2F%20CRM",
  ctaVariant: "primary" as const,
  externalLink: undefined,
  isFree: false,
  freeTierDetails: undefined,
};

export default function JigriErpPage() {
  return <ProductDetailPage data={productData} />;
}