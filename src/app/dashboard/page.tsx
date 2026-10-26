"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StaffGate } from "@/components/StaffGate";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  advanceLead, attentionQueue, fmtDate, npr, store,
  type Booking, type Feedback, type Lead, type Quote, type StockItem, type Ticket,
} from "@/lib/staff-store";

function useSnapshot() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const r = () => setTick((t) => t + 1);
    const id = setInterval(r, 30000);
    window.addEventListener("storage", r);
    return () => { clearInterval(id); window.removeEventListener("storage", r); };
  }, []);
  return useMemo(() => {
    void tick;
    return {
      leads: store.leads.all(),
      tickets: store.tickets(),
      bookings: store.bookings(),
      quotes: store.quotes.all(),
      feedback: store.feedback(),
      outbox: store.outbox(),
      stock: [] as StockItem[],
    };
  }, [tick]);
}

function KtmClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const f = () => {
      try {
        const n = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }));
        const open = n.getDay() !== 6 && n.getHours() * 60 + n.getMinutes() >= 570 && n.getHours() * 60 + n.getMinutes() <= 1110;
        setNow(`${n.toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })} NPT · ${open ? "Open now" : "Closed"}`);
      } catch { setNow(""); }
    };
    f();
    const id = setInterval(f, 30000);
    return () => clearInterval(id);
  }, []);
  return <span>{now}</span>;
}

