const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/ai-catalog.json"), "utf8"));
const queryNe = "मलाई Dell Inspiron 15 3520 ल्यापटप चाहियो, बुक गरिदिनुहुन्छ?";

const matchAnySrc = code.match(/function matchAny[\s\S]*?^}/m)?.[0];
const detectIntentSrc = code.match(/function detectIntent[\s\S]*?^}/m)?.[0];
const getContextualAnswerSrc = code.match(/function getContextualAnswer[\s\S]*?^}/m)?.[0];
const searchExcelSrc = code.match(/function searchExcelProducts[\s\S]*?^}/m)?.[0];
const formatExcelSrc = code.match(/function formatExcelResults[\s\S]*?^}/m)?.[0];
const isNepaliSrc = code.match(/var NE_REGEX =[\s\S]*?function isNepali[\s\S]*?^}/m)?.[0];

const env = `
${matchAnySrc}
${isNepaliSrc}
var state = { mode: 'idle', step: 0, data: {} };
var excelCatalog = ${JSON.stringify(catalog)};
function esc(s){ return s || ''; }
var PHONE_HREF = 'tel:123';
var PHONE_DISP = '123';
${searchExcelSrc}
${formatExcelSrc}
${getContextualAnswerSrc}
${detectIntentSrc}

return {
  intent: detectIntent(query),
  contextual: getContextualAnswer(query, isNepali(query)),
  matches: searchExcelProducts(query),
  state: state
};
`;

const res = new Function("query", env)(queryNe);
console.log("=== Nepali Product Booking Query Trace ===");
console.log("Query:", queryNe);
console.log("Detected Intent:", res.intent);
console.log("Matched Product in Catalog:", res.matches[0]?.name, `(${res.matches[0]?.price})`);
console.log("\nBot Nepali Response:\n" + res.contextual);
console.log("\nBooking State Initiated:", res.state);
