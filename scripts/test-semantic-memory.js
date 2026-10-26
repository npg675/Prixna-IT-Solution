const {
  normalizeQuery,
  isSafeToCache,
  getMemoryCache,
  setMemoryCache,
  invalidateProductCache,
  clearAllMemoryCache,
  getMemoryCacheStats
} = require("../src/lib/ai-memory-cache");

console.log("=== 1. Testing Query Normalization & Semantic Canonicalization ===");
const q1 = "What is the price of Dell Inspiron 15?";
const q2 = "Dell Inspiron 15 price";
const q3 = "Dell Inspiron 15 ko price kati ho?";

const n1 = normalizeQuery(q1, "ne");
const n2 = normalizeQuery(q2, "ne");
const n3 = normalizeQuery(q3, "ne");

console.log("Q1 Key:", n1.key);
console.log("Q2 Key:", n2.key);
console.log("Q3 Key:", n3.key);
console.log("Do all 3 variations map to the EXACT same key?", n1.key === n2.key && n2.key === n3.key ? "✅ YES (100% Exact Match)" : "❌ NO");

console.log("\n=== 2. Testing Privacy & Safety Guardrails (Zero Leaks) ===");
const safeQ = "What is the warranty period for CCTV cameras?";
const safeA = "Hikvision and Dahua CCTV systems come with a 1-year official brand warranty and free technical support.";
console.log("Safe query cacheable:", isSafeToCache(safeQ, safeA) ? "✅ YES" : "❌ NO");

const unsafeQ = "My name is Ram and phone is 9813714582. Please book visit.";
const unsafeA = "Booking confirmed for Ram with phone 9813714582. ID B102.";
console.log("Personal data query rejected:", !isSafeToCache(unsafeQ, unsafeA) ? "✅ YES (Safely Rejected)" : "❌ FAILED (Leaked)");

console.log("\n=== 3. Testing Store & Fast Memory Retrieval (Cache Hit) ===");
clearAllMemoryCache();

// Customer A asks:
console.log("Customer A asks:", q1);
const saved = setMemoryCache(q1, "Dell Inspiron 15 3520 is available in stock for Rs. 74,000.", "ne", "gpt-4o-mini", "openai");
console.log("Stored in memory cache with ID:", saved.id);

// Customer B asks (different phrasing):
console.log("\nCustomer B asks later:", q3);
const hit = getMemoryCache(q3, "ne");
if (hit) {
  console.log("⚡ INSTANT MEMORY CACHE HIT!");
  console.log("Cached Answer:", hit.reply);
  console.log("Hit Count:", hit.hitCount);
  console.log("Tokens consumed from OpenAI/Gemini: 0 tokens (100% saved)");
} else {
  console.log("❌ Cache Miss");
}

console.log("\n=== 4. Testing Memory Statistics & Analytics ===");
const stats = getMemoryCacheStats();
console.log("Total Cached Memory Entries:", stats.totalEntries);
console.log("Total Cache Hits:", stats.totalHits);
console.log("Estimated Tokens Saved:", stats.estimatedTokensSaved);
console.log("Estimated Latency Saved:", stats.estimatedTimeSavedSec, "seconds");

console.log("\n=== 5. Testing Catalog Cache Invalidation on Excel Updates ===");
// Add a non-product FAQ
setMemoryCache("Where is Prixna office located?", "Prixna IT Solution is located at Koteshwor-32, Kathmandu.", "en", "gpt-4o-mini", "local");
console.log("Entries before catalog update:", getMemoryCacheStats().totalEntries);

const clearedCount = invalidateProductCache();
console.log("Invalidated product entries on Excel update:", clearedCount);
console.log("Remaining non-product FAQs in memory:", getMemoryCacheStats().totalEntries);

const faqHit = getMemoryCache("Where is Prixna office located?", "en");
console.log("General FAQ still remembered?", faqHit ? "✅ YES ('" + faqHit.reply + "')" : "❌ NO");
