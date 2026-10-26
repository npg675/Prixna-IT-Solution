"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StaffGate } from "@/components/StaffGate";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  computeTotals,
  newQuoteId,
  parseItems,
  numberToWordsNPR,
  PRESET_PACKAGES,
  type QRow,
} from "@/lib/quote";
import { npr, store, type Lead, type Quote } from "@/lib/staff-store";
import { CatalogItem } from "@/lib/ai-catalog";

const VAT_PCT = 13;
const COMPANY = {
  name: "Prixna IT Solution Pvt. Ltd.",
  tagline: "Software · CCTV · Networking · Computer Sales & Repair",
  address: "Koteshwor-32, Kathmandu, Nepal (Near Koteshwor Chowk)",
  phone: "+977 9813714582",
  phoneAlt: "01-5100000",
  email: "info@prixnaitsolution.com.np",
  web: "www.prixnaitsolution.com.np",
  panVat: "610294819",
  bankName: "Global IME Bank / Nabil Bank",
  accountName: "Prixna IT Solution Pvt. Ltd.",
  accountNo: "012010100000000",
  branch: "Koteshwor Branch, Kathmandu",
};

const STANDARD_TERMS = [
  "Quotation validity: Prices are valid for specified days from the issue date.",
  "Payment terms: 30% advance with work order/confirmation; remaining balance upon delivery & installation.",
  "Warranty: Official manufacturer/service warranty applies as detailed per line item.",
  "Delivery timeline: 1–2 working days within Kathmandu Valley. Site visits scheduled upon confirmation.",
  "Government taxes: 13% VAT charged where applicable as per Inland Revenue Department rules.",
];

