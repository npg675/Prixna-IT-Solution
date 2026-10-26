const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/ai-catalog.json"), "utf8"));

const matchAnySrc = code.match(/function matchAny[\s\S]*?^}/m)?.[0];
const detectIntentSrc = code.match(/function detectIntent[\s\S]*?^}/m)?.[0];
const getCustomerProfileSrc = code.match(/function getCustomerProfile[\s\S]*?^}/m)?.[0];
const getContextualAnswerSrc = code.match(/function getContextualAnswer[\s\S]*?^}/m)?.[0];
const searchExcelSrc = code.match(/function searchExcelProducts[\s\S]*?^}/m)?.[0];
const formatExcelSrc = code.match(/function formatExcelResults[\s\S]*?^}/m)?.[0];
const isNepaliSrc = code.match(/var NE_REGEX =[\s\S]*?function isNepali[\s\S]*?^}/m)?.[0];
const validPhoneSrc = code.match(/function validPhone[\s\S]*?^}/m)?.[0];
const handleFlowSrc = code.match(/function handleFlow[\s\S]*?^\/\* ---------- backend/m)?.[0]?.replace(/\/\* ---------- backend[\s\S]*$/, "");
const helpersSrc = code.match(/function isFlowCancel[\s\S]*?^}/m)?.[0] + "\n" +
  code.match(/function isMultiItemRequest[\s\S]*?^}/m)?.[0] + "\n" +
  code.match(/function isItemSwitchRequest[\s\S]*?^}/m)?.[0];

function createBot(lang = "en") {
  const env = `
  ${matchAnySrc}
  ${isNepaliSrc}
  ${validPhoneSrc}
  var LS_BOOKINGS = "mock_bookings";
  var mockStorage = {};
  var localStorage = {
    getItem: function(k){ return mockStorage[k] || null; },
    setItem: function(k, v){ mockStorage[k] = String(v); },
    removeItem: function(k){ delete mockStorage[k]; }
  };
  function loadJSON(k, fb){ return mockStorage[k] ? JSON.parse(mockStorage[k]) : fb; }
  function saveJSON(k, v){ mockStorage[k] = JSON.stringify(v); }

  var state = { mode: 'idle', step: 0, data: {}, lang: '${lang}', confirmCancel: false, lastProduct: null };
  var excelCatalog = ${JSON.stringify(catalog)};
  function esc(s){ return s || ''; }
  var PHONE_HREF = 'tel:+9779813714582';
  var PHONE_DISP = '+977 9813714582';
  function openNote(){ return 'Open'; }
  function isOpen(){ return true; }
  var LINKS = { quote: 'quote.html', shop: 'shop.html' };
  function productKB(){ return ''; }
  function log(){ }
  function waLink(t){ return 'wa-link'; }
  function nextDateForDay(){ return new Date(); }
  function gcalLink(){ return 'gcal'; }
  function icsDownloadLink(){ return 'ics'; }
  function handoff(){ return 'handoff'; }

  function saveBooking(o){
    var arr = loadJSON(LS_BOOKINGS, []);
    var b = { id: 'B-101', name: o.name, phone: o.phone, email: o.email || '', service: o.service, time: o.time };
    arr.unshift(b);
    saveJSON(LS_BOOKINGS, arr);
    try {
      if(o.name) localStorage.setItem("prixna_customer_name", o.name);
      if(o.phone) localStorage.setItem("prixna_customer_phone", o.phone);
      if(o.email) localStorage.setItem("prixna_customer_email", o.email);
    }catch(e){}
    return b;
  }
  function saveLead(o){
    return { id: 'L-101', ...o };
  }

  ${getCustomerProfileSrc}
  ${formatExcelSrc}
  ${searchExcelSrc}
  ${helpersSrc}
  ${getContextualAnswerSrc}
  ${detectIntentSrc}
  ${handleFlowSrc}

  return {
    ask: function(q){
      if(state.mode !== 'idle'){
        var f = handleFlow(q);
        if(f) return f;
      }
      var specific = getContextualAnswer(q, isNepali(q));
      if(specific) return specific;
      var intent = detectIntent(q);
      return "Default Fallback";
    },
    getState: function(){ return state; }
  };
  `;
  return new Function(env)();
}

console.log("==========================================================================");
console.log("SCENARIO 1: Customer completes order as 'Naresh Giri', then asks 'What is my name ?'");
console.log("==========================================================================");
const bot1 = createBot("en");
bot1.ask("dell inspiron 15");
bot1.ask("book one for me"); // Starts booking
bot1.ask("Naresh Giri"); // Step 1: Name
bot1.ask("9813714582"); // Step 2: Phone
bot1.ask("no"); // Step 3: Email (skip)
const confirmOrder = bot1.ask("Tomorrow 2 PM, Koteshwor"); // Step 4: Finish order
console.log("Order confirmed! State:", bot1.getState().mode);

console.log("\nLater customer asks: 'What is my name ?'");
const nameReply = bot1.ask("What is my name ?");
console.log("AI Reply:\n" + nameReply);

console.log("\n==========================================================================");
console.log("SCENARIO 2: Nepali Customer asks 'मेरो नाम के हो?' after booking");
console.log("==========================================================================");
const bot2 = createBot("ne");
bot2.ask("CCTV");
bot2.ask("एउटा बुक गरिदिनुस्");
bot2.ask("रमेश श्रेष्ठ");
bot2.ask("9801234567");
bot2.ask("छैन");
bot2.ask("कोटेश्वर पसलमा");
console.log("Order confirmed in Nepali!");

console.log("\nNepali customer asks: 'मेरो नाम के हो?'");
const nameReplyNe = bot2.ask("मेरो नाम के हो?");
console.log("AI Reply:\n" + nameReplyNe);

console.log("\n==========================================================================");
console.log("SCENARIO 3: Fresh visitor asks 'What is my name?' (Has not booked yet)");
console.log("==========================================================================");
const bot3 = createBot("en");
console.log(bot3.ask("What is my name?"));

console.log("\n==========================================================================");
console.log("SCENARIO 4: Customer asks 'What is YOUR name?' vs 'What is MY name?'");
console.log("==========================================================================");
const bot4 = createBot("en");
console.log("Customer asks: 'What is your name?'");
console.log(bot4.ask("What is your name?"));
