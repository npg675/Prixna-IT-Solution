// Test script to verify email collection in Prixna AI booking flows
const fs = require("fs");
const path = require("path");

const widgetCode = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");

// Set up mock browser environment
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
    _dump: () => store
  };
})();

// Seed catalog for testing
localStorageMock.setItem("prixna_excel_catalog_v2", JSON.stringify({
  items: [
    {
      name: "Dell Inspiron 15 3520 (Intel Core i5 12th Gen)",
      category: "Laptops & Computers",
      price: "Rs. 72,500",
      stock: "In stock",
      warranty: "1 Year Brand Warranty",
      specs: "Core i5-1235U, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6 FHD 120Hz display",
      notes: "Free laptop bag, wireless mouse, and mouse pad included."
    }
  ]
}));

const domListeners = [];
const makeEl = () => ({
  innerHTML: "",
  textContent: "",
  style: {},
  classList: { add: () => {}, remove: () => {}, contains: () => false },
  appendChild: () => {},
  setAttribute: () => {},
  addEventListener: () => {},
  focus: () => {},
  click: () => {},
  remove: () => {}
});

const mockDoc = {
  addEventListener: (ev, fn) => domListeners.push(fn),
  readyState: "loading", // Don't auto-boot buildUI during parse
  querySelector: (sel) => makeEl(),
  body: makeEl(),
  head: makeEl(),
  createElement: (tag) => makeEl()
};

const sandbox = {
  window: {
    location: { pathname: "/test", origin: "http://localhost:3000" },
    localStorage: localStorageMock,
    document: mockDoc,
    PRIXNA: { phoneDisplay: "+977 9813714582", whatsappNumber: "9779813714582", email: "info@prixnaitsolution.com.np" },
    __PRIXNA_AI_LOADED: false
  },
  document: mockDoc,
  localStorage: localStorageMock,
  location: { pathname: "/test" },
  setTimeout: (fn) => fn(),
  console: console
};

// Evaluate the script inside context
const vm = require("vm");
const ctx = vm.createContext(sandbox);
vm.runInContext(widgetCode, ctx);

// Test harness functions via window.PRIXNA_AI or internal methods
// Let's test by inspecting handleFlow via simulated state
console.log("=== RUNNING PRIXNA AI BOOKING EMAIL TESTS ===");

// We can run test flows by calling window.PRIXNA_AI.ask or directly testing
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

// Check that window.PRIXNA_AI is initialized
assert(typeof sandbox.window.PRIXNA_AI === "object", "PRIXNA_AI is exposed on window");

// Run simulation inside the context
const results = vm.runInContext(`
  (function() {
    var ai = window.PRIXNA_AI._internal;
    
    // Test 1: Product Reservation (Dell Inspiron Laptop) with Email
    ai.resetState("en");
    
    // 1. Initial product booking enquiry
    var q0 = "i need Dell Inspiron 15 3520 laptop can you book for me";
    var a0 = ai.getContextualAnswer(q0, false);
    
    var step1Name = "Bikash Adhikari";
    var a1 = ai.handleFlow(step1Name);
    
    var step2Phone = "9813714582";
    var a2 = ai.handleFlow(step2Phone);
    
    var step3Email = "bikash.adhikari@gmail.com";
    var a3 = ai.handleFlow(step3Email);
    
    var step4Slot = "Tomorrow 2 PM, Koteshwor pickup";
    var a4 = ai.handleFlow(step4Slot);
    
    var bookings = JSON.parse(localStorage.getItem("prixna_bookings_v1") || "[]");
    var leads = JSON.parse(localStorage.getItem("prixna_leads_v1") || "[]");
    
    var latestBooking = bookings[0] || {};
    var latestLead = leads[0] || {};
    
    // Test 2: General Booking Flow with Nepali and Skip Email
    ai.resetState("ne");
    var gen0 = ai.answerFor("booking", "book");
    var gen1 = ai.handleFlow("सरिता श्रेष्ठ");
    var gen2 = ai.handleFlow("9841234567");
    var gen3 = ai.handleFlow("skip"); // Skip email
    var gen4 = ai.handleFlow("2"); // CCTV install
    var gen5 = ai.handleFlow("आइतबार बिहान ११ बजे, कोटेश्वर");
    
    var bookingsAfterGen = JSON.parse(localStorage.getItem("prixna_bookings_v1") || "[]");
    var genBooking = bookingsAfterGen[0] || {};

    return {
      productFlow: { a0: a0, a1: a1, a2: a2, a3: a3, a4: a4, booking: latestBooking, lead: latestLead },
      generalFlow: { gen0: gen0, gen1: gen1, gen2: gen2, gen3: gen3, gen4: gen4, gen5: gen5, booking: genBooking }
    };
  })()
`, ctx);

