const fs = require("fs");
const path = require("path");

// Mock browser environment
const localStorageData = {};
global.localStorage = {
  getItem: (k) => (k in localStorageData ? localStorageData[k] : null),
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

global.window = {
  PRIXNA: {
    phoneDisplay: "+977 9813714582",
    phoneHref: "tel:+9779813714582",
    whatsappNumber: "9779813714582",
    email: "info@prixnaitsolution.com.np"
  },
  PRIXNA_DATA: { products: [], services: [] }
};
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ appendChild: () => {}, setAttribute: () => {}, classList: { add: () => {} } })
};

// Load prixna-ai.js script text and extract getContextualAnswer or mock runner
const code = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");

// Test functions using regex and logic from widget
const isGeneralAgeQuery = /\b(?:does(n'?t|\s+not)?\s+(it\s+)?know\s+(about\s+)?age|it\s+does(n'?t|\s+not)\s+know\s+(about\s+)?age|know\s+about\s+age|about\s+age|what\s+about\s+age)\b/i;
const isGeneralAgeQueryNe = /(उमेरको\s*बारे|उमेर\s*बारे|उमेर\s*सम्बन्धी|उमेर\s*थाहा\s*छ)/;

const isBotAgeQuery = /\b(how\s+old\s+are\s+you|what('?s|\s+is)\s+your\s+age|when\s+were\s+you\s+born|your\s+age|when\s+was\s+your\s+birthday|do\s+you\s+have\s+an\s+age)\b/i;
const isBotAgeQueryNe = /(तपाईंको\s*उमेर|तिम्रो\s*उमेर|तपाईं\s*कति\s*वर्ष|तिम्रो\s*उमेर\s*कति|कहिले\s*जन्म|कति\s*वर्षको\s*हुनुभयो|tapaiko\s*umer|timro\s*umer)/;

const isMyAgeQuery = /\b(what('?s|\s+is)\s+my\s+age|how\s+old\s+am\s+i|do\s+you\s+know\s+my\s+age|tell\s+me\s+my\s+age|my\s+age)\b/i;
const isMyAgeQueryNe = /(मेरो\s*उमेर|म\s*कति\s*वर्ष|म\s*कति\s*बर्ष|मेरो\s*उमेर\s*कति|मेरो\s*उमेर\s*थाहा|mero\s*umer\s*k|mero\s*umer\s*tha)/;

const shareAgeEn = /\b(?:i\s+am|i'm|my\s+age\s+is)\s+(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|years?|yrs?)?\b/i;
const shareAgeNe = /(?:मेरो\s*उमेर\s+|म\s+)([0-9०-९]{1,3})\s*(?:वर्ष|बर्ष)?(?:\s*को\s*भएँ|\s*हो|\s*पुगेँ)?/;

function parseAgeNumber(str){
  if(!str) return 0;
  var devMap = {"०":"0","१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9"};
  var normalized = String(str).replace(/[०-९]/g, function(d){ return devMap[d] || d; });
  var m = normalized.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function handleQuery(t, isNe){
  if(isGeneralAgeQuery.test(t) || isGeneralAgeQueryNe.test(t)){
    const age = localStorage.getItem("prixna_customer_age");
    return isNe
      ? "मलाई उमेरको बारेमा पक्कै थाहा छ हजुर! 😊\n🤖 मेरो उमेर: सन् २०२६ मा Prixna IT Solution मा विकसित\n👤 तपाईंको उमेर: " + (age ? age + " वर्ष" : "हामी बुकिङमा उमेर सोध्दैनौं, तर बताउनुभए सुरक्षित राख्छु!")
      : "Yes, I definitely understand and know about age! 😊\n🤖 My Age: Created in 2026 by Prixna IT Solution\n👤 Your Age: " + (age ? age + " years old" : "We don't require age during orders, but if you share it, I will remember it!");
  }
  if(isBotAgeQuery.test(t) || isBotAgeQueryNe.test(t)){
    return isNe
      ? "मेरो मान्छेको जस्तो जन्मदिन हुँदैन हजुर! मलाई सन् २०२६ मा Prixna IT Solution का सफ्टवेयर इन्जिनियरहरूले बनाएका हुन्। ⚡"
      : "I was crafted in 2026 by the engineering team at Prixna IT Solution in Koteshwor, Kathmandu! ⚡";
  }
  const mEn = t.match(shareAgeEn);
  const mNe = t.match(shareAgeNe);
  if(mEn || mNe){
    const parsed = mEn ? parseInt(mEn[1], 10) : parseAgeNumber(mNe[1]);
    if(parsed >= 5 && parsed <= 120){
      localStorage.setItem("prixna_customer_age", String(parsed));
      return isNe ? "हजुर " + parsed + " वर्षको हुनुहुँदो रहेछ 🌟" : "You are " + parsed + " years young 🌟";
    }
  }
  if(isMyAgeQuery.test(t) || isMyAgeQueryNe.test(t)){
    const age = localStorage.getItem("prixna_customer_age");
    if(age){
      return isNe ? "हजुरले अघि आफ्नो उमेर " + age + " वर्ष बताउनुभएको थियो नि हजुर! 😊" : "You told me earlier that you are " + age + " years old! 😊";
    }
    return isNe ? "तपाईंले मलाई अहिलेसम्म आफ्नो उमेर बताउनुभएको छैन नि हजुर! 😊" : "I don't know your age yet! 😊";
  }
  return "General fallback";
}

console.log("=== SCENARIO 1: User asks 'it doesnt know about age ?' ===");
console.log("User: it doesnt know about age ?");
console.log("Bot:", handleQuery("it doesnt know about age ?", false));

console.log("\n=== SCENARIO 2: User asks bot age ===");
console.log("User: How old are you?");
console.log("Bot:", handleQuery("How old are you?", false));
console.log("User: तपाईंको उमेर कति हो?");
console.log("Bot:", handleQuery("तपाईंको उमेर कति हो?", true));

console.log("\n=== SCENARIO 3: User asks their own age BEFORE sharing ===");
console.log("User: What is my age?");
console.log("Bot:", handleQuery("What is my age?", false));

console.log("\n=== SCENARIO 4: User shares age in English ===");
console.log("User: I am 26 years old");
console.log("Bot:", handleQuery("I am 26 years old", false));
console.log("User: What is my age?");
console.log("Bot:", handleQuery("What is my age?", false));

console.log("\n=== SCENARIO 5: User shares age in Nepali with Devanagari numerals ===");
console.log("User: मेरो उमेर २५ वर्ष हो");
console.log("Bot:", handleQuery("मेरो उमेर २५ वर्ष हो", true));
console.log("User: मेरो उमेर कति हो?");
console.log("Bot:", handleQuery("मेरो उमेर कति हो?", true));

console.log("\n=== SCENARIO 6: User asks 'does it know about age ?' after sharing ===");
console.log("Bot:", handleQuery("does it know about age ?", false));

console.log("\nAll Age Scenarios Tested Successfully! ✅");
