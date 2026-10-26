const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/ai-catalog.json"), "utf8"));

// Regex check
const isMyNameLookup = /\b(what('?s|\s+is)\s+my\s+name|do\s+you\s+know\s+my\s+name|do\s+you\s+remember\s+(my\s+name|me)|tell\s+me\s+my\s+name|who\s+am\s+i|what('?s|\s+is)\s+my\s+(phone|number|mobile|contact|email|details)|my\s+profile|my\s+info)\b/i;
const isMyNameNepali = /(मेरो\s*नाम|मेरो\s*नम्बर|मेरो\s*फोन|म\s*को\s*हुँ|मेरो\s*नाम\s*के|मेरो\s*नाम\s*थाहा|मलाई\s*चिन्नुहुन्छ|mero\s*naam\s*k|mero\s*naam\s*tha|ma\s*ko\s*hu)/;

console.log("Regex Test 1 ('What is my name ?'):", isMyNameLookup.test("What is my name ?"));
console.log("Regex Test 2 ('what is my name'):", isMyNameLookup.test("what is my name"));
console.log("Regex Test 3 ('do you know my name'):", isMyNameLookup.test("do you know my name"));
console.log("Regex Test 4 ('Who am I?'):", isMyNameLookup.test("Who am I?"));
console.log("Regex Test 5 ('What is my phone number'):", isMyNameLookup.test("What is my phone number"));
console.log("Regex Test 6 ('मेरो नाम के हो ?'):", isMyNameNepali.test("मेरो नाम के हो ?"));
console.log("Regex Test 7 ('म को हुँ?'):", isMyNameNepali.test("म को हुँ?"));
console.log("Regex Test 8 ('mero naam k ho'):", isMyNameNepali.test("mero naam k ho"));
