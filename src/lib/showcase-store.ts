/* Showcase store — typed localStorage access shared by /showcase, /dashboard, /admin.
   SAME key as the static site (prixna_showcase_v1) so both stacks see the same device data.
   Seed fallback: /data/showcase.json (public copy of data/showcase.json). */

export interface ShowcaseItem {
  id: string;
  type: "hardware" | "software" | "service";
  name: string;
  tagline?: string;
  category?: string;
  icon?: string;
  image?: string;
  priceNPR?: number;
  priceNote?: string;
  stock?: string;
  features?: string[];
  demoId?: string;
  planIds?: string[];
  active?: boolean;
  featured?: boolean;
}

export const SHOWCASE_KEY = "prixna_showcase_v1";
export const SHOWCASE_SEED_URL = "/data/showcase.json";

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return v == null ? fb : (v as T);
  } catch {
    return fb;
  }
}
function write(key: string, v: unknown) {
  localStorage.setItem(key, JSON.stringify(v));
}

export function priceLabel(x: ShowcaseItem): string {
  if (x.priceNPR && +x.priceNPR > 0) {
    try {
      return "Rs. " + Math.round(+x.priceNPR).toLocaleString("en-IN");
    } catch {
      return "Rs. " + x.priceNPR;
    }
  }
  return x.priceNote || "Price on request";
}

export function detailLink(x: ShowcaseItem): string {
  if (x.type === "software" && x.demoId) return `/showcase?item=${encodeURIComponent(x.demoId)}`;
  return `/showcase?item=${encodeURIComponent(x.id)}`;
}

export const showcaseStore = {
  all: (): ShowcaseItem[] => {
    const v = read<{ items?: ShowcaseItem[] }>(SHOWCASE_KEY, { items: [] });
    return (v.items || []).filter((x) => x.active !== false);
  },
  raw: (): ShowcaseItem[] => {
    const v = read<{ items?: ShowcaseItem[] }>(SHOWCASE_KEY, { items: [] });
    return v.items || [];
  },
  save: (items: ShowcaseItem[]) =>
    write(SHOWCASE_KEY, { updatedAt: new Date().toISOString(), items }),
};

export async function loadShowcaseSeed(): Promise<ShowcaseItem[]> {
  const res = await fetch(SHOWCASE_SEED_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("seed not found");
  const j = await res.json();
  if (!Array.isArray(j.items)) throw new Error("bad seed");
  return j.items as ShowcaseItem[];
}
