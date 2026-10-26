const fs = require("fs");
const path = require("path");

const isBotAgeQuery = /\b(how\s+old\s+are\s+you|what('?s|\s+is)\s+your\s+age|when\s+were\s+you\s+born|your\s+age|when\s+was\s+your\s+birthday)\b/i;
const isBotAgeQueryNe = /(तपाईंको\s*उमेर|उमेर\s*कति|कति\s*वर्ष|कहिले\s*जन्म|tapaiko\s*umer|umer\s*kati|kati\s*barsa)/;

const isMyAgeQuery = /\b(what('?s|\s+is)\s+my\s+age|how\s+old\s+am\s+i|do\s+you\s+know\s+my\s+age|tell\s+me\s+my\s+age|my\s+age)\b/i;
const isMyAgeQueryNe = /(मेरो\s*उमेर|म\s*कति\s*वर्ष|मेरो\s*उमेर\s*कति|मेरो\s*उमेर\s*थाहा|mero\s*umer\s*k|mero\s*umer\s*tha)/;

const shareAgeEn = /\b(?:i\s+am|i'm|my\s+age\s+is)\s+(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|years?|yrs?)?\b/i;
const shareAgeNe = /(?:मेरो\s*उमेर\s+|म\s+)([0-9०-९]{1,3})\s*(?:वर्ष|बर्ष)?(?:\s*को\s*भएँ|\s*हो|\s*पुगेँ)?/;

function parseAgeNumber(str){
  if(!str) return 0;
  var devMap = {"०":"0","१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9"};
  var normalized = String(str).replace(/[०-९]/g, function(d){ return devMap[d] || d; });
  var m = normalized.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

console.log("=== Bot Age Tests ===");
console.log("How old are you?:", isBotAgeQuery.test("How old are you?"));
console.log("What is your age?:", isBotAgeQuery.test("What is your age?"));
console.log("तपाईंको उमेर कति हो?:", isBotAgeQueryNe.test("तपाईंको उमेर कति हो?"));
console.log("उमेर कति भयो?:", isBotAgeQueryNe.test("उमेर कति भयो?"));

console.log("\n=== Customer Age Query Tests ===");
console.log("What is my age?:", isMyAgeQuery.test("What is my age?"));
console.log("How old am I?:", isMyAgeQuery.test("How old am I?"));
console.log("Do you know my age?:", isMyAgeQuery.test("Do you know my age?"));
console.log("मेरो उमेर कति हो?:", isMyAgeQueryNe.test("मेरो उमेर कति हो?"));

console.log("\n=== Customer Shares Age Tests ===");
console.log("I am 25 years old:", shareAgeEn.test("I am 25 years old"), "Parsed:", "I am 25 years old".match(shareAgeEn)?.[1]);
console.log("My age is 30:", shareAgeEn.test("My age is 30"), "Parsed:", "My age is 30".match(shareAgeEn)?.[1]);
console.log("मेरो उमेर २५ वर्ष हो:", shareAgeNe.test("मेरो उमेर २५ वर्ष हो"), "Parsed:", "मेरो उमेर २५ वर्ष हो".match(shareAgeNe)?.[1]);
