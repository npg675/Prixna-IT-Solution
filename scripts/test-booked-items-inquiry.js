const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/ai-catalog.json"), "utf8"));

const matchAnySrc = code.match(/function matchAny[\s\S]*?^}/m)?.[0];
const detectIntentSrc = code.match(/function detectIntent[\s\S]*?^}/m)?.[0];
const getContextualAnswerSrc = code.match(/function getContextualAnswer[\s\S]*?^}/m)?.[0];
const searchExcelSrc = code.match(/function searchExcelProducts[\s\S]*?^}/m)?.[0];
const formatExcelSrc = code.match(/function formatExcelResults[\s\S]*?^}/m)?.[0];
const isNepaliSrc = code.match(/var NE_REGEX =[\s\S]*?function isNepali[\s\S]*?^}/m)?.[0];

const env = `
${matchAnySrc}
${isNepaliSrc}
var state = { mode: 'idle', step: 0, data: {}, lang: 'ne' };
var excelCatalog = ${JSON.stringify(catalog)};
var LS_BOOKINGS = 'prixna_bookings_v1';
var fakeLocalStorage = {};
function loadJSON(k, fallback){ return fakeLocalStorage[k] || fallback; }
function saveJSON(k, val){ fakeLocalStorage[k] = val; }
function esc(s){ return s || ''; }
function waLink(t){ return 'https://wa.me/9779813714582?text=' + encodeURIComponent(t); }

${formatExcelSrc}
${searchExcelSrc}
${getContextualAnswerSrc}

return {
  addBooking: function(b){
    var arr = loadJSON(LS_BOOKINGS, []);
    arr.unshift(b);
    saveJSON(LS_BOOKINGS, arr);
  },
  ask: function(q){
    return getContextualAnswer(q, isNepali(q));
  }
};
`;

const bot = new Function(env)();

console.log("=== 1. Test when customer has NO bookings yet ===");
const resNo = bot.ask("What items did I book?");
console.log("Bot Response:\n" + resNo);

console.log("\n=== 2. Customer books 10 items (Bulk Order) + 1 Single Product ===");
bot.addBooking({
  id: "B-501",
  name: "Naresh",
  phone: "9813714582",
  service: "Dell Inspiron 15 (Rs. 74,000)",
  time: "Tomorrow 2:00 PM, Koteshwor pickup"
});

bot.addBooking({
  id: "B-502",
  name: "Naresh",
  phone: "9813714582",
  service: "Bulk Order: 10 different items",
  items: "10x Dell Core i5 Laptop, 8x Hikvision 2MP CCTV, 5x Kingston 512GB SSD, 2x Mikrotik Router, 10x Cat6 Patch Cables, 2x 1TB HDD, 1x Biometric Attendance Machine, 4x HDMI Cables, 2x Laptop Bags, 1x Wireless Mouse",
  time: "Sunday delivery"
});

console.log("\n=== 3. Customer asks in English: 'What did I book?' ===");
const resEn = bot.ask("What items did I book?");
console.log("Bot Response:\n" + resEn);

console.log("\n=== 4. Customer asks in Nepali: 'मैले बुक गरेको सामान के के हुन्?' ===");
const resNe = bot.ask("मैले बुक गरेको सामान के के हुन्?");
console.log("Bot Response:\n" + resNe);