function DashboardInner() {
  const s = useSnapshot();
  const [msg, setMsg] = useState("");
  const queue = useMemo(() => attentionQueue(s), [s]);

  const kpis = useMemo(() => {
    const newLeads = s.leads.filter((l: Lead) => l.status === "new").length;
    const urgent = s.tickets.filter((t: Ticket) => t.priority === "Urgent" && t.status !== "closed").length;
    const sent = s.quotes.filter((x: Quote) => x.status === "sent");
    const paid = s.quotes.filter((x: Quote) => x.status === "paid");
    const ratings = s.feedback.map((f: Feedback) => +(f.rating || 0)).filter((r: number) => r > 0);
    return [
      { label: "New leads", v: String(newLeads) },
      { label: "Urgent tickets", v: String(urgent) },
      { label: "Bookings", v: String(s.bookings.length) },
      { label: "Quote pipeline", v: npr(sent.reduce((a, x) => a + +(x.total || 0), 0)) },
      { label: "Advance in", v: npr(paid.reduce((a, x) => a + +(x.advance || 0), 0)) },
      { label: "Rating", v: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) + "/5" : "—" },
      { label: "Outbox queued", v: String(s.outbox.length) },
    ];
  }, [s]);

  const doAdvance = useCallback((id: string) => {
    if (advanceLead(id)) setMsg("Lead " + id + " advanced ✅");
    else setMsg("Cannot advance " + id);
  }, []);

  const flush = useCallback(() => {
    const n = (window as unknown as { PRIXNA_NOTIFY?: { flush: () => Promise<unknown> } }).PRIXNA_NOTIFY;
    if (n) n.flush().then(() => setMsg("Sync retried — check Sheets in a minute."));
    else setMsg("Sync bridge not loaded yet — refresh the page.");
  }, []);

  const exportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...s }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prixna-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, [s]);

  const stages = ["new", "contacted", "qualified", "won", "lost"];
  const next: Record<string, string> = { new: "contacted", contacted: "qualified", qualified: "won" };

  return (
    <div className="container-custom py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">🎛️ Control Center</h1>
          <p className="mt-1 text-sm text-muted-foreground"><KtmClock /> · {msg || "Live from this browser"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/admin">📥 Inbox</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/admin/demos">🎬 Demo Videos</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/admin/ai">🤖 AI Config</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/quote-builder">🧾 New quote</Link></Button>
          <Button variant="outline" size="sm" onClick={flush}>🔄 Retry sync</Button>
          <Button variant="outline" size="sm" onClick={exportAll}>⬇ Export</Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-4"><div className="text-2xl font-bold">{k.v}</div><div className="text-xs text-muted-foreground">{k.label}</div></CardContent></Card>
        ))}
      </div>

      <Card className="mt-4 border-amber-200">
        <CardHeader><CardTitle>⚡ Needs attention ({queue.length})</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {queue.length === 0 && <p className="text-sm text-muted-foreground">All clear 🎉</p>}
          {queue.map((a, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <span className="text-xl">{a.icon}</span>
              <div className="min-w-52 flex-1"><b>{a.title}</b><br /><span className="text-xs text-muted-foreground">{a.sub}</span></div>
              {a.phone && (<>
                <Button asChild variant="outline" size="sm"><a href={`tel:${a.phone.replace(/\s/g, "")}`}>📞</a></Button>
                <Button asChild variant="whatsapp" size="sm"><a target="_blank" rel="noopener" href={`https://wa.me/${a.phone.replace(/\D/g, "")}`}>💬</a></Button>
              </>)}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>📅 Upcoming bookings</CardTitle></CardHeader>
          <CardContent>
            {s.bookings.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
            {s.bookings.slice(0, 6).map((b: Booking) => (
              <p key={b.id} className="my-2 text-sm">
                <b>{b.id}</b> · {b.day} {b.time}<br />
                <span className="text-muted-foreground">
                  {b.name} · {b.service}
                  {b.phone ? ` · 📞 ${b.phone}` : ""}
                  {b.email ? ` · ✉️ ${b.email}` : ""}
                </span>
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>🧾 Quotes</CardTitle></CardHeader>
          <CardContent>
            {s.quotes.length === 0 && <p className="text-sm text-muted-foreground">No quotes yet.</p>}
            {s.quotes.slice(0, 6).map((x: Quote) => (
              <p key={x.id} className="my-2 text-sm">
                <b>{x.id}</b> {npr(x.total)} <Badge variant={x.status === "paid" ? "default" : "secondary"}>{x.status}</Badge> · {x.customer}{" "}
                <Link className="text-primary underline" href={`/quote-builder?qid=${x.id}`}>Open</Link>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-green-200">
        <CardHeader><CardTitle>✨ New Showcase</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hardware &amp; software items you add appear on <Link className="underline" href="/showcase">/showcase</Link> + AI recommendations. Old shop list is not used.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button asChild size="sm"><Link href="/showcase">View showcase</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href="/admin/showcase">Manage items</Link></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>🔀 Lead pipeline</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((st) => (
            <div key={st} className="rounded-lg bg-muted p-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">{st} ({s.leads.filter((l: Lead) => (l.status || "new") === st).length})</h4>
              {s.leads.filter((l: Lead) => (l.status || "new") === st).slice(0, 5).map((l: Lead) => (
                <div key={l.id} className="my-2 text-sm">
                  <b>{l.name || l.id}</b><br /><span className="text-xs text-muted-foreground">{l.service}</span><br />
                  {next[st] && <Button variant="outline" size="sm" className="mt-1" onClick={() => doAdvance(l.id)}>→ {next[st]}</Button>}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>🕒 Live activity</CardTitle></CardHeader>
        <CardContent className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {[...s.leads.slice(0, 8).map((l: Lead) => ({ ts: l.createdAt, t: `✨ Lead ${l.id} · ${l.name} · ${l.service}` })),
            ...s.bookings.slice(0, 8).map((b: Booking) => ({ ts: b.createdAt, t: `📅 Booking ${b.id} · ${b.service}` })),
            ...s.quotes.slice(0, 8).map((x: Quote) => ({ ts: x.createdAt, t: `🧾 Quote ${x.id} ${npr(x.total)} [${x.status}]` }))]
            .sort((a, b) => +new Date(b.ts) - +new Date(a.ts)).slice(0, 15)
            .map((i, k) => <div key={k} className="text-sm">{i.t} <span className="text-muted-foreground">· {fmtDate(i.ts)}</span></div>)}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return <StaffGate><DashboardInner /></StaffGate>;
}
