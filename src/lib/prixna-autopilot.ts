/* Prixna Autopilot — shared server logic (Next.js + Vapi).
   Single source of truth for hours, validation, IDs, staff alerts.
   No external deps. Timezone-safe for Asia/Kathmandu. */

export const BUSINESS = {
  name: "Prixna IT Solution Pvt. Ltd.",
  phoneDisplay: "+977 9813714582",
  staffWhatsApp: process.env.STAFF_WHATSAPP || "9779813714582",
  staffEmail: process.env.TO_EMAIL || "info@prixnaitsolution.com.np",
  hoursLabel: "Sun–Fri, 9:30 AM – 6:30 PM NPT (Sat closed)",
} as const;

export function nowInKathmandu(date = new Date()): Date {
  try {
    return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }));
  } catch {
    return date;
  }
}

/** Saturday = closed. Sun–Fri 09:30–18:30 NPT = open. */
export function isBusinessOpen(at = new Date()): boolean {
  const n = nowInKathmandu(at);
  if (n.getDay() === 6) return false;
  const mins = n.getHours() * 60 + n.getMinutes();
  return mins >= 570 && mins <= 1110;
}

export function isSaturdayDayLabel(day: string): boolean {
  return /sat/i.test(day || "");
}

export function makeId(prefix: string): string {
  return (
    prefix +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.floor(Math.random() * 1296).toString(36).toUpperCase()
  );
}

export function validPhone(phone: string): string | null {
  const d = String(phone || "").replace(/\D/g, "");
  return d.length >= 10 && d.length <= 14 ? d : null;
}

export function staffWhatsAppLink(type: string, summary: string): string {
  const msg = `🚨 New ${type.toUpperCase()} — Prixna autopilot\n${summary}`.slice(0, 900);
  return `https://wa.me/${BUSINESS.staffWhatsApp}?text=${encodeURIComponent(msg)}`;
}

export function customerWhatsAppLink(message: string): string {
  return `https://wa.me/${BUSINESS.staffWhatsApp}?text=${encodeURIComponent(message)}`;
}

/** Minimal live-catalog check. Extend by importing Sanity/product feed later. */
const QUOTE_ONLY = ["cctv", "biometric", "attendance", "server", "4-channel", "installation", "site visit"];
export function checkAvailability(product: string): { available: "in" | "quote" | "unknown"; note: string } {
  const p = (product || "").toLowerCase();
  if (!p.trim()) return { available: "unknown", note: "No product named. Ask the customer which model + quantity." };
  if (QUOTE_ONLY.some((k) => p.includes(k))) {
    return {
      available: "quote",
      note: `"${product}" is project-priced: free site visit in the Valley, then itemised NPR quotation. Create a lead + book a visit instead of quoting a price.`,
    };
  }
  return {
    available: "in",
    note: `"${product}" is normally stocked (routers, accessories, gadgets). Confirm exact NPR price/stock from the shop team before promising — see /shop.html, then create a quotation lead.`,
  };
}

export function detectPriority(device: string, problem: string): "Medium" | "High" | "Urgent" {
  const t = `${device} ${problem}`.toLowerCase();
  if (/urgent|emergency|stopped|down|not billing|no internet|server|cctv.*(off|down)/.test(t)) return "Urgent";
  if (/today|asap|business|shop.*clos|can't work|cannot work/.test(t)) return "High";
  return "Medium";
}

/* ---------- Phase 5: Nepali tuning + feedback loop ---------- */
export type Lang = "ne" | "en";

export function detectLang(text: string): Lang {
  if (/[\u0900-\u097F]/.test(text)) return "ne";
  if (/\b(hajur|namaste|dhanyabad|kati|kasto|kun|kahile|cha|chha|garnus|dinus|hola|tapai)\b/i.test(text)) return "ne";
  return "en";
}

export const REVIEW_URL =
  process.env.NEXT_PUBLIC_REVIEW_URL ||
  "https://search.google.com/local/writereview?placeid=ChIJLeSgRjcZ6zkR0UwBUHfxTFE";

export function feedbackUrl(bookingId: string, base?: string): string {
  const root = base || process.env.NEXT_PUBLIC_SITE_URL || "https://prixnaitsolution.com.np";
  return `${root}/feedback.html?ref=${encodeURIComponent(bookingId)}`;
}

/** Customer-facing templates, bilingual. Keep voice-readable (short). */
export function tpl(key: "confirm" | "reminder" | "winback" | "feedbackAsk", lang: Lang, vars: { name?: string; id?: string; service?: string; day?: string; time?: string }): string {
  const first = (vars.name || "").split(" ")[0] || (lang === "ne" ? "hajur" : "there");
  const slot = [vars.day, vars.time].filter(Boolean).join(" ");
  switch (key) {
    case "confirm":
      return lang === "ne"
        ? `Namaste ${first} 🙏 Prixna IT Solution: tapaiiko booking (${vars.id}) ${vars.service || ""} ${slot} confirm bhayo. Hamro team Sun–Fri 9:30–6:30 ma call garchha.`
        : `Namaste ${first} 🙏 Prixna confirmed your booking (${vars.id}) for ${vars.service || "service"} ${slot ? "on " + slot : ""}. Our team calls Sun–Fri 9:30–6:30.`;
    case "reminder":
      return lang === "ne"
        ? `Namaste ${first} 🙏 Reminder: Prixna visit (${vars.id}) ${slot} ma chha. Confirm garna YES reply garnus, or call +977 9813714582.`
        : `Namaste ${first} 🙏 Reminder: Prixna visit (${vars.id}) on ${slot}. Reply YES to confirm or call +977 9813714582.`;
    case "winback":
      return lang === "ne"
        ? `Namaste 🙏 Prixna IT Solution ma call garnubhayeko ma dhanyabad! Bhetna sakenaun — maaf garnus. Tapaiilai chaandai call garchhaun. Urgent chha bhane WhatsApp 9813714582.`
        : `Namaste 🙏 Thanks for calling Prixna IT Solution! Sorry we missed you — we call back shortly. Urgent? WhatsApp 9813714582.`;
    case "feedbackAsk":
      return lang === "ne"
        ? `Namaste ${first} 🙏 Hamro sewa kasto lagyo? 1–5 star dinus: ${feedbackUrl(vars.id || "")} Ramro lagyo bhane Google review pani dinus — dherai dhanyabad!`
        : `Namaste ${first} 🙏 How was our service? Rate 1–5 stars: ${feedbackUrl(vars.id || "")} Loved it? A Google review means a lot!`;
  }
}
