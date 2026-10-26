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

function createBot(lang = "ne") {
  const env = `
  ${matchAnySrc}
  ${isNepaliSrc}
  ${validPhoneSrc}
  var state = { mode: 'idle', step: 0, data: {}, lang: '${lang}', confirmCancel: false };
  var excelCatalog = ${JSON.stringify(catalog)};
  function esc(s){ return s || ''; }
  var PHONE_HREF = 'tel:+9779813714582';
  var PHONE_DISP = '+977 9813714582';
  function openNote(){ return 'Open'; }
  function isOpen(){ return true; }
  function saveBooking(b){ return { id: 'B-101', ...b }; }
  function saveLead(l){ return { id: 'L-101', ...l }; }
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
  return new Function(env)();
}

console.log("==========================================================================");
console.log("SCENARIO 1: Customer says 'cancel', AI asks confirmation, Customer chooses CONTINUE");
console.log("==========================================================================");
const bot1 = createBot("en");
bot1.startBooking("Dell Inspiron 15");
bot1.ask("Naresh"); // step 1 -> step 2
console.log("Customer is at Step 2 (Phone) and types 'cancel':");
const confirmAsk1 = bot1.ask("cancel");
console.log("AI Confirmation Prompt:\n" + confirmAsk1);
console.log("state.confirmCancel:", bot1.getState().confirmCancel);

console.log("\nCustomer replies: 'continue'");
const resumeReply = bot1.ask("continue");
console.log("AI Resumed Output:\n" + resumeReply);
console.log("state.confirmCancel:", bot1.getState().confirmCancel, "Step:", bot1.getState().step);

console.log("\n==========================================================================");
console.log("SCENARIO 2: Customer says 'cancel', AI asks confirmation, Customer chooses CHANGE ITEM");
console.log("==========================================================================");
const bot2 = createBot("ne");
bot2.startBooking("Dell Inspiron 15");
bot2.ask("रमेश"); // step 1 -> step 2
const confirmAsk2 = bot2.ask("पर्दैन");
console.log("AI Nepali Confirmation Prompt:\n" + confirmAsk2);

console.log("\nCustomer replies in Nepali: 'अर्को सामान'");
const changeReply = bot2.ask("अर्को सामान");
console.log("AI Change Item Output:\n" + changeReply);
console.log("State:", bot2.getState().mode);

console.log("\n==========================================================================");
console.log("SCENARIO 3: Customer says 'cancel', AI asks confirmation, Customer confirms YES CANCEL");
console.log("==========================================================================");
const bot3 = createBot("en");
bot3.startBooking("Dell Inspiron 15");
bot3.ask("Sita");
bot3.ask("cancel"); // triggers confirmation
console.log("Customer confirms: 'yes cancel'");
const finalCancelReply = bot3.ask("yes cancel");
console.log("AI Final Cancel Output:\n" + finalCancelReply);
console.log("State:", bot3.getState().mode);
