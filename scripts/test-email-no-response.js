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
const validPhoneSrc = code.match(/function validPhone[\s\S]*?^}/m)?.[0];
const helpersSrc = code.match(/function isFlowCancel[\s\S]*?^}/m)?.[0] + "\n" +
  code.match(/function isMultiItemRequest[\s\S]*?^}/m)?.[0] + "\n" +
  code.match(/function isItemSwitchRequest[\s\S]*?^}/m)?.[0];
const handleFlowSrc = code.match(/function handleFlow[\s\S]*?^\/\* ---------- backend/m)?.[0]?.replace(/\/\* ---------- backend[\s\S]*$/, "");

const env = `
${matchAnySrc}
${isNepaliSrc}
${validPhoneSrc}
var state = { mode: 'idle', step: 0, data: {}, lang: 'ne' };
var excelCatalog = ${JSON.stringify(catalog)};
function esc(s){ return s || ''; }
var PHONE_HREF = 'tel:+9779813714582';
var PHONE_DISP = '+977 9813714582';
function openNote(){ return 'Open 9:30 - 6:30'; }
function isOpen(){ return true; }
function saveBooking(b){ return { id: 'B-999', ...b }; }
function saveLead(l){ return { id: 'L-999', ...l }; }
function log(){ }
function waLink(t){ return 'wa-link'; }
function nextDateForDay(){ return new Date(); }
function gcalLink(){ return 'gcal'; }
function icsDownloadLink(){ return 'ics'; }
function handoff(){ return 'handoff'; }

${formatExcelSrc}
${searchExcelSrc}
${getContextualAnswerSrc}
${detectIntentSrc}
${helpersSrc}
${handleFlowSrc}

return {
  ask: function(q){
    if(state.mode !== 'idle'){
      var f = handleFlow(q);
      if(f) return f;
    }
    var ctx = getContextualAnswer(q, isNepali(q));
    if(ctx) return ctx;
    return "Fallback";
  },
  startBooking: function(productName){
    var matches = searchExcelProducts(productName);
    var p = matches[0];
    state.mode = 'booking';
    state.step = 1;
    state.data = { service: p.name + " (" + p.price + ")", product: p };
    return "Booking started for " + p.name;
  },
  getState: function(){ return state; }
};
`;

const bot = new Function(env)();

console.log("=== STEP 0: Start Booking Dell Inspiron ===");
bot.startBooking("Dell Inspiron 15");
console.log("State:", bot.getState().mode, "Step:", bot.getState().step);

console.log("\n=== STEP 1: Customer enters Name ===");
const step1Res = bot.ask("Naresh Giri");
console.log("AI reply:\n" + step1Res);
console.log("State:", bot.getState().mode, "Step:", bot.getState().step);

console.log("\n=== STEP 2: Customer enters Phone ===");
const step2Res = bot.ask("9813714582");
console.log("AI reply asking for email:\n" + step2Res);
console.log("State:", bot.getState().mode, "Step:", bot.getState().step);

console.log("\n=== STEP 3: Customer replies 'no' to Email Request ===");
const step3Res = bot.ask("no");
console.log("AI reply to 'no':\n" + step3Res);
console.log("State:", bot.getState().mode, "Step:", bot.getState().step);

console.log("\n=== STEP 4: Customer gives delivery address ===");
const step4Res = bot.ask("Tomorrow 2 PM, Koteshwor Chowk pickup");
console.log("Final Booking Confirmation:\n" + step4Res);
console.log("State after completion:", bot.getState().mode);
