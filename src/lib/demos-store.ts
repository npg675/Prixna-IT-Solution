/**
 * Software Demos Store & Configuration
 * ----------------------------------------------------
 * Designed for public traffic coming from AI chat, WhatsApp, and social campaigns.
 *
 * TO DUPLICATE FOR ANOTHER PROJECT:
 * 1. Copy this file into your project's lib folder.
 * 2. Update DEFAULT_DEMOS array below with your own products/videos.
 * 3. All video players, tabs, workflows, and lead funnels will automatically adapt!
 */

export interface DemoWorkflow {
  time: string;
  title: string;
  desc: string;
}

export interface SoftwareDemo {
  id: string;
  name: string;
  tagline: string;
  category: string;
  icon: string;
  youtubeUrl: string;
  websiteUrl?: string; // Product website or live software link (opens in new tab)
  videoFile?: string;
  duration: string;
  features: string[];
  keyWorkflows: DemoWorkflow[];
  audience: string;
  consultService: string;
  planHint: string;
  liveDemoUrl?: string;
  active: boolean;
  featured: boolean;
}

export const DEMOS_STORAGE_KEY = "prixna_demos_v1";
export const DEMOS_SEED_URL = "/data/software-demos.json";

export const DEFAULT_DEMOS: SoftwareDemo[] = [
  {
    id: "jigri-erp",
    name: "Jigri ERP — Billing + Inventory",
    tagline: "VAT/PAN billing, stock & day-book for retail, wholesale and marts across Nepal",
    category: "Billing & ERP",
    icon: "🧾",
    youtubeUrl: "",
    websiteUrl: "/products/jigri-erp",
    duration: "4 min demo",
    features: [
      "VAT & non-VAT bill printing in under 20 seconds",
      "Real-time stock tracking with low-inventory alerts",
      "Daily day-book, cash counter closing & profit summary",
      "Bilingual interface (Nepali & English) with barcode scanning",
      "Local setup, data migration from Excel & team training in Kathmandu",
    ],
    keyWorkflows: [
      { time: "0:25", title: "Instant Bill Printing", desc: "Fast thermal or A4 invoice printing with QR code and PAN details" },
      { time: "1:15", title: "Inventory & Batch Control", desc: "Automated stock adjustments, batch/expiry alerts, and supplier purchase orders" },
      { time: "2:30", title: "Customer Khata & Ledgers", desc: "Digital credit book tracking with WhatsApp payment reminders" },
      { time: "3:40", title: "Day-End Cash Settlement", desc: "Automated closing report comparing cash drawer against system totals" },
    ],
    audience: "Retail shops, supermarkets, wholesale distributors, hardware stores",
    consultService: "Business Software / SaaS Demo",
    planHint: "Honest NPR monthly or annual subscription quoted after free workflow study",
    active: true,
    featured: true,
  },
  {
    id: "restaurant-pos",
    name: "Restaurant & Hotel POS + KOT",
    tagline: "Table management, wireless kitchen tickets (KOT) & billing on a single screen",
    category: "Hospitality",
    icon: "🍽️",
    youtubeUrl: "",
    websiteUrl: "/products/restaurant-pos",
    duration: "3 min demo",
    features: [
      "Visual floor plan & touch-friendly table management",
      "Instant wireless KOT printing directly to kitchen printers",
      "Split bills, discounts, service charges & Nepal VAT calculations",
      "Daily collections, food cost analysis & staff audit log",
      "Hardware bundle available (touch terminal, thermal printer, cash drawer)",
    ],
    keyWorkflows: [
      { time: "0:20", title: "Table Selection & Ordering", desc: "Interactive floor map with live table status (occupied, reserved, billing)" },
      { time: "1:05", title: "Wireless KOT Routing", desc: "Instant kitchen tickets routed by station (Bar, Kitchen, Grill)" },
      { time: "1:50", title: "Bill Split & Multi-Pay", desc: "Split by item or seat with Fonepay QR, Card, and Cash integration" },
      { time: "2:45", title: "End-of-Shift Cash Report", desc: "Comprehensive collection reconciliation for owners & managers" },
    ],
    audience: "Restaurants, cafes, bakeries, lounges, boutique hotels",
    consultService: "Restaurant / Hospitality Solution",
    planHint: "POS subscription + setup quoted in NPR with on-site staff training",
    active: true,
    featured: true,
  },
  {
    id: "jigri-crm",
    name: "Jigri CRM — Leads & Pipeline",
    tagline: "Never lose a customer enquiry, WhatsApp lead, or follow-up again",
    category: "CRM & Sales",
    icon: "📊",
    youtubeUrl: "",
    websiteUrl: "/products/jigri-crm",
    duration: "3 min demo",
    features: [
      "Unified lead inbox from website, chat, WhatsApp & phone calls",
      "Automated follow-up reminders and team task assignments",
      "Visual Kanban pipeline to track deals from initial enquiry to closure",
      "Quotation history & customer communication logs in one timeline",
      "Role-based access for sales reps, managers and directors",
    ],
    keyWorkflows: [
      { time: "0:30", title: "Lead Ingestion & Routing", desc: "Automatic lead capture from chat, landing pages and contact forms" },
      { time: "1:15", title: "Follow-up Reminders", desc: "Automated WhatsApp and notification triggers before deals go cold" },
      { time: "2:05", title: "Pipeline Deal Stages", desc: "Drag-and-drop opportunity cards through qualification, demo, and won" },
      { time: "2:50", title: "Sales Performance View", desc: "Monthly revenue forecasts and team conversion analytics" },
    ],
    audience: "Service firms, B2B agencies, hardware dealers, consultancies",
    consultService: "Accounting / ERP / CRM",
    planHint: "Per-user NPR monthly plan — simple pricing with zero setup lock-in",
    active: true,
    featured: true,
  },
  {
    id: "ehajiri-attendance",
    name: "eHajiri + Biometric Attendance",
    tagline: "Biometric fingerprint/face hardware synced with cloud attendance & payroll",
    category: "Attendance & HR",
    icon: "👆",
    youtubeUrl: "",
    websiteUrl: "/products/ehajiri-attendance",
    duration: "2 min demo",
    features: [
      "Compatible with ZKTeco & biometric fingerprint/facial devices we install",
      "Mobile self-attendance with geo-fencing for remote and field staff",
      "Shift rules, late penalty calculations & Nepali Bikram Sambat leave tracker",
      "One-click monthly payroll calculation with SSF and TDS deductions",
      "Physical device installation and warranty support across Kathmandu Valley",
    ],
    keyWorkflows: [
      { time: "0:25", title: "Biometric Device Sync", desc: "Punches instantly reflect on cloud dashboard in real-time" },
      { time: "1:00", title: "Leave & Shift Approval", desc: "Bilingual staff portal for requesting and approving leave applications" },
      { time: "1:40", title: "Salary Sheet Generation", desc: "Automated payroll calculation with attendance deductions and tax rules" },
    ],
    audience: "Offices, schools, colleges, clinics, factories, showrooms",
    consultService: "Attendance & Payroll",
    planHint: "Device + software bundle quoted after quick site inspection",
    active: true,
    featured: false,
  },
  {
    id: "jigritools-suite",
    name: "JigriTools — 30+ Free Nepali Utilities",
    tagline: "BS↔AD date conversion, FY 2082/83 tax, EMI math, Unicode, QR & CV maker",
    category: "Free Online Tools",
    icon: "🧰",
    youtubeUrl: "",
    websiteUrl: "https://jigritools.com",
    liveDemoUrl: "https://jigritools.com",
    duration: "2 min tour",
    features: [
      "100% free online platform built by Prixna IT Solution for Nepal",
      "No login, no subscription, zero tracking — privacy-first in browser",
      "Nepali date converter (Bikram Sambat ↔ Gregorian) with official tithi",
      "Nepal income tax calculator updated for FY 2082/83 slabs",
      "Preeti to Unicode converter, Nepali CV builder & PDF compress tools",
    ],
    keyWorkflows: [
      { time: "0:20", title: "Bikram Sambat ↔ AD Conversion", desc: "Dual date lookup with age calculator and Nepali public holiday calendar" },
      { time: "0:55", title: "Salary Tax & Loan EMI Calculator", desc: "Instant monthly loan payment schedules and progressive Nepal tax slabs" },
      { time: "1:30", title: "Unicode, QR & Document Utilities", desc: "Fix typing font encoding, generate payment QRs, and prepare CVs" },
    ],
    audience: "Nepali students, professionals, accountants, business owners",
    consultService: "JigriTools Enquiry",
    planHint: "Completely Free · No credit card or sign-up required",
    active: true,
    featured: false,
  },
];

