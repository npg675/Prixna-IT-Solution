import fs from "fs";
import path from "path";
import { invalidateProductCache } from "./ai-memory-cache";

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: string;
  priceNumeric?: number;
  stock: string;
  warranty: string;
  specs: string;
  notes: string;
}

export interface ExcelCatalogData {
  fileName: string;
  uploadedAt: string;
  rowCount: number;
  items: CatalogItem[];
  summaryText: string;
}

const CATALOG_FILE_PATH = path.join(process.cwd(), "data", "ai-catalog.json");
const PUBLIC_CATALOG_PATH = path.join(process.cwd(), "public", "data", "ai-catalog.json");

export function getExcelCatalog(): ExcelCatalogData | null {
  try {
    if (fs.existsSync(CATALOG_FILE_PATH)) {
      const raw = fs.readFileSync(CATALOG_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[ai-catalog] Failed to read catalog:", err);
  }
  return null;
}

export function saveExcelCatalog(catalog: ExcelCatalogData): void {
  const dir = path.dirname(CATALOG_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CATALOG_FILE_PATH, JSON.stringify(catalog, null, 2), "utf-8");

  // Also sync to public/data so browser scripts/widgets can load it offline/locally
  try {
    const pubDir = path.dirname(PUBLIC_CATALOG_PATH);
    if (!fs.existsSync(pubDir)) {
      fs.mkdirSync(pubDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf-8");
  } catch (e) {
    console.warn("[ai-catalog] Could not write to public/data:", e);
  }

  // Automatically invalidate product memory cache so new prices & stocks take effect immediately!
  try {
    invalidateProductCache();
  } catch (e) {
    console.warn("[ai-catalog] Cache invalidation skipped:", e);
  }
}

export function deleteExcelCatalog(): void {
  try {
    if (fs.existsSync(CATALOG_FILE_PATH)) fs.unlinkSync(CATALOG_FILE_PATH);
    if (fs.existsSync(PUBLIC_CATALOG_PATH)) fs.unlinkSync(PUBLIC_CATALOG_PATH);
    invalidateProductCache();
  } catch (e) {
    console.error("[ai-catalog] Failed to delete catalog:", e);
  }
}

export function buildCatalogSummary(items: CatalogItem[], fileName: string): string {
  const lines: string[] = [];
  lines.push(`=== LIVE COMPANY PRODUCT CATALOGUE & PRICING (FROM UPLOADED EXCEL: ${fileName}) ===`);
  lines.push(`Total verified items: ${items.length} | Last Updated: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })} (Nepal Time)`);
  lines.push(`\nPRICING & STOCK RULES FOR AI ASSISTANT:`);
  lines.push(`1. Always quote these exact NPR (रु.) prices when customers ask about pricing, rates, or quotation.`);
  lines.push(`2. If a customer asks about stock availability or warranty, state the exact status recorded below.`);
  lines.push(`3. When answering in Nepali, write the currency as 'रु.' or 'NPR' with polite Nepali phrasing.`);
  lines.push(`4. FOCUSED MAIN POINT FIRST: In your initial response, state ONLY the direct answer (Product Name, exact Price, Stock status). DO NOT dump long specs strings initially.`);
  lines.push(`5. BRIEF SAME-CATEGORY RECOMMENDATIONS: Suggest 1 or 2 similar options from the same category with just Name and Price.`);
  lines.push(`6. PROGRESSIVE DISCLOSURE (TOKEN OPTIMIZATION): Ask if they would like full technical specifications or want to book. Reveal full specs only upon customer request.\n`);
  lines.push(`ITEM LIST:`);

  items.slice(0, 150).forEach((it, idx) => {
    const parts = [
      `${idx + 1}. [${it.category || "General"}] ${it.name}`,
      `Price: ${it.price || "Contact for Quote"}`,
      `Stock: ${it.stock || "Available"}`,
    ];
    if (it.warranty) parts.push(`Warranty: ${it.warranty}`);
    if (it.specs) parts.push(`Specs: ${it.specs}`);
    if (it.notes) parts.push(`Note: ${it.notes}`);
    lines.push(`• ${parts.join(" | ")}`);
  });

  if (items.length > 150) {
    lines.push(`...and ${items.length - 150} additional products in catalog.`);
  }

  lines.push(`================================================================================`);
  return lines.join("\n");
}

export const SAMPLE_EXCEL_PRODUCTS: Omit<CatalogItem, "id">[] = [
  {
    name: "Hikvision 4-Camera HD 2MP Night Vision Kit",
    category: "CCTV & Security",
    price: "Rs. 28,500",
    priceNumeric: 28500,
    stock: "In stock",
    warranty: "1 Year Official Warranty",
    specs: "2 Indoor Dome + 2 Outdoor Bullet 1080p, 4CH DVR, 1TB Seagate HDD, power supply & cables",
    notes: "Free site inspection in Kathmandu Valley. Mobile app live view included.",
  },
  {
    name: "Hikvision 8-Camera Complete Surveillance Set",
    category: "CCTV & Security",
    price: "Rs. 48,000",
    priceNumeric: 48000,
    stock: "In stock",
    warranty: "1 Year Official Warranty",
    specs: "4 Dome + 4 Bullet cameras, 8CH DVR, 2TB Surveillance HDD, full wiring setup",
    notes: "Ideal for retail marts, schools, and 3-story buildings.",
  },
  {
    name: "Dahua 2MP Smart Wi-Fi 360° Pan-Tilt Camera",
    category: "CCTV & Security",
    price: "Rs. 4,200",
    priceNumeric: 4200,
    stock: "In stock",
    warranty: "1 Year Replacement",
    specs: "2-way audio intercom, motion auto-tracking, microSD up to 256GB, mobile app live view",
    notes: "Plug & play for home, baby monitoring, or small cash counter.",
  },
  {
    name: "Dell Inspiron 15 3520 (Intel Core i5 12th Gen)",
    category: "Laptops & Computers",
    price: "Rs. 72,500",
    priceNumeric: 72500,
    stock: "In stock",
    warranty: "1 Year Brand Warranty",
    specs: "Core i5-1235U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6\" FHD 120Hz display, Windows 11 Home",
    notes: "Free laptop bag, wireless mouse, and mouse pad included.",
  },
  {
    name: "HP 250 G9 Business Laptop (Intel Core i3 12th Gen)",
    category: "Laptops & Computers",
    price: "Rs. 54,000",
    priceNumeric: 54000,
    stock: "In stock",
    warranty: "1 Year Brand Warranty",
    specs: "Core i3-1215U, 8GB RAM (expandable), 256GB NVMe SSD, 15.6\" FHD Anti-glare",
    notes: "Best value for accounting, billing, and office work.",
  },
  {
    name: "Lenovo ThinkPad E14 Gen 5 (Intel Core i7 13th Gen)",
    category: "Laptops & Computers",
    price: "Rs. 118,000",
    priceNumeric: 118000,
    stock: "In stock (2 units left)",
    warranty: "1 Year International Warranty",
    specs: "Core i7-1355U, 16GB DDR4, 512GB SSD, Backlit keyboard, Fingerprint reader, Military-grade build",
    notes: "Heavy multitasker for executives and software developers.",
  },
  {
    name: "High-Speed NVMe M.2 SSD 512GB (Kingston / Lexar)",
    category: "Hardware & Upgrades",
    price: "Rs. 4,800",
    priceNumeric: 4800,
    stock: "In stock",
    warranty: "3 Years Replacement Warranty",
    specs: "Up to 3500MB/s read speed, PCIe Gen 3x4 / Gen 4x4",
    notes: "Includes 100% safe Windows & data cloning + 30-min express installation in Koteshwor.",
  },
  {
    name: "High-Speed NVMe M.2 SSD 1TB (Crucial / Kingston)",
    category: "Hardware & Upgrades",
    price: "Rs. 8,500",
    priceNumeric: 8500,
    stock: "In stock",
    warranty: "3 Years Replacement Warranty",
    specs: "PCIe 4.0 NVMe, read speeds up to 5000MB/s",
    notes: "Full OS and software migration included without data loss.",
  },
  {
    name: "Laptop RAM 8GB DDR4 3200MHz (Crucial / Kingston)",
    category: "Hardware & Upgrades",
    price: "Rs. 2,800",
    priceNumeric: 2800,
    stock: "In stock",
    warranty: "1 Year Replacement Warranty",
    specs: "DDR4 3200MHz SODIMM for laptop upgrade",
    notes: "Instant testing and fitting while you wait (15 mins).",
  },
  {
    name: "Laptop RAM 16GB DDR4 3200MHz (Crucial)",
    category: "Hardware & Upgrades",
    price: "Rs. 5,200",
    priceNumeric: 5200,
    stock: "In stock",
    warranty: "1 Year Replacement Warranty",
    specs: "16GB Single stick SODIMM DDR4 3200MHz",
    notes: "Boosts multitasking performance for Adobe, AutoCAD, and heavy browser tabs.",
  },
  {
    name: "Laptop Chip-Level Motherboard Repair (No Power / Short Circuit)",
    category: "Repair & Maintenance",
    price: "Rs. 1,500 – Rs. 4,500",
    stock: "Service Available Daily",
    warranty: "3 Months Service Warranty",
    specs: "Power IC, MOSFET, charging section, liquid damage cleaning, BIOS reprogramming",
    notes: "Free diagnostics & quote before repair. No fix = No charge policy.",
  },
  {
    name: "Laptop Broken Hinge & Body Fabrication Repair",
    category: "Repair & Maintenance",
    price: "Rs. 1,200 – Rs. 2,500",
    stock: "Service Available Daily",
    warranty: "6 Months Structural Warranty",
    specs: "Laser brass nut fitting, panel crack bonding, original movement restoration",
    notes: "Same-day express repair at Koteshwor branch.",
  },
  {
    name: "Jigri ERP Billing & Inventory Software (Retail / Wholesale)",
    category: "Software & SaaS",
    price: "Rs. 15,000 / Year (or Rs. 25,000 Lifetime License)",
    stock: "Active / Instant Deployment",
    warranty: "Free Updates + Phone & Remote Support",
    specs: "IRD-approved VAT/Non-VAT billing, Barcode scanning, Stock alert, Ledger & Profit reports",
    notes: "Free on-site / remote demo. Data migration from old software included.",
  },
  {
    name: "Restaurant POS & KOT Billing System",
    category: "Software & SaaS",
    price: "Rs. 18,000 / Year",
    stock: "Active / Instant Deployment",
    warranty: "Dedicated Technician Support",
    specs: "Table layout, KOT to kitchen printer, Split bills, Discount & tax calculation, Daily cash reports",
    notes: "Supports thermal receipt printers and touch screen displays.",
  },
  {
    name: "Biometric Face + Fingerprint Attendance Device",
    category: "Biometric & Attendance",
    price: "Rs. 14,500",
    priceNumeric: 14500,
    stock: "In stock",
    warranty: "1 Year Warranty",
    specs: "1000 Faces, 3000 Fingerprints, Wi-Fi + LAN connectivity, Excel report export",
    notes: "Seamlessly integrates with Jigri eHajiri for mobile leave & salary calculation.",
  },
  {
    name: "TP-Link Archer C6 AC1200 Dual-Band Gigabit Wi-Fi Router",
    category: "Networking & Accessories",
    price: "Rs. 3,900",
    priceNumeric: 3900,
    stock: "In stock",
    warranty: "1 Year Replacement Warranty",
    specs: "4 External antennas, MU-MIMO, Gigabit WAN + 4 Gigabit LAN ports, 1200Mbps speed",
    notes: "Covers 2-3 bedroom flat or medium office without Wi-Fi drop.",
  },
];
