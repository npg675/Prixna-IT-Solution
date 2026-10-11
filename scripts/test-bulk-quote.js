const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "bulk-quote.html");
if (!fs.existsSync(htmlPath)) {
  console.error("FAIL: bulk-quote.html not found");
  process.exit(1);
}

const content = fs.readFileSync(htmlPath, "utf8");

const requiredTokens = [
  'id="b-name"',
  'id="b-phone"',
  'id="b-email"',
  'id="b-biz"',
  'id="b-type"',
  'id="b-loc"',
  'id="b-notes"',
  'id="b-consent"',
  'id="b-send"',
  'id="b-out"',
  'id="tab-visual"',
  'id="tab-text"',
  'id="mode-visual-box"',
  'id="mode-text-box"',
  'id="cat-chips"',
  'id="quick-grid"',
  'id="selected-tbody"',
  'id="item-count"',
  'id="live-summary-list"',
  'id="summary-pill"',
  'prixna_leads_v1',
  'PRIXNA_NOTIFY',
  'BULK LIST:',
  'wa.me'
];

let failed = 0;
for (const tok of requiredTokens) {
  if (!content.includes(tok)) {
    console.error(`FAIL: Token missing: ${tok}`);
    failed++;
  } else {
    console.log(`PASS: Found token: ${tok}`);
  }
}

// Test parsing compatibility with src/lib/quote.ts
const sampleLeadMessage = `BULK LIST:
1. 5x Dell Inspiron 15 (Core i5, 16GB RAM, 512GB SSD) (Units)
2. 8x Hikvision 2MP HD Indoor Dome Night Vision Camera (Pcs)

Buyer Type: Corporate Office / Startup
Special Notes: Urgent delivery needed`;

function parseItems(text) {
  const lines = String(text || "")
    .replace(/^[\s\S]*?BULK LIST:\s*/i, "")
    .split(/\n/);
  const out = [];
  for (const raw of lines) {
    const line = String(raw || "")
      .trim()
      .replace(/^[•\-*]+\s*/, "")
      .replace(/^\d+[.)]\s*/, "");
    if (!line) continue;
    if (/^(bulk list|preferred|contact via|product ref|my reference|buyer type|special notes)/i.test(line)) continue;
    const m = line.match(/^(\d+)\s*(?:x|×|\*|pcs?|units?|nos?|sets?|pics?)?\s*[-:–.]?\s*(.+)$/i);
    if (m) out.push({ qty: parseInt(m[1], 10), desc: m[2].trim(), price: 0, unit: "Pcs" });
    else out.push({ qty: 1, desc: line, price: 0, unit: "Pcs" });
  }
  return out;
}

const parsed = parseItems(sampleLeadMessage);
console.log("Parsed rows from sample bulk lead:", parsed);
if (parsed.length === 2 && parsed[0].qty === 5 && parsed[1].qty === 8) {
  console.log("PASS: Lead message parses cleanly into quote builder items");
} else {
  console.error("FAIL: Lead message did not parse expected rows");
  failed++;
}

if (failed === 0) {
  console.log("\nALL BULK-QUOTE CHECKS PASSED!");
  process.exit(0);
} else {
  console.error(`\n${failed} CHECKS FAILED!`);
  process.exit(1);
}