/**
 * Extracts a safe YouTube embed URL from various video URL formats
 * (e.g. standard watch URL, youtu.be shortlink, youtube.com/embed, shorts).
 */
export function parseYouTubeEmbed(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already an embed URL
  if (trimmed.includes("youtube.com/embed/")) {
    const idMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    return idMatch ? `https://www.youtube-nocookie.com/embed/${idMatch[1]}?rel=0&modestbranding=1` : trimmed;
  }

  // youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) {
    return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?rel=0&modestbranding=1`;
  }

  // youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  // youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1`;
  }

  return null;
}

/**
 * Generates direct WhatsApp click-to-chat URL with product-specific context
 */
export function getWhatsAppDemoLink(demo: SoftwareDemo): string {
  const phone = "9779813714582";
  const text = `Hello Prixna IT Solution, I watched the demo for *${demo.name}* (${demo.id}). I am interested in a free consultation and pricing for my business.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Reads demos from localStorage (if edited by staff in dashboard) with fallback to default list
 */
export function getDemosFromStorage(): SoftwareDemo[] {
  if (typeof window === "undefined") return DEFAULT_DEMOS;
  try {
    const raw = localStorage.getItem(DEMOS_STORAGE_KEY);
    if (!raw) return DEFAULT_DEMOS;
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.demos || [];
    if (!list.length) return DEFAULT_DEMOS;

    // Merge default workflow enhancements if custom list lacks keyWorkflows
    return list.map((item: Partial<SoftwareDemo>) => {
      const fallback = DEFAULT_DEMOS.find((d) => d.id === item.id);
      return {
        ...(fallback || DEFAULT_DEMOS[0]),
        ...item,
        keyWorkflows: item.keyWorkflows || fallback?.keyWorkflows || [],
        features: item.features || fallback?.features || [],
      } as SoftwareDemo;
    });
  } catch {
    return DEFAULT_DEMOS;
  }
}

/**
 * Finds a specific demo by id or fallback to first
 */
export function getDemoById(id?: string | null, list?: SoftwareDemo[]): SoftwareDemo {
  const all = list && list.length ? list : DEFAULT_DEMOS;
  if (!id) return all[0];
  const found = all.find((d) => d.id.toLowerCase() === id.toLowerCase());
  return found || all[0];
}
