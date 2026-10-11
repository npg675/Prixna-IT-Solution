// Test script for Quotation Builder math, presets, and numberToWords
const { computeTotals, numberToWordsNPR, parseItems, PRESET_PACKAGES } = require("../src/lib/quote");

console.log("=== TESTING QUOTATION BUILDER LOGIC ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log("✅ PASS:", message);
    passed++;
  } else {
    console.error("❌ FAIL:", message);
    failed++;
  }
}

// 1. Test Number-to-Words for NPR
console.log("\n1. Number-to-Words Tests:");
assert(numberToWordsNPR(74500) === "Seventy Four Thousand Five Hundred Rupees Only", "74,500 converted correctly");
assert(numberToWordsNPR(100000) === "One Lakh Rupees Only", "1,00,000 converted to One Lakh");
assert(numberToWordsNPR(28500) === "Twenty Eight Thousand Five Hundred Rupees Only", "28,500 converted correctly");
assert(numberToWordsNPR(1500) === "One Thousand Five Hundred Rupees Only", "1,500 converted correctly");
assert(numberToWordsNPR(0) === "Zero Rupees Only", "0 converted correctly");

// 2. Test Presets
console.log("\n2. Preset Packages Tests:");
assert(PRESET_PACKAGES.length >= 6, "At least 6 preset packages defined");
const cctv4 = PRESET_PACKAGES.find(p => p.id === "cctv-4ch");
assert(cctv4 && cctv4.rows.length === 6, "4-Camera CCTV package contains 6 items");

// 3. Test Totals Computation with 13% VAT & 30% Advance
console.log("\n3. Financial Calculations Tests:");
const sampleRows = [
  { qty: 1, desc: "Dell Laptop", price: 72500 },
  { qty: 1, desc: "RAM 8GB", price: 2800 },
];
const totalsWithVat = computeTotals(sampleRows, 1300, 13, true, 30);
// Subtotal = 75300
// Discount = 1300
// Taxable = 74000
// VAT (13%) = 9620
// Total = 83620
// Advance (30%) = 25086
assert(totalsWithVat.subtotal === 75300, "Subtotal is 75,300");
assert(totalsWithVat.discount === 1300, "Discount is 1,300");
assert(totalsWithVat.taxable === 74000, "Taxable amount is 74,000");
assert(totalsWithVat.vat === 9620, "VAT 13% is 9,620");
assert(totalsWithVat.total === 83620, "Grand total is 83,620");
assert(totalsWithVat.advance === 25086, "Advance 30% is 25,086");

// Non-VAT calculation
const totalsNoVat = computeTotals(sampleRows, 0, 13, false, 30);
assert(totalsNoVat.vat === 0, "Non-VAT has 0 VAT");
assert(totalsNoVat.total === 75300, "Grand total without VAT equals subtotal");

// 4. Test Bulk List Text Parsing
console.log("\n4. Parse Items from Lead Message:");
const leadMsg = "BULK LIST:\n• 4x Hikvision bullet camera\n• 1x 8CH DVR\n• 2x 1TB HDD";
const parsed = parseItems(leadMsg);
assert(parsed.length === 3, "Parsed 3 items from lead message");
assert(parsed[0].qty === 4 && parsed[0].desc === "Hikvision bullet camera", "Parsed row 1 correctly");
assert(parsed[1].qty === 1 && parsed[1].desc === "8CH DVR", "Parsed row 2 correctly");

console.log("\n==========================================");
console.log(`TEST SUMMARY: Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
