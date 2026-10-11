const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.join(__dirname, "../js/prixna-ai.js"), "utf8");

// Extract tested functions directly using regex
const matchAnySrc = code.match(/function matchAny[\s\S]*?^}/m)?.[0];
const detectIntentSrc = code.match(/function detectIntent[\s\S]*?^}/m)?.[0];
const getContextualAnswerSrc = code.match(/function getContextualAnswer[\s\S]*?^}/m)?.[0];
const isNepaliSrc = code.match(/var NE_REGEX =[\s\S]*?function isNepali[\s\S]*?^}/m)?.[0];

const evalEnv = `
${matchAnySrc}
${isNepaliSrc}
var state = { lang: 'ne' };
${getContextualAnswerSrc}
${detectIntentSrc}

return { matchAny, isNepali, detectIntent, getContextualAnswer };
`;

const runner = new Function(evalEnv)();

const queries = [
  { q: "what is your name", desc: "Identity EN" },
  { q: "tapaiko naam k ho?", desc: "Identity NE" },
  { q: "tapai ko ho?", desc: "Identity NE 2" },
  { q: "how are you?", desc: "Wellbeing EN" },
  { q: "sanchai hunuhunchha?", desc: "Wellbeing NE" },
  { q: "k chha khabar", desc: "Wellbeing NE 2" },
  { q: "bhat khanu bhayo?", desc: "Bhat khayeu NE" },
  { q: "did you eat?", desc: "Food EN" },
  { q: "are you a real person or AI?", desc: "AI vs Human EN" },
  { q: "tapai manche ho ki robot?", desc: "AI vs Human NE" },
  { q: "who created you?", desc: "Who made you EN" },
  { q: "kasle banako tapailai?", desc: "Who made you NE" },
  { q: "tell me about prixna company", desc: "About company EN" },
  { q: "prixna k ho?", desc: "About company NE" },
  { q: "what can you do?", desc: "Capabilities EN" },
  { q: "tapai k garna saknuhunchha?", desc: "Capabilities NE" },
  { q: "tell me a joke", desc: "Joke EN" },
  { q: "euta joke sunau na", desc: "Joke NE" },
  { q: "you are very smart", desc: "Compliment EN" },
  { q: "dami cha tapai", desc: "Compliment NE" },
  { q: "laptop bigrera tanab bhayo", desc: "Empathy NE" },
  { q: "good morning", desc: "Greeting morning EN" },
  { q: "shubha bihani", desc: "Greeting morning NE" },
  { q: "kathmandu ko mausam kasto cha", desc: "Weather NE" },
  { q: "how is the weather in kathmandu", desc: "Weather EN" },
  { q: "bye bye", desc: "Goodbye EN" },
  { q: "huncha ta pachi kura garau", desc: "Goodbye NE" }
];

console.log("=== Testing Human Queries in Prixna AI ===");

let passed = 0;
queries.forEach(t => {
  const isNe = runner.isNepali(t.q);
  const contextual = runner.getContextualAnswer(t.q, isNe);
  const intent = runner.detectIntent(t.q);
  
  const hasMenu = contextual && contextual.includes("1️⃣");
  const hasColdPitch = contextual && contextual.includes("होलसेल छुट");

  console.log(`\nQuery: "${t.q}" [${t.desc}]`);
  console.log(`- Language detected: ${isNe ? "Nepali" : "English"}`);
  console.log(`- Intent: ${intent}`);
  if (contextual) {
    const preview = contextual.replace(/<[^>]+>/g, "").split("\n")[0].trim();
    console.log(`- Human Response: "${preview}"`);
    if (!hasMenu && !hasColdPitch) {
      passed++;
    } else {
      console.error(`  FAIL: Detected unwanted sales menu/pitch`);
    }
  } else {
    console.error(`  FAIL: Missing contextual answer!`);
  }
});

console.log(`\nResults: ${passed} of ${queries.length} queries verified friendly & human!`);
if (passed === queries.length) {
  console.log("SUCCESS: 100% of human conversational queries passed!");
} else {
  process.exit(1);
}
