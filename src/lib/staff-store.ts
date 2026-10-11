/* Staff store — typed localStorage access shared by /dashboard, /admin, /quote-builder.
   Same keys as the static site so both stacks see the same device data. */

export interface Lead {
  id: string; createdAt: string; form?: string;
  name: string; phone: string; email?: string; company?: string; location?: string;
  service?: string; message?: string; status: string; followUp?: string; assignee?: string;
  history?: { ts: string; note: string }[];
}
export interface Ticket {
  id: string; createdAt: string; phone: string; device?: string;
  problem?: string; priority?: string; status: string;
}
export interface Booking {
  id: string; createdAt: string; name?: string; phone?: string;
  email?: string;
  service?: string; day?: string; time?: string; location?: string; status?: string;
}
export interface QuoteRow {
  qty: number;
  desc: string;
  price: number;
  unit?: string;
  warranty?: string;
}
export interface Quote {
  id: string;
  leadRef?: string;
  customer?: string;
  phone?: string;
  email?: string;
  company?: string;
  location?: string;
  panVat?: string;
  rows: QuoteRow[];
  discount?: number;
  vatOn?: boolean;
  validDays?: number;
  advancePct?: number;
  total?: number;
  advance?: number;
  notes?: string;
  status: string;
  createdAt: string;
}
export interface Feedback { rating?: number; ref?: string; name?: string; comment?: string; ts?: string; mood?: string }
export interface StockItem { id: string; name: string; price: number; qty: number | null; lowAt: number; tracked: boolean; low: boolean }

export const KEYS = {
  leads: "prixna_leads_v1",
  tickets: "prixna_tickets_v1",
  bookings: "prixna_bookings_v1",
  quotes: "prixna_quotes_v1",
  feedback: "prixna_feedback_v1",
  outbox: "prixna_outbox_v1",
  stockQty: "prixna_stock_v1",
  events: "prixna_events",
} as const;

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

export const store = {
  leads: {
    all: (): Lead[] => read<Lead[]>(KEYS.leads, []),
    save: (a: Lead[]) => write(KEYS.leads, a.slice(0, 500)),
  },
  tickets: (): Ticket[] => read<Ticket[]>(KEYS.tickets, []),
  bookings: (): Booking[] => read<Booking[]>(KEYS.bookings, []),
  quotes: {
    all: (): Quote[] => read<Quote[]>(KEYS.quotes, []),
    save: (a: Quote[]) => write(KEYS.quotes, a.slice(0, 200)),
  },
  feedback: (): Feedback[] => read<Feedback[]>(KEYS.feedback, []),
  outbox: (): unknown[] => read<unknown[]>(KEYS.outbox, []),
  stockQty: {
    all: (): Record<string, number> => read<Record<string, number>>(KEYS.stockQty, {}),
    save: (o: Record<string, number>) => write(KEYS.stockQty, o),
  },
};

export function advanceLead(id: string): boolean {
  const next: Record<string, string> = { new: "contacted", contacted: "qualified", qualified: "won" };
  const arr = store.leads.all();
  const l = arr.find((x) => x.id === id);
  if (!l || !next[l.status]) return false;
  l.status = next[l.status];
  l.history = [...(l.history || []), { ts: new Date().toISOString(), note: "Dashboard advance → " + l.status }];
  store.leads.save(arr);
  return true;
}

export function npr(n: number | undefined): string {
  try {
    return "Rs. " + Math.round(+(n || 0)).toLocaleString("en-IN");
  } catch {
    return "Rs. " + Math.round(+(n || 0));
  }
}

export function fmtDate(iso?: string): string {
  try {
    return new Date(iso || "").toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso || "";
  }
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${String(phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export interface Attn {
  sev: number; icon: string; title: string; sub: string; phone?: string;
}
export function attentionQueue(s: { leads: Lead[]; tickets: Ticket[]; bookings: Booking[]; quotes: Quote[]; feedback: Feedback[]; stock: StockItem[] }): Attn[] {
  const q: Attn[] = [];
  s.tickets.filter((t) => t.priority === "Urgent" && t.status !== "closed").forEach((t) =>
    q.push({ sev: 0, icon: "🚨", title: `Urgent ticket ${t.id}`, sub: `${t.device || ""} — ${t.problem || ""}`, phone: t.phone }));
  s.bookings.slice(0, 8).forEach((b) =>
    q.push({ sev: 1, icon: "📅", title: `Booking ${b.id} · ${b.day || ""} ${b.time || ""}`, sub: `${b.name || ""} · ${b.service || ""}`, phone: b.phone }));
  s.leads.filter((l) => l.status === "new").slice(0, 8).forEach((l) =>
    q.push({ sev: 2, icon: "✨", title: `New lead ${l.name || l.id}`, sub: `${l.service || ""} · ${fmtDate(l.createdAt)}`, phone: l.phone }));
  s.quotes.filter((x) => x.status === "sent").slice(0, 6).forEach((x) =>
    q.push({ sev: 3, icon: "🧾", title: `Quote ${x.id} awaiting advance`, sub: `${npr(x.total)} · ${x.customer || ""}`, phone: x.phone }));
  s.stock.filter((p) => p.low).forEach((p) =>
    q.push({ sev: 4, icon: "📦", title: `Low stock: ${p.name}`, sub: `${p.qty} left (reorder at ${p.lowAt})` }));
  s.feedback.filter((f) => +(f.rating || 0) <= 3 && +(f.rating || 0) > 0).slice(0, 4).forEach((f) =>
    q.push({ sev: 2, icon: "⚠️", title: `Recovery: ${f.rating}/5 ${f.ref || ""}`, sub: f.comment || f.name || "" }));
  return q.sort((a, b) => a.sev - b.sev).slice(0, 12);
}

export function toCSV(leads: Lead[]): string {
  const head = ["id", "created", "name", "phone", "email", "company", "location", "service", "status", "message"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l) => [l.id, l.createdAt, l.name, l.phone, l.email, l.company, l.location, l.service, l.status, (l.message || "").replace(/\n/g, " | ")].map(esc).join(","));
  return head.join(",") + "\n" + rows.join("\n");
}
