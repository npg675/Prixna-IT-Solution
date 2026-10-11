import { Metadata } from "next";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";

export const metadata: Metadata = {
  title: "JigriTools — 30+ Free Online Utilities",
  description: "JigriTools offers 30+ free online tools for Nepal: BS-AD converter, EMI and tax calculators, Unicode converter, CV maker, QR and PDF tools. No sign-up needed. Made by Prixna IT Solution.",
  openGraph: {
    title: "JigriTools — 30+ Free Online Utilities for Nepal",
    description: "BS-AD converter, EMI and tax calculators, Unicode tools, CV maker, QR and PDF utilities. Free, private, no sign-up.",
  },
};

const productData = {
  title: "JigriTools",
  tagline: "30+ Free Online Utilities for Nepal",
  badge: "FREE · LIVE NOW",
  badgeVariant: "success" as const,
  icon: "Box",
  purpose: [
    "JigriTools exists for the everyday conversions and calculations Nepali students, offices and shops repeat constantly.",
    "From date confusion (BS↔AD) to loan math (EMI, tax) to Nepali typing troubles (Preeti↔Unicode) — JigriTools handles it all in one free, private, no-sign-up platform.",
  ],
  coreCapabilities: [
    "BS↔AD Date Converter & Calendar",
    "Age Calculator (years/months/days)",
    "Lakh/Crore & Number-to-Words Converter",
    "EMI Calculator with Schedule",
    "Salary Tax Calculator (FY 2082/83)",
    "VAT, Discount & Unit Converters",
    "Unicode ↔ Preeti Converter",
    "Romanized-to-Nepali Typing",
    "CV Maker & QR Generator",
    "PDF Tools (merge, split, compress)",
    "20+ more utilities",
  ],
  businessBenefits: [
    "Saves hours of manual calculation and conversion",
    "Eliminates errors in date, tax, and number formatting",
    "Works on any device — phone, tablet, computer",
    "Privacy-first: most tools run entirely in your browser",
    "Always free — no upsells, no accounts, no tracking",
    "Nepal-specific: BS calendar, lakh/crore, FY 2082/83 tax",
  ],
  integrationOptions: [
    "Embeddable widgets for partner websites",
    "API access for enterprise partners (on request)",
    "White-label options for educational institutions",
  ],
  screenshots: [],
  demoUrl: "https://jigritools.com/",
  ctaText: "Try All 30+ Tools Free",
  ctaLink: "https://jigritools.com/",
  ctaVariant: "primary" as const,
  externalLink: "https://jigritools.com/",
  isFree: true,
  freeTierDetails: "All 30+ tools are completely free with no sign-up required. No usage limits, no account needed, no data collection for most tools.",
};

export default function JigriToolsPage() {
  return <ProductDetailPage data={productData} />;
}