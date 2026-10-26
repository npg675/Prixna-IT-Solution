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
const answerForSrc = code.match(/function answerFor[\s\S]*?\n}\nfunction handoff/m)?.[0]?.replace(/\nfunction handoff$/, "");

function createBot(lang = "en") {
  const env = `
  ${matchAnySrc}
  ${isNepaliSrc}
  var state = { mode: 'idle', step: 0, data: {}, lang: '${lang}', confirmCancel: false, lastProduct: null };
  var excelCatalog = ${JSON.stringify(catalog)};
  function esc(s){ return s || ''; }
  var PHONE_HREF = 'tel:+9779813714582';
  var PHONE_DISP = '+977 9813714582';
  function openNote(){ return 'Open'; }
  function isOpen(){ return true; }
  var LINKS = { quote: 'quote.html', shop: 'shop.html' };
  function productKB(){ return ''; }

  ${formatExcelSrc}
  ${searchExcelSrc}
  ${getContextualAnswerSrc}
  ${detectIntentSrc}
  ${answerForSrc}

  return {
    ask: function(q){
      var specific = getContextualAnswer(q, isNepali(q));
      if(specific) return specific;
      var intent = detectIntent(q);
      return answerFor(intent, q);
    },
    getState: function(){ return state; }
  };
  `;
  return new Function(env)();
}

console.log("==========================================================================");
console.log("SCENARIO 1: Fresh traffic enters and says 'book one for me' (Ambiguous item)");
console.log("==========================================================================");
const bot1 = createBot("en");
console.log(bot1.ask("book one for me"));
console.log("State:", bot1.getState().mode);

console.log("\n==========================================================================");
console.log("SCENARIO 2: Customer inquires about Dell Inspiron, then says 'book one for me'");
console.log("==========================================================================");
const bot2 = createBot("en");
bot2.ask("dell inspiron 15");
console.log("state.lastProduct bound to:", bot2.getState().lastProduct?.name);
console.log("Customer says: 'book one for me':");
console.log(bot2.ask("book one for me"));
console.log("State:", bot2.getState().mode, "| Step:", bot2.getState().step, "| Service:", bot2.getState().data.service);

console.log("\n==========================================================================");
console.log("SCENARIO 3: Fresh Nepali traffic says 'एउटा बुक गरिदिनुस्' (Ambiguous item)");
console.log("==========================================================================");
const bot3 = createBot("ne");
console.log(bot3.ask("एउटा बुक गरिदिनुस्"));
console.log("State:", bot3.getState().mode);

console.log("\n==========================================================================");
console.log("SCENARIO 4: Nepali customer inquires about CCTV, then says 'एउटा बुक गरिदिनुस्'");
console.log("==========================================================================");
const bot4 = createBot("ne");
bot4.ask("CCTV");
console.log("state.lastProduct bound to:", bot4.getState().lastProduct?.name);
console.log("Customer says: 'एउटा बुक गरिदिनुस्':");
console.log(bot4.ask("एउटा बुक गरिदिनुस्"));
console.log("State:", bot4.getState().mode, "| Step:", bot4.getState().step, "| Service:", bot4.getState().data.service);
