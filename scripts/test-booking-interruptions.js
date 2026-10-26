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
function saveBooking(b){ return { id: 'B123', ...b }; }
function saveLead(l){ return { id: 'L123', ...l }; }
function saveTicket(t){ return { id: 'T123', ...t }; }
function log(){ }
function waLink(t){ return 'https://wa.me/9779813714582?text=' + encodeURIComponent(t); }
function nextDateForDay(){ return new Date(); }
function gcalLink(){ return 'gcal'; }
function icsDownloadLink(){ return 'ics'; }
function handoff(r, t){ return "🤝 Handing off to human support: " + r; }

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

console.log("===============================================================================");
console.log("TEST 1: Customer starts booking Dell Inspiron, then says 'Cancel' at Step 1 (Asking Name)");
console.log("===============================================================================");
bot.startBooking("Dell Inspiron 15");
console.log("Current state before cancel:", bot.getState());
const res1 = bot.ask("Cancel");
console.log("\nBot Response:\n" + res1);
console.log("State after cancel:", bot.getState());

console.log("\n===============================================================================");
console.log("TEST 2: Customer starts booking Dell Inspiron, gives name 'Naresh Giri', then says 'पर्दैन' at Step 2 (Phone)");
console.log("===============================================================================");
bot.startBooking("Dell Inspiron 15");
const nameRes = bot.ask("Naresh Giri");
console.log("Name Step response:\n" + nameRes);
console.log("State before cancel at step 2:", bot.getState());
const res2 = bot.ask("पर्दैन, पछि गर्छु");
console.log("\nBot Response on Nepali cancellation:\n" + res2);
console.log("State after cancel:", bot.getState());

console.log("\n===============================================================================");
console.log("TEST 3: Customer starts booking Dell Inspiron, then says 'Wait, what about CCTV instead?'");
console.log("===============================================================================");
bot.startBooking("Dell Inspiron 15");
console.log("State before switch:", bot.getState());
const res3 = bot.ask("Wait, what about Hikvision CCTV instead?");
console.log("\nBot Response on Product Switch:\n" + res3);
console.log("State after switch:", bot.getState());

console.log("\n===============================================================================");
console.log("TEST 4: Customer starts booking Dell Inspiron, then asks 'Can I order multiple items?'");
console.log("===============================================================================");
bot.startBooking("Dell Inspiron 15");
console.log("State before multi-item:", bot.getState());
const res4 = bot.ask("Can I book multiple items?");
console.log("\nBot Response on Multi-Item request:\n" + res4);
console.log("State after multi-item:", bot.getState());

console.log("\n===============================================================================");
console.log("TEST 5: Customer starts booking Dell Inspiron, then in Nepali asks '२ वटा सामान एकैपटक अर्डर गर्न मिल्छ?'");
console.log("===============================================================================");
bot.startBooking("Dell Inspiron 15");
const res5 = bot.ask("२ वटा सामान एकैपटक अर्डर गर्न मिल्छ?");
console.log("\nBot Response on Nepali Multi-Item request:\n" + res5);
console.log("State after multi-item:", bot.getState());
