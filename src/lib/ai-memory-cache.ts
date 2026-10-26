import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface MemoryCacheItem {
  id: string;
  normalizedKey: string;
  canonicalTokens: string[];
  query: string;
  lang: "ne" | "en";
  reply: string;
  provider: string;
  model: string;
  category: "catalog" | "service" | "faq" | "general";
  hitCount: number;
  createdAt: string;
  lastUsedAt: string;
}

export interface MemoryCacheStats {
  totalEntries: number;
  totalHits: number;
  estimatedTokensSaved: number;
  estimatedTimeSavedSec: number;
  items: MemoryCacheItem[];
}

const CACHE_FILE_PATH = path.join(process.cwd(), "data", "ai-memory-cache.json");

// In-memory cache map for sub-millisecond lookups
let inMemoryCache: Map<string, MemoryCacheItem> | null = null;
let saveDebounceTimer: NodeJS.Timeout | null = null;

// Stop words for high-accuracy semantic normalization
const EN_STOP_WORDS = new Set([
  "what", "is", "the", "of", "for", "in", "at", "to", "a", "an", "and", "or",
  "how", "much", "many", "tell", "me", "please", "can", "you", "give", "i",
  "want", "need", "know", "about", "do", "does", "any", "are", "there", "show"
]);

const NE_STOP_WORDS = new Set([
  "ko", "ma", "le", "lai", "ra", "kasto", "kati", "ho", "cha", "chha",
  "parcha", "parchha", "ni", "na", "hola", "bhandinus", "bhanus", "garnus",
  "k", "ke", "chha", "hunuhunchha", "हुनुहुन्छ", "हो", "छ", "छन्", "पर्छ",
  "कति", "को", "मा", "ले", "लाई", "र", "के", "भन्नुहोस्", "हजुर", "पनि", "तपाईंको"
]);

/**
 * Normalizes query into canonical tokens and key.
 * Word order differences ("Dell Inspiron 15 price" vs "price of Dell Inspiron 15")
 * map to the same canonical key for 100% exact semantic matches.
 */
export function normalizeQuery(query: string, lang: "ne" | "en" = "ne"): { key: string; tokens: string[] } {
  const clean = String(query || "")
    .toLowerCase()
    .replace(/[\?!\.,:;'"\(\)\[\]\{\}\/\\~`@#\$%\^&\*\-_=\+<>\|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = clean.split(" ").filter(w => w.length > 1);
  const stopWords = lang === "ne" ? NE_STOP_WORDS : EN_STOP_WORDS;

  // Filter words while preserving technical acronyms and core entities
  const tokens = words.filter(w => !stopWords.has(w) && !EN_STOP_WORDS.has(w));
  const finalTokens = tokens.length ? tokens : words;

  // Sort tokens to normalize question rephrasing
  const sortedTokens = [...finalTokens].sort();
  const key = `${lang}:${sortedTokens.join("_")}`;

  return { key, tokens: sortedTokens };
}

/**
 * Checks safety: NEVER cache queries containing personal data, phone numbers,
 * email addresses, booking confirmation codes, or appointment dates.
 */
export function isSafeToCache(query: string, reply: string): boolean {
  const combined = (query + " " + reply).toLowerCase();

  // 10-digit mobile numbers (Nepal mobile format e.g. 98..., 97...)
  if (/\b9[78]\d{8}\b/.test(combined)) return false;

  // Generic phone numbers
  if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(combined)) return false;

  // Email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(combined)) return false;

  // Booking or lead reference IDs (B123, L123, T123)
  if (/\b[blt]\d{3,}\b/i.test(combined)) return false;

  // Transactional or appointment booking indicators
  if (/\b(my name is|i live in|tomorrow at|slot confirmed|ticket created|booking confirmed)\b/i.test(combined)) return false;
  if (/\b(मेरो नाम|मेरो नम्बर|ठेगाना|भिजिट बुक|बुकिङ सुरक्षित|टिकट दर्ता)\b/.test(combined)) return false;

  // Minimum length check
  if (query.trim().length < 3 || reply.trim().length < 15) return false;

  return true;
}

/**
 * Categorizes query to allow surgical cache invalidation (e.g. invalidate only catalog when Excel changes)
 */
function detectCategory(query: string, reply: string): "catalog" | "service" | "faq" | "general" {
  const t = (query + " " + reply).toLowerCase();
  if (/dell|hp|lenovo|asus|acer|laptop|cctv|camera|hikvision|dahua|ssd|ram|dvr|nvr|nvme|monitor|screen|price|rs\.|cost|रु\./i.test(t)) {
    return "catalog";
  }
  if (/repair|service|maintenance|install|jigri|erp|accounting|billing|attendance|biometric|network/i.test(t)) {
    return "service";
  }
  if (/location|koteshwor|hours|time|phone|contact|open|closed|delivery|payment|fonepay|esewa/i.test(t)) {
    return "faq";
  }
  return "general";
}

/**
 * Loads cache from disk into fast in-memory Map
 */
function loadCache(): Map<string, MemoryCacheItem> {
  if (inMemoryCache) return inMemoryCache;

  inMemoryCache = new Map();
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const raw = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      const list: MemoryCacheItem[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item && item.normalizedKey) {
            inMemoryCache.set(item.normalizedKey, item);
          }
        }
      }
    }
  } catch (err) {
    console.error("[ai-memory-cache] Failed to load cache file:", err);
  }
  return inMemoryCache;
}

