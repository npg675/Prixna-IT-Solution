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
function esc(s){ return s || ''; }
var PHONE_HREF = 'tel:+9779813714582';
var PHONE_DISP = '+977 9813714582';
${formatExcelSrc}
${searchExcelSrc}
${getContextualAnswerSrc}
${detectIntentSrc}

return {
  ask: function(q){
    return getContextualAnswer(q, isNepali(q));
  },
  state: state
};
`;

const bot = new Function(env)();

console.log("=== TEST 1: Initial Query (Focused Answer + Same-Category Recommendations) ===");
const q1 = "Dell Inspiron 15 price kati parchha?";
console.log("Customer Query:", q1);
const r1 = bot.ask(q1);
console.log("\nBot Focused Output:\n" + r1);

console.log("\n=== TEST 2: Follow-up Query Asking for Full Specs (Progressive Disclosure) ===");
const q2 = "specs bhandinus na";
console.log("Customer Query:", q2);
const r2 = bot.ask(q2);
console.log("\nBot Full Specs Output:\n" + r2);

console.log("\n=== TEST 3: English Query (Focused + Alternatives) ===");
const q3 = "What is the price of Dahua camera?";
console.log("Customer Query:", q3);
const r3 = bot.ask(q3);
console.log("\nBot English Output:\n" + r3);
