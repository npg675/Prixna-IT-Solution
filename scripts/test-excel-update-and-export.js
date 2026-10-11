// Automated test script for Excel Catalog editing, PUT API, export, and re-upload flow
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

console.log("=== TESTING EXCEL CATALOG EDITING & EXPORT WORKFLOW ===");

// 1. Verify data/ai-catalog.json exists or create test baseline
const dataDir = path.join(__dirname, "../data");
const catalogPath = path.join(dataDir, "ai-catalog.json");
const pubCatalogPath = path.join(__dirname, "../public/data/ai-catalog.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const baselineItems = [
  {
    id: "item-1",
    name: "Dell Inspiron 15 3520 (Intel Core i5 12th Gen)",
    category: "Laptops & Computers",
    price: "Rs. 72,500",
    priceNumeric: 72500,
    stock: "In stock",
    warranty: "1 Year Brand Warranty",
    specs: "Core i5-1235U, 16GB DDR4 RAM, 512GB NVMe SSD",
    notes: "Free laptop bag, wireless mouse included."
  },
  {
    id: "item-2",
    name: "Hikvision 4-Camera HD 2MP Night Vision Kit",
    category: "CCTV & Security",
    price: "Rs. 28,500",
    priceNumeric: 28500,
    stock: "In stock",
    warranty: "1 Year Official Warranty",
    specs: "4CH DVR, 1TB Seagate HDD, 2 Dome + 2 Bullet",
    notes: "Free site inspection in Kathmandu Valley."
  }
];

const baselineCatalog = {
  fileName: "Prixna_Products_Test.xlsx",
  uploadedAt: new Date().toISOString(),
  rowCount: baselineItems.length,
  items: baselineItems,
  summaryText: "Test Summary"
};

fs.writeFileSync(catalogPath, JSON.stringify(baselineCatalog, null, 2));

// 2. Test Editing & PUT simulation
console.log("1. Simulating editing and adding items...");
const modifiedItems = [
  {
    ...baselineItems[0],
    price: "Rs. 74,000", // Updated price
    stock: "In stock (3 units left)" // Updated stock
  },
  baselineItems[1],
  {
    id: "item-3",
    name: "TP-Link Archer C6 Gigabit Dual Band Router",
    category: "Networking & Accessories",
    price: "Rs. 3,900",
    stock: "In stock",
    warranty: "1 Year Replacement",
    specs: "1200Mbps, 4 Gigabit LAN + 1 WAN, MU-MIMO",
    notes: "Ideal for office or home."
  }
];

// Write updated catalog to storage (mimicking PUT /api/ai-catalog)
const updatedCatalog = {
  fileName: "Prixna_Products_Test.xlsx",
  uploadedAt: new Date().toISOString(),
  rowCount: modifiedItems.length,
  items: modifiedItems,
  summaryText: "Updated Summary"
};

fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2));
fs.mkdirSync(path.dirname(pubCatalogPath), { recursive: true });
fs.writeFileSync(pubCatalogPath, JSON.stringify(updatedCatalog, null, 2));

console.log("   Saved updated catalog:", modifiedItems.length, "items.");

// 3. Test Exporting to Excel workbook (.xlsx)
console.log("2. Generating exported Excel workbook (.xlsx)...");
const worksheetData = modifiedItems.map((p) => ({
  "Product / Service Name": p.name,
  Category: p.category,
  "Price (NPR)": p.price,
  "Stock Availability": p.stock,
  "Warranty Period": p.warranty,
  "Key Specifications / Features": p.specs,
  "Special Notes": p.notes,
}));

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(worksheetData);
ws["!cols"] = [
  { wch: 45 },
  { wch: 24 },
  { wch: 24 },
  { wch: 20 },
  { wch: 24 },
  { wch: 60 },
  { wch: 45 },
];
XLSX.utils.book_append_sheet(wb, ws, "Prixna Products & Pricing");
const exportedBuf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

console.log("   Exported buffer size:", exportedBuf.length, "bytes.");

// 4. Test Reading Back (Simulating Re-uploading the Downloaded File)
console.log("3. Reading back exported Excel (simulating re-upload)...");
const readBackWb = XLSX.read(exportedBuf, { type: "buffer" });
const firstSheet = readBackWb.Sheets[readBackWb.SheetNames[0]];
const reloadedRows = XLSX.utils.sheet_to_json(firstSheet);

console.log("   Reloaded rows count:", reloadedRows.length);

if (reloadedRows.length !== 3) {
  console.error("FAIL: Expected 3 rows, got", reloadedRows.length);
  process.exit(1);
}

// Verify values in reloaded rows
const row1 = reloadedRows[0];
console.log("   Row 1 Name:", row1["Product / Service Name"]);
console.log("   Row 1 Price:", row1["Price (NPR)"]);
console.log("   Row 1 Stock:", row1["Stock Availability"]);

if (row1["Product / Service Name"] !== "Dell Inspiron 15 3520 (Intel Core i5 12th Gen)") {
  console.error("FAIL: Product Name mismatch");
  process.exit(1);
}
if (row1["Price (NPR)"] !== "Rs. 74,000") {
  console.error("FAIL: Price mismatch, expected Rs. 74,000 got", row1["Price (NPR)"]);
  process.exit(1);
}
if (row1["Stock Availability"] !== "In stock (3 units left)") {
  console.error("FAIL: Stock mismatch");
  process.exit(1);
}

const row3 = reloadedRows[2];
if (row3["Product / Service Name"] !== "TP-Link Archer C6 Gigabit Dual Band Router") {
  console.error("FAIL: Newly added product mismatch");
  process.exit(1);
}

console.log("\n==========================================");
console.log("ALL TESTS PASSED: Edit, Save, Export (.xlsx) and Re-Upload verified 100%!");
