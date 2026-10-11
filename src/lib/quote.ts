/* Quotation math and utilities for Prixna IT Solution.
   Supports NPR lakh grouping, number-to-words, package presets, and item parsing. */

export interface QRow {
  qty: number;
  desc: string;
  price: number;
  unit?: string;
  warranty?: string;
}

export interface QTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  vat: number;
  total: number;
  advance: number;
}

export function parseItems(text: string): QRow[] {
  const lines = String(text || "")
    .replace(/^[\s\S]*?BULK LIST:\s*/i, "")
    .split(/\n/);
  const out: QRow[] = [];
  for (const raw of lines) {
    const line = String(raw || "")
      .trim()
      .replace(/^[•\-*]+\s*/, "")
      .replace(/^\d+[.)]\s*/, "");
    if (!line) continue;
    if (/^(bulk list|preferred|contact via|product ref|my reference)/i.test(line)) continue;
    const m = line.match(/^(\d+)\s*(?:x|×|\*|pcs?|units?|nos?|sets?|pics?)?\s*[-:–.]?\s*(.+)$/i);
    if (m) out.push({ qty: parseInt(m[1], 10), desc: m[2].trim(), price: 0, unit: "Pcs" });
    else out.push({ qty: 1, desc: line, price: 0, unit: "Pcs" });
  }
  return out;
}

export function computeTotals(
  rows: QRow[],
  discountNPR: number,
  vatPct: number,
  vatOn: boolean,
  advancePct: number
): QTotals {
  const sub = (rows || []).reduce(
    (a, r) => a + Math.max(0, +r.qty || 0) * Math.max(0, +r.price || 0),
    0
  );
  const disc = Math.min(Math.max(0, +discountNPR || 0), sub);
  const taxable = sub - disc;
  const vat = vatOn ? (taxable * Math.max(0, +vatPct || 0)) / 100 : 0;
  const total = taxable + vat;
  const advance = (total * Math.max(0, +advancePct || 0)) / 100;
  const r = (n: number) => Math.round(n);
  return {
    subtotal: r(sub),
    discount: r(disc),
    taxable: r(taxable),
    vat: r(vat),
    total: r(total),
    advance: r(advance),
  };
}

export function newQuoteId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `Q-${ymd}-${rand}`;
}

/** Convert NPR amount into formal English words (e.g. 74500 -> "Seventy Four Thousand Five Hundred Rupees Only") */
export function numberToWordsNPR(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertBelowThousand(n: number): string {
    let s = "";
    if (n >= 100) {
      s += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      s += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      s += ones[n] + " ";
    }
    return s.trim();
  }

  let n = Math.floor(num);
  let words = "";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remaining = n;

  if (crore > 0) words += convertBelowThousand(crore) + " Crore ";
  if (lakh > 0) words += convertBelowThousand(lakh) + " Lakh ";
  if (thousand > 0) words += convertBelowThousand(thousand) + " Thousand ";
  if (remaining > 0) words += convertBelowThousand(remaining) + " ";

  return words.trim() ? `${words.trim()} Rupees Only` : "Zero Rupees Only";
}

export interface PresetPackage {
  id: string;
  name: string;
  category: string;
  rows: QRow[];
}

