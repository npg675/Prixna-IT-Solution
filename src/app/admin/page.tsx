"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StaffGate } from "@/components/StaffGate";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import {
  fmtDate, npr, store, toCSV,
  type Feedback, type Lead, type Quote, type Ticket,
} from "@/lib/staff-store";
import { AISettingsTab } from "@/components/admin/AISettingsTab";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];
type Tab = "leads" | "tickets" | "quotes" | "feedback" | "ai";

function AdminInner() {
  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fStatus, setFStatus] = useState("");
  const [fSvc, setFSvc] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => { setLeads(store.leads.all()); }, []);
  const tickets: Ticket[] = useMemo(() => store.tickets(), [leads]);
  const quotes: Quote[] = useMemo(() => store.quotes.all(), [leads]);
  const feedback: Feedback[] = useMemo(() => store.feedback(), [leads]);

  const filtered = leads.filter((l) =>
    (!fStatus || l.status === fStatus) &&
    (!fSvc || (l.service || "").includes(fSvc)) &&
    (!q || `${l.name} ${l.phone} ${l.company || ""} ${l.message || ""}`.toLowerCase().includes(q.toLowerCase())));

  const mutate = (id: string, fn: (l: Lead) => void) => {
    const arr = store.leads.all();
    const l = arr.find((x) => x.id === id);
    if (!l) return;
    fn(l);
    l.history = [...(l.history || []), { ts: new Date().toISOString(), note: "Updated in Next inbox." }];
    store.leads.save(arr);
    setLeads(arr);
  };

  const exportCSV = () => {
    const blob = new Blob([toCSV(leads)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prixna-leads.csv";
    a.click();
  };

  return (
    <div className="container-custom py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">📥 Lead inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} shown · device-local until Sheets sync</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/dashboard">🎛️ Control Center</Link></Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>⬇ CSV</Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["leads", "tickets", "quotes", "feedback", "ai"] as Tab[]).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
            {t === "leads"
              ? `Leads (${leads.length})`
              : t === "tickets"
              ? `Tickets (${tickets.length})`
              : t === "quotes"
              ? `Quotes (${quotes.length})`
              : t === "feedback"
              ? `Feedback (${feedback.length})`
              : "🤖 AI Assistant"}
          </Button>
        ))}
      </div>

      {tab === "leads" && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <Select value={fStatus || "all"} onValueChange={(v) => setFStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="max-w-44" aria-label="Filter by status"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Filter by service…" value={fSvc} onChange={(e) => setFSvc(e.target.value)} className="max-w-60" />
            <Input placeholder="🔍 Search name, phone…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-60" />
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {filtered.map((l) => (
              <Card key={l.id}>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{l.name || "—"}</b>
                    <Badge>{l.status || "new"}</Badge>
                    <span className="text-xs text-muted-foreground">{l.id} · {fmtDate(l.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm">
                    📞 <a className="text-primary" href={`tel:${l.phone}`}>{l.phone}</a>
                    {l.company && <> · 🏢 {l.company}</>} · 🧰 {l.service}
                    {l.message && <><br />💬 {l.message}</>}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Select value={l.status} onValueChange={(v) => mutate(l.id, (x) => { x.status = v; })}>
                      <SelectTrigger className="max-w-36" aria-label="Status"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="date" value={l.followUp || ""} onChange={(e) => mutate(l.id, (x) => { x.followUp = e.target.value; })} aria-label="Follow-up" className="max-w-44" />
                    <Button asChild variant="whatsapp" size="sm"><a target="_blank" rel="noopener" href={`https://wa.me/9779813714582?text=${encodeURIComponent(`Hello ${l.name}, Prixna following up (${l.id}) re ${l.service}.`)}`}>WhatsApp</a></Button>
                    <Button asChild variant="outline" size="sm"><Link href={`/quote-builder?lead=${l.id}`}>🧾 Quote</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No leads match.</p>}
          </div>
        </div>
      )}

      {tab === "tickets" && (
        <div className="mt-4 flex flex-col gap-3">
          {tickets.map((t) => (
            <Card key={t.id}><CardContent className="pt-4">
              <b>{t.id}</b> <Badge variant={t.priority === "Urgent" ? "destructive" : "secondary"}>{t.priority}</Badge>
              <p className="mt-1 text-sm">🧰 {t.device} — {t.problem}<br /><span className="text-muted-foreground">📞 {t.phone} · {fmtDate(t.createdAt)}</span></p>
            </CardContent></Card>
          ))}
          {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets yet.</p>}
        </div>
      )}

      {tab === "quotes" && (
        <div className="mt-4 flex flex-col gap-3">
          {quotes.map((x) => (
            <Card key={x.id}><CardContent className="pt-4">
              <b>{x.id}</b> <Badge>{x.status}</Badge>
              <p className="mt-1 text-sm">{npr(x.total)} · {x.customer} <Link className="text-primary underline" href={`/quote-builder?qid=${x.id}`}>Open</Link></p>
            </CardContent></Card>
          ))}
          {quotes.length === 0 && <p className="text-sm text-muted-foreground">No quotes yet.</p>}
        </div>
      )}

      {tab === "feedback" && (
        <div className="mt-4 flex flex-col gap-3">
          {feedback.map((f, i) => (
            <Card key={i}><CardContent className="pt-4">
              <b>{"⭐".repeat(Math.min(+(f.rating || 0), 5))}</b> {f.ref} · {f.name}
              {f.comment && <p className="mt-1 text-sm">💬 {f.comment}</p>}
            </CardContent></Card>
          ))}
          {feedback.length === 0 && <p className="text-sm text-muted-foreground">No ratings yet.</p>}
        </div>
      )}

      {tab === "ai" && <AISettingsTab />}

      <Card className="mt-6"><CardHeader><CardTitle className="text-base">Backup</CardTitle></CardHeader>
        <CardContent><Button variant="outline" size="sm" onClick={exportCSV}>⬇ Export CSV</Button></CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return <StaffGate><AdminInner /></StaffGate>;
}
