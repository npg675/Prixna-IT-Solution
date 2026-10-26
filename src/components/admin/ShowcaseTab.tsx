"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
import {
  loadShowcaseSeed, priceLabel, showcaseStore, type ShowcaseItem,
} from "@/lib/showcase-store";

function uid() {
  return "show-" + Date.now().toString(36) + Math.floor(Math.random() * 99);
}

const empty = (type: ShowcaseItem["type"]): ShowcaseItem => ({
  id: uid(), type, name: type === "software" ? "New Software" : "New Hardware",
  icon: type === "software" ? "💼" : "📦", tagline: "", category: "",
  priceNPR: 0, priceNote: "Price on request", stock: type === "software" ? "demo" : "in",
  features: [], demoId: "", planIds: [], active: true, featured: false,
});

export function ShowcaseTab() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const local = showcaseStore.raw();
    if (local.length) {
      setItems(local);
      return;
    }
    loadShowcaseSeed()
      .then((seed) => { showcaseStore.save(seed); setItems(seed); })
      .catch(() => setItems([]));
  }, []);

  const persist = (next: ShowcaseItem[], note?: string) => {
    showcaseStore.save(next);
    setItems(next);
    if (note) setMsg(note);
  };
  const patch = (id: string, p: Partial<ShowcaseItem>) =>
    persist(items.map((x) => (x.id === id ? { ...x, ...p } : x)), "✓ saved");

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prixna-showcase.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <div className="mt-4">
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-base">✨ New Showcase — hardware &amp; software (replaces old shop list)</CardTitle>
          <CardDescription>Add items here — they appear on /showcase + AI recommendations. No code changes. {msg}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => persist([empty("hardware"), ...items], "Hardware added")}>＋ Add hardware</Button>
          <Button size="sm" onClick={() => persist([empty("software"), ...items], "Software added")}>＋ Add software</Button>
          <Button variant="outline" size="sm" onClick={exportJSON}>⬇ Export JSON</Button>
        </CardContent>
      </Card>

      <div className="mt-3 flex flex-col gap-3">
        {items.map((x) => (
          <Card key={x.id}>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <b>{x.icon} {x.name}</b>
                <Badge variant={x.active === false ? "destructive" : "default"}>{x.type}{x.active === false ? " · hidden" : ""}</Badge>
                <span className="text-xs text-muted-foreground">{x.id} · {priceLabel(x)}</span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div><Label>Type</Label>
                  <select className="mt-1 w-full rounded-md border p-2 text-sm" value={x.type}
                    onChange={(e) => patch(x.id, { type: e.target.value as ShowcaseItem["type"] })}>
                    <option value="hardware">📦 Hardware</option>
                    <option value="software">💼 Software</option>
                    <option value="service">🛠️ Service</option>
                  </select>
                </div>
                <div className="sm:col-span-2"><Label>Name</Label>
                  <Input value={x.name} onChange={(e) => patch(x.id, { name: e.target.value })} />
                </div>
                <div><Label>Icon emoji</Label>
                  <Input value={x.icon || ""} onChange={(e) => patch(x.id, { icon: e.target.value })} />
                </div>
                <div><Label>Tagline</Label>
                  <Input value={x.tagline || ""} onChange={(e) => patch(x.id, { tagline: e.target.value })} />
                </div>
                <div><Label>Category</Label>
                  <Input value={x.category || ""} onChange={(e) => patch(x.id, { category: e.target.value })} />
                </div>
                <div><Label>Price NPR (0 = quote)</Label>
                  <Input type="number" min={0} value={x.priceNPR || 0}
                    onChange={(e) => patch(x.id, { priceNPR: Math.max(0, +e.target.value || 0) })} />
                </div>
                <div><Label>Price note (if 0)</Label>
                  <Input value={x.priceNote || ""} onChange={(e) => patch(x.id, { priceNote: e.target.value })} />
                </div>
                <div><Label>Stock (in / out / quote / demo)</Label>
                  <Input value={x.stock || ""} onChange={(e) => patch(x.id, { stock: e.target.value })} />
                </div>
                <div className="sm:col-span-2"><Label>Features (separate with | )</Label>
                  <Input value={(x.features || []).join(" | ")}
                    onChange={(e) => patch(x.id, { features: e.target.value.split("|").map((s) => s.trim()).filter(Boolean) })} />
                </div>
                <div><Label>Demo id (software only)</Label>
                  <Input value={x.demoId || ""} placeholder="e.g. jigri-erp"
                    onChange={(e) => patch(x.id, { demoId: e.target.value.trim() })} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={x.active !== false}
                    onChange={(e) => patch(x.id, { active: e.target.checked })} /> Visible
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!x.featured}
                    onChange={(e) => patch(x.id, { featured: e.target.checked })} /> Featured
                </label>
                <a className="text-primary underline" href={`/showcase?item=${encodeURIComponent(x.id)}`} target="_blank" rel="noopener">🔗 Preview</a>
                <Button variant="outline" size="sm"
                  onClick={() => { if (confirm("Delete this showcase item?")) persist(items.filter((y) => y.id !== x.id), "Deleted"); }}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No items yet — click “Add hardware / software”.</p>}
      </div>
    </div>
  );
}
