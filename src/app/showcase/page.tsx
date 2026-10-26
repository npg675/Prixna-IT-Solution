"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  loadShowcaseSeed, priceLabel, showcaseStore, type ShowcaseItem,
} from "@/lib/showcase-store";

type Filter = "all" | "software" | "hardware";

function badgeFor(x: ShowcaseItem) {
  return x.type === "software" ? "💼 SOFTWARE" : x.type === "service" ? "🛠️ SERVICE" : "📦 HARDWARE";
}

function ctaFor(x: ShowcaseItem) {
  // Software → demo first; hardware/service → contact/quote funnel (no fake checkout).
  if (x.type === "software" && x.demoId) {
    return { href: `/contact?service=${encodeURIComponent("Business Software Demo")}&product=${encodeURIComponent(x.demoId)}`, label: "🎬 Request Demo" };
  }
  return { href: `/contact?service=${encodeURIComponent(x.name)}`, label: "🛒 Order / Enquire" };
}

function ShowcaseInner() {
  const sp = useSearchParams();
  const itemId = sp.get("item") || "";
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const local = showcaseStore.all();
    if (local.length) {
      setItems(local);
      setLoaded(true);
      return;
    }
    loadShowcaseSeed()
      .then((seed) => {
        showcaseStore.save(seed);
        setItems(seed.filter((x) => x.active !== false));
      })
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  const detail = useMemo(
    () => (itemId ? items.find((x) => x.id === itemId) || null : null),
    [itemId, items]
  );
  const featured = useMemo(() => items.filter((x) => x.featured), [items]);
  const list = useMemo(
    () => (filter === "all" ? items : items.filter((x) => x.type === filter)),
    [filter, items]
  );

  return (
    <div className="container-custom py-10">
      <p className="text-xs text-muted-foreground"><Link href="/" className="underline">Home</Link> / Showcase</p>
      <h1 className="font-display text-3xl font-bold">✨ New Showcase</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Current hardware &amp; software picks, added by our team. Software → request a demo first. Hardware → order, pay, staff verifies.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "software", "hardware"] as Filter[]).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "software" ? "💼 Software" : "📦 Hardware"}
          </Button>
        ))}
      </div>

      {detail && (
        <Card className="mt-6">
          <CardContent className="pt-4">
            <div className="text-4xl">{detail.icon || "📦"}</div>
            <h2 className="mt-2 text-xl font-bold">{detail.name}</h2>
            <p className="text-sm text-muted-foreground">{detail.tagline}</p>
            <p className="mt-1 text-sm"><b>{priceLabel(detail)}</b> · {detail.category} · {detail.stock}</p>
            {(detail.features || []).length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {detail.features!.map((f, i) => <li key={i}>✓ {f}</li>)}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm"><a href={ctaFor(detail).href}>{ctaFor(detail).label}</a></Button>
              <Button asChild variant="outline" size="sm"><Link href="/showcase">← All items</Link></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {featured.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-bold">Featured</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((x) => <ShowCard key={x.id} x={x} />)}
          </div>
        </>
      )}

      <h2 className="mt-8 text-xl font-bold">
        {filter === "all" ? "All items" : filter === "software" ? "💼 Software" : "📦 Hardware"}
      </h2>
      {!loaded && <p className="mt-3 text-sm text-muted-foreground">Loading showcase…</p>}
      {loaded && list.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nothing in this group yet.</p>}
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((x) => <ShowCard key={x.id} x={x} />)}
      </div>
    </div>
  );
}

function ShowCard({ x }: { x: ShowcaseItem }) {
  const cta = ctaFor(x);
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <Badge className="self-start">{badgeFor(x)}</Badge>
        <div className="pt-2 text-4xl">{x.icon || "📦"}</div>
        <CardTitle className="text-lg">{x.name}</CardTitle>
        <CardDescription>{x.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="text-sm"><b>{priceLabel(x)}</b> <span className="text-muted-foreground">· {x.stock}</span></p>
        <div className="mt-3 flex flex-wrap gap-2" style={{ marginTop: "auto" }}>
          <Button asChild size="sm"><a href={cta.href}>{cta.label}</a></Button>
          <Button asChild variant="outline" size="sm"><Link href={`/showcase?item=${encodeURIComponent(x.id)}`}>Details</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShowcasePage() {
  return (
    <Suspense fallback={<div className="container-custom py-10">Loading showcase…</div>}>
      <ShowcaseInner />
    </Suspense>
  );
}