export const PRESET_PACKAGES: PresetPackage[] = [
  {
    id: "cctv-4ch",
    name: "🎥 4-Camera HD CCTV Surveillance Setup",
    category: "CCTV & Security",
    rows: [
      { qty: 2, desc: "Hikvision 2MP HD Indoor Dome Camera with Night Vision", price: 2800, unit: "Pcs", warranty: "1 Year" },
      { qty: 2, desc: "Hikvision 2MP HD Outdoor Bullet Camera (Weatherproof)", price: 3200, unit: "Pcs", warranty: "1 Year" },
      { qty: 1, desc: "Hikvision 4-Channel Turbo HD DVR (H.265+ Compression)", price: 6200, unit: "Pcs", warranty: "1 Year" },
      { qty: 1, desc: "Seagate SkyHawk 1TB Surveillance Hard Drive", price: 6800, unit: "Pcs", warranty: "2 Years" },
      { qty: 1, desc: "CCTV Central Power Supply 12V 5A & Connectors Set", price: 2200, unit: "Set", warranty: "6 Months" },
      { qty: 1, desc: "Professional Cabling, Channel Fitting & Mobile App Live Setup", price: 4500, unit: "Lot", warranty: "Service" },
    ],
  },
  {
    id: "cctv-8ch",
    name: "🎥 8-Camera Complete Surveillance Solution",
    category: "CCTV & Security",
    rows: [
      { qty: 4, desc: "Hikvision 2MP HD Indoor Dome Infrared Camera", price: 2800, unit: "Pcs", warranty: "1 Year" },
      { qty: 4, desc: "Hikvision 2MP HD Outdoor Bullet Metal Camera", price: 3200, unit: "Pcs", warranty: "1 Year" },
      { qty: 1, desc: "Hikvision 8-Channel HD DVR with Cloud Live View", price: 8500, unit: "Pcs", warranty: "1 Year" },
      { qty: 1, desc: "Seagate SkyHawk 2TB Surveillance Hard Drive", price: 9200, unit: "Pcs", warranty: "2 Years" },
      { qty: 1, desc: "CCTV 8-Channel Central Power Supply & BNC/DC Set", price: 3800, unit: "Set", warranty: "6 Months" },
      { qty: 1, desc: "Full On-Site Installation, Routing & Technician Configuration", price: 8500, unit: "Lot", warranty: "Service" },
    ],
  },
  {
    id: "dell-laptop",
    name: "💻 Dell Inspiron 15 Business Laptop Setup",
    category: "Laptops & Computers",
    rows: [
      { qty: 1, desc: "Dell Inspiron 15 3520 (Intel Core i5-1235U, 16GB RAM, 512GB NVMe SSD, 15.6 FHD 120Hz)", price: 72500, unit: "Unit", warranty: "1 Year Brand" },
      { qty: 1, desc: "Dell Original Laptop Backpack & Wireless Optical Mouse", price: 0, unit: "Set", warranty: "Complimentary" },
      { qty: 1, desc: "Operating System Configuration, Essential Software & Optimization", price: 0, unit: "Service", warranty: "Lifetime Support" },
    ],
  },
  {
    id: "speed-upgrade",
    name: "⚡ Laptop / PC Speed Upgrade (SSD + RAM)",
    category: "Hardware & Upgrades",
    rows: [
      { qty: 1, desc: "Kingston / Lexar 512GB M.2 NVMe High-Speed SSD (Up to 3500MB/s)", price: 4800, unit: "Pcs", warranty: "3 Years Replacement" },
      { qty: 1, desc: "Crucial 8GB DDR4 3200MHz Laptop RAM Stick", price: 2800, unit: "Pcs", warranty: "1 Year Replacement" },
      { qty: 1, desc: "100% Safe Windows OS & Data Cloning + Thermal Paste Servicing", price: 1200, unit: "Service", warranty: "Express 30 Mins" },
    ],
  },
  {
    id: "jigri-erp",
    name: "💼 Jigri ERP Billing & Stock System (Retail/Wholesale)",
    category: "Software & SaaS",
    rows: [
      { qty: 1, desc: "Jigri ERP Annual License (IRD-Approved VAT & Non-VAT Billing + Stock & Ledgers)", price: 15000, unit: "Year", warranty: "Free Updates" },
      { qty: 1, desc: "On-Site Installation, Company Master Data Setup & Staff Training", price: 3000, unit: "Lot", warranty: "Included" },
      { qty: 1, desc: "Thermal Barcode Label & Receipt Printer Integration", price: 0, unit: "Service", warranty: "Included" },
    ],
  },
  {
    id: "biometric-setup",
    name: "👤 Biometric Attendance & Access Control Setup",
    category: "Biometric & Attendance",
    rows: [
      { qty: 1, desc: "Biometric Face + Fingerprint Recognition Device (Wi-Fi + LAN)", price: 14500, unit: "Unit", warranty: "1 Year Official" },
      { qty: 1, desc: "Jigri eHajiri Cloud Payroll Sync & Automated Attendance Setup", price: 2500, unit: "Lot", warranty: "Dedicated Support" },
      { qty: 1, desc: "On-Site Wall Mounting, Network Cable Connection & Admin Walkthrough", price: 2000, unit: "Service", warranty: "Service" },
    ],
  },
];