function Builder() {
  const sp = useSearchParams();
  const [qid] = useState(() => sp.get("qid") || "");
  const [leadId] = useState(() => sp.get("lead") || "");

  // View state: 'edit' | 'preview' | 'split'
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");

  // Customer & Quote Metadata
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [clientPan, setClientPan] = useState("");
  const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [validDays, setValidDays] = useState(7);
  const [advancePct, setAdvancePct] = useState(30);

  // Line items
  const [rows, setRows] = useState<QRow[]>([
    { qty: 1, desc: "", price: 0, unit: "Pcs", warranty: "1 Year" },
  ]);
  const [discount, setDiscount] = useState(0);
  const [vatOn, setVatOn] = useState(true);
  const [savedId, setSavedId] = useState(qid || "");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Catalog picker & leads state
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  // Fetch catalog & recent leads for auto-complete
  useEffect(() => {
    try {
      setRecentLeads(store.leads.all().slice(0, 15));
    } catch {}

    fetch("/api/ai-catalog")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.catalog && data.catalog.items) {
          setCatalogItems(data.catalog.items);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize or load from qid / leadId
  useEffect(() => {
    if (qid) {
      const q = store.quotes.all().find((x) => x.id === qid);
      if (q) {
        setCustomer(q.customer || "");
        setPhone(q.phone || "");
        setEmail(q.email || "");
        setCompany(q.company || "");
        setLocation(q.location || "");
        setClientPan(q.panVat || "");
        setRows(q.rows.length ? q.rows : [{ qty: 1, desc: "", price: 0, unit: "Pcs" }]);
        setDiscount(q.discount || 0);
        setVatOn(q.vatOn !== false);
        setValidDays(q.validDays || 7);
        setAdvancePct(q.advancePct || 30);
        setNotes(q.notes || "");
        setSavedId(q.id);
        if (q.createdAt) setQuoteDate(q.createdAt.slice(0, 10));
      }
      return;
    }
    if (leadId) {
      const l: Lead | undefined = store.leads.all().find((x) => x.id === leadId);
      if (l) {
        setCustomer(l.name || "");
        setPhone(l.phone || "");
        setEmail(l.email || "");
        setCompany(l.company || "");
        setLocation(l.location || "");
        const parsed = parseItems(l.message || "");
        if (parsed.length) setRows(parsed);
      }
    }
  }, [qid, leadId]);

  // Derived computations
  const t = useMemo(
    () => computeTotals(rows, discount, VAT_PCT, vatOn, advancePct),
    [rows, discount, vatOn, advancePct]
  );

  const validUntilDate = useMemo(() => {
    try {
      const d = new Date(quoteDate);
      d.setDate(d.getDate() + (Number(validDays) || 7));
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "—";
    }
  }, [quoteDate, validDays]);

  const quoteDateFormatted = useMemo(() => {
    try {
      return new Date(quoteDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return quoteDate;
    }
  }, [quoteDate]);

  const generatedQuoteId = useMemo(() => newQuoteId(), []);
  const activeQuoteId = savedId || generatedQuoteId;

  // Row modifications
  const setRow = (i: number, k: keyof QRow, v: string | number) =>
    setRows((rs) =>
      rs.map((r, j) =>
        j === i
          ? {
              ...r,
              [k]: k === "desc" || k === "unit" || k === "warranty" ? String(v) : Math.max(0, +v || 0),
            }
          : r
      )
    );

  const addRow = (item?: Partial<QRow>) => {
    setRows((rs) => [
      ...rs,
      {
        qty: item?.qty || 1,
        desc: item?.desc || "",
        price: item?.price || 0,
        unit: item?.unit || "Pcs",
        warranty: item?.warranty || "1 Year",
      },
    ]);
  };

  const duplicateRow = (i: number) => {
    const copy = { ...rows[i] };
    const next = [...rows];
    next.splice(i + 1, 0, copy);
    setRows(next);
  };

  const removeRow = (i: number) => {
    if (rows.length === 1) {
      setRows([{ qty: 1, desc: "", price: 0, unit: "Pcs" }]);
    } else {
      setRows((rs) => rs.filter((_, j) => j !== i));
    }
  };

  // Load a preset package bundle
  const loadPackage = (pkgId: string) => {
    const pkg = PRESET_PACKAGES.find((p) => p.id === pkgId);
    if (!pkg) return;
    if (rows.length === 1 && !rows[0].desc) {
      setRows(pkg.rows);
    } else {
      setRows((rs) => [...rs, ...pkg.rows]);
    }
    setMsg({ type: "success", text: `⚡ Added preset package: "${pkg.name}"` });
  };

  // Quick Lead Selection
  const applyLead = (l: Lead) => {
    setCustomer(l.name || "");
    setPhone(l.phone || "");
    setEmail(l.email || "");
    setCompany(l.company || "");
    setLocation(l.location || "");
    const parsed = parseItems(l.message || "");
    if (parsed.length) setRows(parsed);
    setMsg({ type: "success", text: `Auto-filled details from Lead ${l.id} (${l.name || "Customer"})` });
  };

  // Catalog item picker add
  const addCatalogItem = (it: CatalogItem) => {
    const numPrice = it.priceNumeric || Number(String(it.price).replace(/[^\d.]/g, "")) || 0;
    addRow({
      qty: 1,
      desc: `${it.name} ${it.specs ? `(${it.specs})` : ""}`,
      price: numPrice,
      unit: "Unit",
      warranty: it.warranty || "1 Year",
    });
    setMsg({ type: "success", text: `Added "${it.name}" from catalog (Rs. ${numPrice.toLocaleString("en-IN")})` });
  };

  // Save Quote
  const save = () => {
    const id = savedId || activeQuoteId;
    const rec: Quote = {
      id,
      leadRef: leadId,
      customer,
      phone,
      email,
      company,
      location,
      panVat: clientPan,
      rows,
      discount,
      vatOn,
      validDays,
      advancePct,
      notes,
      total: t.total,
      advance: t.advance,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    store.quotes.save([rec, ...store.quotes.all().filter((x) => x.id !== id)]);

    const n = (window as unknown as { PRIXNA_NOTIFY?: { push: (t: string, p: unknown) => void } }).PRIXNA_NOTIFY;
    try {
      n?.push("quote", {
        id,
        leadRef: leadId,
        name: customer,
        phone,
        total: t.total,
        advance: t.advance,
        status: "sent",
      });
    } catch {}

    setSavedId(id);
    setMsg({
      type: "success",
      text: `✅ Quote ${id} successfully saved! Total: ${npr(t.total)} (Advance: ${npr(t.advance)})`,
    });
  };

  // WhatsApp formatted quote
  const waCustomer = () => {
    const itemsPreview = rows
      .slice(0, 4)
      .map((r, idx) => `  ${idx + 1}. ${r.desc || "Item"} (x${r.qty})`)
      .join("\n");
    const more = rows.length > 4 ? `\n  ...and ${rows.length - 4} more items` : "";

    const m = `Namaste ${customer || "Valued Client"} 🙏

*Prixna IT Solution — Quotation (${activeQuoteId})*
Date: ${quoteDateFormatted} (Valid for ${validDays} days)

*Items summary:*
${itemsPreview}${more}

• Subtotal: ${npr(t.subtotal)}
${t.discount > 0 ? `• Discount: -${npr(t.discount)}\n` : ""}• VAT (${vatOn ? `${VAT_PCT}%` : "0%"}): ${npr(t.vat)}
*• Grand Total: ${npr(t.total)}*
*• Advance to initiate (${advancePct}%): ${npr(t.advance)}*

Official quotation PDF is ready. Reply YES to confirm or call +977 9813714582.`;

    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(m)}`, "_blank");
  };

  // Copy Summary text
  const copySummary = () => {
    const summary = `QUOTATION ${activeQuoteId} | Prixna IT Solution
Client: ${customer || "—"} (${phone || "—"})
Total: ${npr(t.total)} | Advance: ${npr(t.advance)}
Items: ${rows.length} line items`;
    navigator.clipboard.writeText(summary);
    setMsg({ type: "success", text: "📋 Copied quotation summary to clipboard!" });
  };

  const filteredCatalog = catalogItems.filter(
    (c) =>
      !catalogSearch ||
      c.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      c.price.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="container-custom py-8">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">🧾 Quotation Builder</h1>
            <Badge variant="outline" className="border-primary/40 font-mono text-xs">
              {activeQuoteId}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Create professional corporate quotations in NPR with automated catalog pre-fill, VAT calculations & realistic A4 print preview.
          </p>
        </div>

        {/* View Mode Toggle & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border bg-muted p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                viewMode === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ✏️ Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                viewMode === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              👁️ Print Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`hidden lg:inline-block rounded px-2.5 py-1 font-medium transition-colors ${
                viewMode === "split" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🔲 Split View
            </button>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/admin">📥 Admin Inbox</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">🎛️ Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Alert / Notification Banner */}
      {msg && (
        <div
          className={`mt-4 rounded-lg p-3 text-xs font-medium flex items-center justify-between gap-2 no-print ${
            msg.type === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{msg.text}</span>
          <button type="button" onClick={() => setMsg(null)} className="opacity-70 hover:opacity-100 text-sm font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`mt-6 gap-6 ${
          viewMode === "split" ? "grid grid-cols-1 xl:grid-cols-12" : "flex flex-col"
        }`}
      >
        {/* ==================== LEFT COLUMN: BUILDER & EDITOR ==================== */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className={`${viewMode === "split" ? "xl:col-span-6" : "w-full"} flex flex-col gap-5 no-print`}>
            {/* Quick Automation Toolbar: Presets & Lead Import */}
            <Card className="border-primary/20 shadow-sm">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>⚡ Fast Automation & Package Presets</span>
                  {catalogItems.length > 0 && (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      {catalogItems.length} Products Available
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 flex flex-col gap-3">
                {/* Package preset chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1">Packages:</span>
                  {PRESET_PACKAGES.map((pkg) => (
                    <Button
                      key={pkg.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadPackage(pkg.id)}
                      className="text-xs h-7 px-2"
                      title={`Insert ${pkg.rows.length} items`}
                    >
                      {pkg.name}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
                  {/* Pick from Catalog Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCatalogModal(true)}
                    className="text-xs font-semibold text-primary h-8"
                  >
                    📦 Pick from Live Catalog
                  </Button>

                  {/* Pick from Recent Leads */}
                  {recentLeads.length > 0 && (
                    <select
                      onChange={(e) => {
                        const l = recentLeads.find((x) => x.id === e.target.value);
                        if (l) applyLead(l);
                      }}
                      className="h-8 rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-xs"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        👥 Auto-fill from Recent Leads...
                      </option>
                      {recentLeads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name || l.id} {l.phone ? `(${l.phone})` : ""} — {l.service || "Enquiry"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Details Form */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold">👤 Client & Quotation Details</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="font-medium mb-1 block">Customer / Attention Name</label>
                    <Input
                      placeholder="e.g. Ramesh Shrestha"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">Organization / Company Name</label>
                    <Input
                      placeholder="e.g. Sharma Mart Pvt. Ltd."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">Phone / WhatsApp Number</label>
                    <Input
                      placeholder="e.g. 9813714582"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">Email Address</label>
                    <Input
                      placeholder="e.g. client@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">Site / Delivery Location</label>
                    <Input
                      placeholder="e.g. New Baneshwor, Kathmandu"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">Client PAN / VAT No. (Optional)</label>
                    <Input
                      placeholder="e.g. 601234567"
                      value={clientPan}
                      onChange={(e) => setClientPan(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-medium mb-1 block">Quotation Issue Date</label>
                    <Input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-medium mb-1 block">Validity (Days)</label>
                      <select
                        value={validDays}
                        onChange={(e) => setValidDays(Number(e.target.value))}
                        className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                      >
                        <option value={7}>7 Days</option>
                        <option value={15}>15 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={60}>60 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-medium mb-1 block">Advance %</label>
                      <select
                        value={advancePct}
                        onChange={(e) => setAdvancePct(Number(e.target.value))}
                        className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                      >
                        <option value={20}>20%</option>
                        <option value={30}>30% (Standard)</option>
                        <option value={50}>50%</option>
                        <option value={100}>100%</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items Editor Card */}
            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">📋 Itemized Quotation Rows</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={() => addRow()} className="h-7 text-xs">
                  + Add Empty Row
                </Button>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50 text-muted-foreground">
                        <th className="p-1.5 text-left w-7">#</th>
                        <th className="p-1.5 text-left">Description / Specifications</th>
                        <th className="p-1.5 text-center w-20">Unit</th>
                        <th className="p-1.5 text-right w-16">Qty</th>
                        <th className="p-1.5 text-right w-24">Unit NPR</th>
                        <th className="p-1.5 text-right w-24">Amount</th>
                        <th className="p-1.5 text-right w-14">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="p-1 text-muted-foreground">{i + 1}</td>
                          <td className="p-1">
                            <Input
                              placeholder="Product or service description..."
                              value={r.desc}
                              onChange={(e) => setRow(i, "desc", e.target.value)}
                              className="h-7 text-xs"
                            />
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground">Warranty:</span>
                              <input
                                placeholder="e.g. 1 Year"
                                value={r.warranty || ""}
                                onChange={(e) => setRow(i, "warranty", e.target.value)}
                                className="h-5 px-1 rounded border text-[10px] bg-background max-w-[120px]"
                              />
                            </div>
                          </td>
                          <td className="p-1">
                            <select
                              value={r.unit || "Pcs"}
                              onChange={(e) => setRow(i, "unit", e.target.value)}
                              className="w-full h-7 rounded border bg-background text-[11px] px-1"
                            >
                              <option value="Pcs">Pcs</option>
                              <option value="Unit">Unit</option>
                              <option value="Set">Set</option>
                              <option value="Kit">Kit</option>
                              <option value="Lot">Lot</option>
                              <option value="Year">Year</option>
                              <option value="Month">Month</option>
                              <option value="Service">Service</option>
                            </select>
                          </td>
                          <td className="p-1">
                            <Input
                              type="number"
                              min={1}
                              value={r.qty}
                              onChange={(e) => setRow(i, "qty", e.target.value)}
                              className="h-7 text-xs text-right w-16"
                            />
                          </td>
                          <td className="p-1">
                            <Input
                              type="number"
                              min={0}
                              value={r.price}
                              onChange={(e) => setRow(i, "price", e.target.value)}
                              className="h-7 text-xs text-right w-24"
                            />
                          </td>
                          <td className="p-1 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {npr(r.qty * r.price)}
                          </td>
                          <td className="p-1 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => duplicateRow(i)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground mr-1"
                              title="Duplicate row"
                            >
                              📋
                            </button>
                            <button
                              type="button"
                              onClick={() => removeRow(i)}
                              className="p-1 rounded hover:bg-rose-100 text-rose-600"
                              title="Delete row"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Taxes calculation */}
                <div className="mt-4 pt-3 border-t flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex flex-col gap-2 max-w-sm text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <Checkbox checked={vatOn} onCheckedChange={(v) => setVatOn(v === true)} />
                      <span>Add 13% Government VAT (Official IRD Bill)</span>
                    </label>

                    <div className="flex items-center gap-2 mt-1">
                      <span>Discount (NPR):</span>
                      <Input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, +e.target.value || 0))}
                        className="h-7 w-28 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setDiscount(Math.round(t.subtotal * 0.05))}
                        className="px-1.5 py-0.5 rounded border text-[10px] hover:bg-muted"
                      >
                        5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscount(Math.round(t.subtotal * 0.1))}
                        className="px-1.5 py-0.5 rounded border text-[10px] hover:bg-muted"
                      >
                        10%
                      </button>
                      {discount > 0 && (
                        <button
                          type="button"
                          onClick={() => setDiscount(0)}
                          className="px-1.5 py-0.5 rounded text-[10px] text-rose-500 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown Panel */}
                  <div className="w-full md:w-64 text-xs flex flex-col gap-1.5 bg-muted/30 p-2.5 rounded-lg border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <b>{npr(t.subtotal)}</b>
                    </div>
                    {t.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount:</span>
                        <b>− {npr(t.discount)}</b>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxable Amount:</span>
                      <b>{npr(t.taxable)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT ({vatOn ? VAT_PCT : 0}%):</span>
                      <b>{npr(t.vat)}</b>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 text-sm font-bold text-primary">
                      <span>Grand Total:</span>
                      <span>{npr(t.total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px] pt-0.5">
                      <span>Advance ({advancePct}%):</span>
                      <b>{npr(t.advance)}</b>
                    </div>
                  </div>
                </div>

                {/* Amount in Words preview */}
                <div className="mt-2 text-[11px] text-muted-foreground italic">
                  In Words: <b>{numberToWordsNPR(t.total)}</b>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button type="button" onClick={save} className="font-semibold text-xs">
                    💾 Save Quote
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setViewMode("preview");
                      setTimeout(() => window.print(), 300);
                    }}
                    className="text-xs font-semibold"
                  >
                    🖨️ Print / Save as PDF
                  </Button>
                  <Button
                    type="button"
                    variant="whatsapp"
                    onClick={waCustomer}
                    className="text-xs font-semibold"
                  >
                    💬 WhatsApp Customer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copySummary}
                    className="text-xs"
                  >
                    📋 Copy Summary
                  </Button>
                  {email && (
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(
                        `Quotation ${activeQuoteId} - Prixna IT Solution`
                      )}&body=${encodeURIComponent(
                        `Dear ${customer},\n\nPlease find attached quotation ${activeQuoteId} for ${company || "your enquiry"} totaling ${npr(
                          t.total
                        )}.\n\nBest regards,\nPrixna IT Solution Pvt. Ltd.\n+977 9813714582`
                      )}`}
                    >
                      <Button type="button" variant="outline" className="text-xs">
                        ✉️ Email
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ==================== RIGHT COLUMN: CORPORATE A4 PRINT PREVIEW ==================== */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={`${viewMode === "split" ? "xl:col-span-6" : "w-full mx-auto max-w-4xl"}`}>
            {/* Toolbar for Print view */}
            <div className="mb-3 flex items-center justify-between no-print">
              <span className="text-xs font-semibold text-muted-foreground">
                📄 A4 Letterhead Preview ({quoteDateFormatted})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs font-semibold"
                >
                  🖨️ Print Now
                </Button>
                {viewMode === "preview" && (
                  <Button size="sm" variant="ghost" onClick={() => setViewMode("edit")} className="text-xs">
                    ← Back to Editor
                  </Button>
                )}
              </div>
            </div>

            {/* Printable A4 Document Sheet */}
            <div
              id="quotation-printable-doc"
              className="print-page bg-white text-slate-900 border border-slate-200 rounded-xl shadow-lg p-8 sm:p-10 font-sans text-xs relative overflow-hidden"
              style={{ minHeight: "842px" }}
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-500" />

              {/* Corporate Header */}
              <div className="flex flex-wrap justify-between items-start border-b-2 border-slate-900 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <h2 className="text-xl font-extrabold tracking-tight text-blue-950 uppercase">
                      {COMPANY.name}
                    </h2>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">{COMPANY.tagline}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {COMPANY.address}
                    <br />
                    Phone: <b>{COMPANY.phone}</b> · {COMPANY.phoneAlt} · Email: <b>{COMPANY.email}</b>
                    <br />
                    PAN / VAT Reg: <b>{COMPANY.panVat}</b> · Web: {COMPANY.web}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-blue-950 text-white font-extrabold text-sm px-3 py-1 rounded tracking-wider uppercase mb-1.5">
                    QUOTATION
                  </div>
                  <p className="text-[11px]">
                    Quote No: <b className="font-mono text-blue-950 font-bold">{activeQuoteId}</b>
                  </p>
                  <p className="text-[10px] text-slate-600">Date: <b>{quoteDateFormatted}</b></p>
                  <p className="text-[10px] text-slate-600">
                    Valid Till: <b className="text-emerald-700">{validUntilDate}</b>
                  </p>
                </div>
              </div>

              {/* Client & Billing Info Grid */}
              <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Quotation Prepared For:
                  </h4>
                  <p className="text-sm font-bold text-slate-900">{customer || "Valued Client"}</p>
                  {company && <p className="font-medium text-slate-700">{company}</p>}
                  {phone && <p className="text-slate-600">Phone: <b>{phone}</b></p>}
                  {email && <p className="text-slate-600">Email: {email}</p>}
                  {location && <p className="text-slate-600">Location: {location}</p>}
                  {clientPan && <p className="text-slate-600">PAN/VAT: {clientPan}</p>}
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Payment & Banking Details:
                  </h4>
                  <p className="text-slate-700">Account Name: <b>{COMPANY.accountName}</b></p>
                  <p className="text-slate-700">Bank: <b>{COMPANY.bankName}</b></p>
                  <p className="text-slate-700">A/C No: <b>{COMPANY.accountNo}</b></p>
                  <p className="text-slate-600 text-[10px]">Branch: {COMPANY.branch}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                    ✓ Fonepay QR scan supported from all Mobile Banking apps
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-[11px] border-collapse my-3">
                <thead>
                  <tr className="bg-blue-950 text-white font-semibold text-[10px] uppercase">
                    <th className="p-2 text-left w-8 rounded-l">#</th>
                    <th className="p-2 text-left">Description & Technical Specifications</th>
                    <th className="p-2 text-center w-24">Warranty</th>
                    <th className="p-2 text-center w-14">Unit</th>
                    <th className="p-2 text-right w-12">Qty</th>
                    <th className="p-2 text-right w-24">Unit Price (NPR)</th>
                    <th className="p-2 text-right w-24 rounded-r">Total (NPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                  {rows.map((r, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-slate-50/70" : ""}>
                      <td className="p-2 text-slate-500 font-mono">{i + 1}</td>
                      <td className="p-2">
                        <span className="font-semibold text-slate-900">{r.desc || "Item"}</span>
                      </td>
                      <td className="p-2 text-center text-[10px] text-slate-600 whitespace-nowrap">
                        {r.warranty || "—"}
                      </td>
                      <td className="p-2 text-center text-slate-600">{r.unit || "Pcs"}</td>
                      <td className="p-2 text-right font-semibold">{r.qty}</td>
                      <td className="p-2 text-right">{npr(r.price)}</td>
                      <td className="p-2 text-right font-bold text-slate-900 whitespace-nowrap">
                        {npr(r.qty * r.price)}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400">
                        No line items entered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Summary and In-Words Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 my-4">
                <div className="flex-1 text-[10px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-700 uppercase tracking-wide mb-1">Amount in Words:</p>
                  <p className="font-semibold text-slate-900 text-xs italic">
                    {numberToWordsNPR(t.total)}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p>
                      Advance to initiate work ({advancePct}%):{" "}
                      <b className="text-blue-900 font-bold">{npr(t.advance)}</b>
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      Remaining balance ({100 - advancePct}%): {npr(t.total - t.advance)} upon completion.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-64 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-1.5">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <b className="font-mono">{npr(t.subtotal)}</b>
                  </div>
                  {t.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <b className="font-mono">− {npr(t.discount)}</b>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700">
                    <span>Taxable Amount:</span>
                    <b className="font-mono">{npr(t.taxable)}</b>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>VAT ({vatOn ? VAT_PCT : 0}%):</span>
                    <b className="font-mono">{npr(t.vat)}</b>
                  </div>
                  <div className="flex justify-between border-t-2 border-blue-950 pt-1.5 text-sm font-extrabold text-blue-950">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono">{npr(t.total)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-600">
                <p className="font-bold text-slate-700 uppercase tracking-wider mb-1">Terms & Conditions:</p>
                <ol className="list-decimal pl-4 space-y-0.5">
                  {STANDARD_TERMS.map((term, idx) => (
                    <li key={idx}>{term}</li>
                  ))}
                  {notes && <li className="font-medium text-slate-800">{notes}</li>}
                </ol>
              </div>

              {/* Signature Blocks */}
              <div className="mt-8 pt-4 flex justify-between items-end border-t border-slate-300 text-[11px]">
                <div className="text-center w-52">
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 border border-dashed border-slate-300 rounded px-2 py-0.5">
                      [ Official Stamp & Signature ]
                    </span>
                  </div>
                  <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                    Authorized Signatory
                  </div>
                  <p className="text-[10px] text-slate-500">{COMPANY.name}</p>
                </div>

                <div className="text-center w-52">
                  <div className="h-10" />
                  <div className="border-t border-slate-900 pt-1 font-bold text-slate-900">
                    Customer Acceptance
                  </div>
                  <p className="text-[10px] text-slate-500">Signature & Date</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Catalog Picker Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-2xl rounded-xl border bg-background p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>📦 Pick Products from Live Company Catalog</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="rounded p-1 hover:bg-muted text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <Input
              placeholder="Search products by model, brand, spec or price (e.g. Dell, Hikvision, SSD)..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="text-xs mb-3"
              autoFocus
            />

            <div className="max-h-80 overflow-y-auto divide-y rounded border text-xs">
              {filteredCatalog.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 flex items-center justify-between hover:bg-muted/40 transition-colors gap-2"
                >
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.category} · {c.stock} {c.warranty ? `· ${c.warranty}` : ""}
                    </p>
                    {c.specs && <p className="text-[10px] text-muted-foreground/80 truncate max-w-md">{c.specs}</p>}
                  </div>
                  <div className="flex items-center gap-2.5 whitespace-nowrap">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.price}</span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addCatalogItem(c)}
                      className="h-7 text-xs px-2.5 font-semibold"
                    >
                      + Add
                    </Button>
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No matching products in catalog.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 mt-2 border-t">
              <Button type="button" size="sm" variant="outline" onClick={() => setShowCatalogModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuoteBuilderPage() {
  return (
    <StaffGate>
      <Suspense fallback={<div className="p-10 text-center text-sm">Loading quotation builder…</div>}>
        <Builder />
      </Suspense>
    </StaffGate>
  );
}