// Verify Test 1 (Product Reservation with Email)
console.log("\n--- Product Reservation Flow Assertions ---");
assert(results.productFlow.a0 && results.productFlow.a0.includes("Step 1/4"), "Step 1 asks for full name with Step 1/4");
assert(results.productFlow.a1 && results.productFlow.a1.includes("Step 2/4") && results.productFlow.a1.includes("phone / WhatsApp"), "Step 2 asks for phone / WhatsApp number");
assert(results.productFlow.a2 && results.productFlow.a2.includes("Step 3/4") && results.productFlow.a2.includes("email address"), "Step 3 asks for email address immediately after phone");
assert(results.productFlow.a3 && results.productFlow.a3.includes("Step 4/4") && results.productFlow.a3.includes("bikash.adhikari@gmail.com"), "Step 4 acknowledges email and asks for delivery/pickup address");
assert(results.productFlow.a4 && results.productFlow.a4.includes("Booking Confirmed") && results.productFlow.a4.includes("bikash.adhikari@gmail.com"), "Final confirmation card shows recorded email address");
assert(results.productFlow.booking.email === "bikash.adhikari@gmail.com", "Booking record in prixna_bookings_v1 has email saved");
assert(results.productFlow.booking.name === "Bikash Adhikari", "Booking record has correct customer name");
assert(results.productFlow.booking.phone === "9813714582", "Booking record has correct phone number");
assert(results.productFlow.lead.email === "bikash.adhikari@gmail.com", "Lead record in prixna_leads_v1 has email saved");

// Verify Test 2 (Nepali General Booking with Skip)
console.log("\n--- Nepali General Booking Flow Assertions (with 'skip') ---");
assert(results.generalFlow.gen0 && results.generalFlow.gen0.includes("चरण १/५"), "General booking asks for full name with चरण १/५");
assert(results.generalFlow.gen1 && results.generalFlow.gen1.includes("चरण २/५"), "Step 2 asks for सम्पर्क वा WhatsApp नम्बर with चरण २/५");
assert(results.generalFlow.gen2 && results.generalFlow.gen2.includes("चरण ३/५") && results.generalFlow.gen2.includes("इमेल ठेगाना"), "Step 3 asks for इमेल ठेगाना (Email) right after contact number");
assert(results.generalFlow.gen3 && results.generalFlow.gen3.includes("चरण ४/५") && results.generalFlow.gen3.includes("सफ्टवेयर"), "Allows skipping email gracefully and transitions to service menu");
assert(results.generalFlow.gen4 && results.generalFlow.gen4.includes("चरण ५/५"), "Step 5 asks for preferred day and time");
assert(results.generalFlow.gen5 && results.generalFlow.gen5.includes("बुकिङ सुरक्षित भयो"), "Final Nepali confirmation completes successfully");
assert(results.generalFlow.booking.name === "सरिता श्रेष्ठ", "Nepali booking record saved customer name");
assert(results.generalFlow.booking.phone === "9841234567", "Nepali booking record saved customer phone");
assert(results.generalFlow.booking.email === "", "Email is empty string when skipped without error");

console.log("\n==========================================");
console.log("TEST SUMMARY: Passed: " + passed + ", Failed: " + failed);
if (failed > 0) process.exit(1);
