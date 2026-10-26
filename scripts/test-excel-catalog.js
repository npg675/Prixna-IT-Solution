const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

console.log("=== Testing Excel Business Data in AI Brain ===");

// 1. Test Excel creation using XLSX
const sampleData = [
  {
    "Product / Service Name": "Hikvision 4-Camera HD 2MP Night Vision Kit",
    Category: "CCTV & Security",
    "Price (NPR)": "Rs. 28,500",
    "Stock Availability": "In stock",
    "Warranty Period": "1 Year Official Warranty",
    "Key Specifications / Features": "2 Indoor Dome + 2 Outdoor Bullet 1080p, 4CH DVR, 1TB Seagate HDD",
    "Special Notes": "Free site inspection in Kathmandu Valley."
  },
  {
    "Product / Service Name": "Dell Inspiron 15 3520 (Intel Core i5 12th Gen)",
    Category: "Laptops & Computers",
    "Price (NPR)": "Rs. 72,500",
    "Stock Availability": "In stock",
    "Warranty Period": "1 Year Brand Warranty",
    "Key Specifications / Features": "Core i5-1235U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6 FHD 120Hz display",
    "Special Notes": "Free laptop bag, wireless mouse, and mouse pad included."
  },
  {
    "Product / Service Name": "High-Speed NVMe M.2 SSD 512GB (Kingston)",
    Category: "Hardware & Upgrades",
    "Price (NPR)": "Rs. 4,800",
    "Stock Availability": "In stock",
    "Warranty Period": "3 Years Replacement Warranty",
    "Key Specifications / Features": "Up to 3500MB/s read speed, PCIe Gen 3x4",
    "Special Notes": "Includes 100% safe Windows & data cloning in Koteshwor."
  }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);
XLSX.utils.book_append_sheet(wb, ws, "Prixna Products");
const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

console.log("1. Generated test Excel buffer:", buf.length, "bytes");

// 2. Test reading back workbook
const readWb = XLSX.read(buf, { type: "buffer" });
const sheetName = readWb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(readWb.Sheets[sheetName]);
console.log("2. Read rows from sheet:", rows.length);

if (rows.length !== 3) {
  console.error("FAIL: Expected 3 rows, got", rows.length);
  process.exit(1);
}

// 3. Test saving to data/ai-catalog.json
const catalogObj = {
  fileName: "Prixna_Products_Test.xlsx",
  uploadedAt: new Date().toISOString(),
  rowCount: rows.length,
  items: rows.map((r, i) => ({
    id: "test-" + (i + 1),
    name: r["Product / Service Name"],
    category: r["Category"],
    price: r["Price (NPR)"],
    stock: r["Stock Availability"],
    warranty: r["Warranty Period"],
    specs: r["Key Specifications / Features"],
    notes: r["Special Notes"]
  })),
  summaryText: "=== LIVE COMPANY PRODUCT CATALOGUE & PRICING ===\nTotal items: " + rows.length
};

fs.writeFileSync(path.join(__dirname, "../data/ai-catalog.json"), JSON.stringify(catalogObj, null, 2));
console.log("3. Wrote test catalog to data/ai-catalog.json");

// 4. Test client-side search engine in prixna-ai.js
const aiCode = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");

// Extract searchExcelProducts and formatExcelResults
const searchFunc = aiCode.match(/function searchExcelProducts[\s\S]*?^}/m)?.[0];
const formatFunc = aiCode.match(/function formatExcelResults[\s\S]*?^}/m)?.[0];

const runnerEnv = `
var state = { mode: "idle", step: 0, data: {} };
var excelCatalog = ${JSON.stringify(catalogObj)};
function esc(s){ return String(s||''); }
var PHONE_HREF = "tel:+9779813714582";
var PHONE_DISP = "+977 9813714582";

${searchFunc}
${formatFunc}

return { searchExcelProducts, formatExcelResults };
`;

const runner = new Function(runnerEnv)();

// Test search queries
const queries = [
  { q: "What is the price of Hikvision 4-camera set?", expected: "Hikvision" },
  { q: "dell laptop price kati parchha?", expected: "Dell Inspiron" },
  { q: "do you have 512gb ssd in stock?", expected: "SSD 512GB" }
];

queries.forEach(t => {
  const matches = runner.searchExcelProducts(t.q);
  console.log(`\nQuery: "${t.q}"`);
  console.log(`- Matched products count: ${matches.length}`);
  if (matches.length > 0) {
    console.log(`- Top match: "${matches[0].name}" — ${matches[0].price} (${matches[0].stock})`);
    const neFormatted = runner.formatExcelResults(matches, true);
    console.log(`- Formatted Nepali response preview: "${neFormatted.split("\n")[1]}"`);
    if (matches[0].name.toLowerCase().includes(t.expected.toLowerCase())) {
      console.log("  PASS: Correct item matched!");
    } else {
      console.error("  FAIL: Expected match to include", t.expected);
      process.exit(1);
    }
  } else {
    console.error("  FAIL: No product matched query", t.q);
    process.exit(1);
  }
});

console.log("\nSUCCESS: Excel business data integration verified 100%!");