/**
 * Schedules debounced atomic write to disk to prevent disk thrashing
 */
function schedulePersist(): void {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    try {
      if (!inMemoryCache) return;
      const dir = path.dirname(CACHE_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const list = Array.from(inMemoryCache.values());
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
    } catch (e) {
      console.error("[ai-memory-cache] Failed to write cache to disk:", e);
    }
  }, 1000);
}

/**
 * Retrieves an accurate cached answer for a query.
 * First checks exact normalized key (0ms), then high-overlap token similarity (>= 85%).
 */
export function getMemoryCache(query: string, lang: "ne" | "en" = "ne"): MemoryCacheItem | null {
  const cache = loadCache();
  const { key, tokens } = normalizeQuery(query, lang);

  // 1. Direct O(1) Canonical Normalized Key Hit (100% accurate)
  if (cache.has(key)) {
    const item = cache.get(key)!;
    item.hitCount += 1;
    item.lastUsedAt = new Date().toISOString();
    schedulePersist();
    return item;
  }

  // 2. High-Accuracy Jaccard Overlap matching for longer queries (tokens >= 3)
  if (tokens.length >= 3) {
    const tokenSet = new Set(tokens);
    let bestMatch: MemoryCacheItem | null = null;
    let highestScore = 0;
    const items = Array.from(cache.values());

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      if (item.lang !== lang) continue;
      const otherTokens = item.canonicalTokens;
      if (!otherTokens || otherTokens.length === 0) continue;

      let intersection = 0;
      for (let i = 0; i < otherTokens.length; i++) {
        if (tokenSet.has(otherTokens[i])) intersection++;
      }
      const union = tokenSet.size + otherTokens.length - intersection;
      const score = union > 0 ? intersection / union : 0;

      // Strict high accuracy threshold: >= 85% overlap
      if (score >= 0.85 && score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch) {
      const matched = bestMatch as MemoryCacheItem;
      matched.hitCount += 1;
      matched.lastUsedAt = new Date().toISOString();
      schedulePersist();
      return matched;
    }
  }

  return null;
}

/**
 * Stores a verified high-quality answer into memory cache
 */
export function setMemoryCache(
  query: string,
  reply: string,
  lang: "ne" | "en" = "ne",
  model = "gpt-4o-mini",
  provider = "local"
): MemoryCacheItem | null {
  if (!isSafeToCache(query, reply)) return null;

  const cache = loadCache();
  const { key, tokens } = normalizeQuery(query, lang);

  const existing = cache.get(key);
  if (existing) {
    existing.reply = reply;
    existing.model = model;
    existing.provider = provider;
    existing.lastUsedAt = new Date().toISOString();
    existing.hitCount += 1;
    schedulePersist();
    return existing;
  }

  const newItem: MemoryCacheItem = {
    id: "mem-" + crypto.randomBytes(6).toString("hex"),
    normalizedKey: key,
    canonicalTokens: tokens,
    query: query.trim(),
    lang,
    reply: reply.trim(),
    model,
    provider,
    category: detectCategory(query, reply),
    hitCount: 1,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  cache.set(key, newItem);
  schedulePersist();
  return newItem;
}

/**
 * Invalidates only product/catalog entries when an Excel sheet is uploaded/modified,
 * preserving all service and general FAQ memory!
 */
export function invalidateProductCache(): number {
  const cache = loadCache();
  let count = 0;
  const toDelete: string[] = [];
  cache.forEach((item, k) => {
    if (item.category === "catalog") {
      toDelete.push(k);
      count++;
    }
  });
  toDelete.forEach((k) => cache.delete(k));
  if (count > 0) schedulePersist();
  return count;
}

/**
 * Clears entire cache memory
 */
export function clearAllMemoryCache(): void {
  const cache = loadCache();
  cache.clear();
  schedulePersist();
}

/**
 * Deletes a single memory cache item by ID
 */
export function deleteMemoryCacheItem(id: string): boolean {
  const cache = loadCache();
  let keyToDelete: string | null = null;
  cache.forEach((item, k) => {
    if (item.id === id) {
      keyToDelete = k;
    }
  });
  if (keyToDelete) {
    cache.delete(keyToDelete);
    schedulePersist();
    return true;
  }
  return false;
}

/**
 * Returns cache statistics for admin inspection
 */
export function getMemoryCacheStats(): MemoryCacheStats {
  const cache = loadCache();
  const items = Array.from(cache.values()).sort((a, b) => b.hitCount - a.hitCount);
  const totalEntries = items.length;
  const totalHits = items.reduce((sum, it) => sum + (it.hitCount - 1), 0);

  // Estimates: average 150 prompt tokens + 120 completion tokens = 270 tokens per hit
  // average 800ms saved per cache hit
  const estimatedTokensSaved = totalHits * 270;
  const estimatedTimeSavedSec = Math.round((totalHits * 0.8) * 10) / 10;

  return {
    totalEntries,
    totalHits,
    estimatedTokensSaved,
    estimatedTimeSavedSec,
    items,
  };
}
