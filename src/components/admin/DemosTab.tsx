"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type SoftwareDemo,
  DEFAULT_DEMOS,
  DEMOS_STORAGE_KEY,
  parseYouTubeEmbed,
} from "@/lib/demos-store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/hooks/use-toast";
import {
  Video,
  Play,
  Save,
  Plus,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Layers,
  Trash2,
  CheckCircle2,
  Globe,
} from "lucide-react";

function uid() {
  return "demo-" + Date.now().toString(36) + Math.floor(Math.random() * 99);
}

export function DemosTab() {
  const [demos, setDemos] = useState<SoftwareDemo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/demos")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.demos) && data.demos.length) {
          setDemos(data.demos);
        } else {
          setDemos(DEFAULT_DEMOS);
        }
      })
      .catch(() => {
        try {
          const local = localStorage.getItem(DEMOS_STORAGE_KEY);
          if (local) {
            const parsed = JSON.parse(local);
            const list = Array.isArray(parsed) ? parsed : parsed.demos || [];
            if (list.length) {
              setDemos(list);
              return;
            }
          }
        } catch {}
        setDemos(DEFAULT_DEMOS);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFieldChange = (id: string, patch: Partial<SoftwareDemo>) => {
    setDemos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      // Also persist to browser localStorage so client-side AI widget sees it immediately
      try {
        localStorage.setItem(DEMOS_STORAGE_KEY, JSON.stringify(demos));
      } catch {}

      setMsg({ type: "success", text: "✅ Demo video links saved successfully! Live on /demo & AI Chat." });
      toast({
        title: "Demo Videos Saved",
        description: `Successfully updated ${demos.length} software demo products.`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error saving demos";
      setMsg({ type: "error", text: "❌ " + errorMsg });
      toast({
        title: "Save Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = (id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/demo?product=${encodeURIComponent(id)}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        toast({
          title: "Link Copied!",
          description: `Direct link: ${url}`,
        });
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  const handleAddNew = () => {
    const newId = uid();
    const newDemo: SoftwareDemo = {
      id: newId,
      name: "New Software Product",
      tagline: "Short 1-sentence value proposition for Nepali businesses",
      category: "Business Software",
      icon: "💼",
      youtubeUrl: "",
      websiteUrl: "",
      duration: "3 min demo",
      features: [
        "Feature 1: Fast & modern workflow",
        "Feature 2: Real-time reports & audit log",
        "Feature 3: Local setup & Kathmandu support",
      ],
      keyWorkflows: [
        { time: "0:30", title: "Overview", desc: "Main system interface & navigation" },
        { time: "1:30", title: "Key Feature", desc: "Daily operation workflow" },
      ],
      audience: "Retail shops, offices, distributors",
      consultService: "Business Software / SaaS Demo",
      planHint: "Quoted in NPR after free workflow consultation",
      active: true,
      featured: false,
    };
    setDemos((prev) => [...prev, newDemo]);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product demo?")) {
      setDemos((prev) => prev.filter((d) => d.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading software demo settings…
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Top Header Card */}
      <Card className="border-royal-200 bg-gradient-to-r from-royal-50/50 via-white to-tech/5 dark:border-royal-900 dark:from-navy-950 dark:to-navy-900">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Video className="h-5 w-5 text-tech" />
                🎬 Software Demo Videos Manager
              </CardTitle>
              <CardDescription className="text-sm">
                Paste your YouTube video links below. Each product immediately updates in the{" "}
                <Link href="/demo" target="_blank" className="font-semibold text-primary underline">
                  Demo Theatre (/demo)
                </Link>{" "}
                and the <b>Prixna AI Chat Assistant</b>.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add New Demo
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save All Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {msg && (
          <CardContent className="pt-0">
            <div
              className={`rounded-lg p-3 text-xs font-semibold ${
                msg.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {msg.text}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Demos List */}
      <div className="grid gap-6">
        {demos.map((d, index) => {
          const embedUrl = parseYouTubeEmbed(d.youtubeUrl);
          return (
            <Card key={d.id} className="relative overflow-hidden border border-border transition-shadow hover:shadow-md">
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <Badge variant={d.active ? "default" : "secondary"}>
                  {d.active ? "Active" : "Hidden"}
                </Badge>
                {d.featured && <Badge variant="outline" className="border-amber-400 text-amber-600 dark:text-amber-400">Featured</Badge>}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{d.icon || "💼"}</span>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      {index + 1}. {d.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">ID: <code>{d.id}</code> · Category: {d.category}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-12">
                  {/* YouTube URL input */}
                  <div className="space-y-1.5 md:col-span-8">
                    <Label htmlFor={`yt-${d.id}`} className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>🎬 YouTube Video Link (Watch URL, shortlink, or shorts)</span>
                      {embedUrl && (
                        <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Embed Ready
                        </span>
                      )}
                    </Label>
                    <Input
                      id={`yt-${d.id}`}
                      value={d.youtubeUrl || ""}
                      onChange={(e) => handleFieldChange(d.id, { youtubeUrl: e.target.value })}
                      placeholder="Paste YouTube link (e.g. https://youtu.be/dQw4w9WgXcQ or https://www.youtube.com/watch?v=...)"
                      className="font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Works with standard watch links, <code>youtu.be</code>, shorts, and embed URLs.
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5 md:col-span-4">
                    <Label htmlFor={`dur-${d.id}`} className="text-xs font-bold text-foreground">
                      ⏱️ Duration Badge
                    </Label>
                    <Input
                      id={`dur-${d.id}`}
                      value={d.duration || ""}
                      onChange={(e) => handleFieldChange(d.id, { duration: e.target.value })}
                      placeholder="e.g. 3 min demo"
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Product Website / Live Software Link (Traffic opens in new tab) */}
                <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/20 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <Label htmlFor={`web-${d.id}`} className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-tech" />
                      <span>🌐 Product Website Link (Traffic clicks to open in new tab)</span>
                    </Label>
                    {(d.websiteUrl || d.liveDemoUrl) && (
                      <a
                        href={d.websiteUrl || d.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> Test Website Link ↗
                      </a>
                    )}
                  </div>
                  <Input
                    id={`web-${d.id}`}
                    value={d.websiteUrl || d.liveDemoUrl || ""}
                    onChange={(e) =>
                      handleFieldChange(d.id, {
                        websiteUrl: e.target.value,
                        liveDemoUrl: e.target.value,
                      })
                    }
                    placeholder="e.g. https://jigrierp.com or https://prixna.com/products/jigri-erp"
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Visitors watching this demo will see a prominent <b>"Visit Product Website ↗"</b> button that opens this page in a new browser tab.
                  </p>
                </div>

                {/* Inline Preview if URL exists */}
                {embedUrl ? (
                  <div className="rounded-xl border border-border bg-black/5 p-3 dark:bg-black/20">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5 text-tech" />
                      Live Cinema Preview:
                    </p>
                    <div className="relative aspect-video max-w-md overflow-hidden rounded-lg bg-black shadow-sm">
                      <iframe
                        src={embedUrl}
                        title={`${d.name} preview`}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    💡 <i>No video linked yet. The demo page will show the "Demo video coming soon — Request live 1-on-1 demo" placeholder until you paste a YouTube link.</i>
                  </div>
                )}

                {/* Tagline & Audience */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Title &amp; Tagline</Label>
                    <Input
                      value={d.name}
                      onChange={(e) => handleFieldChange(d.id, { name: e.target.value })}
                      className="text-xs font-bold"
                    />
                    <Textarea
                      rows={2}
                      value={d.tagline}
                      onChange={(e) => handleFieldChange(d.id, { tagline: e.target.value })}
                      placeholder="Brief tagline"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Target Audience &amp; Category</Label>
                    <Input
                      value={d.audience || ""}
                      onChange={(e) => handleFieldChange(d.id, { audience: e.target.value })}
                      placeholder="e.g. Retail shops, wholesale, supermarkets"
                      className="text-xs"
                    />
                    <Input
                      value={d.category || ""}
                      onChange={(e) => handleFieldChange(d.id, { category: e.target.value })}
                      placeholder="Category"
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(d.id)}
                      className="gap-1.5 text-xs"
                    >
                      {copiedId === d.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === d.id ? "Copied!" : "Copy Share Link"}
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                    >
                      <Link href={`/demo?product=${encodeURIComponent(d.id)}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open on /demo ↗
                      </Link>
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={d.active}
                        onChange={(e) => handleFieldChange(d.id, { active: e.target.checked })}
                        className="rounded border-border text-primary"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={d.featured}
                        onChange={(e) => handleFieldChange(d.id, { featured: e.target.checked })}
                        className="rounded border-border text-primary"
                      />
                      <span>Featured</span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(d.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Floating / Bottom Save Bar */}
      <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
        <p className="text-xs text-muted-foreground">
          {demos.length} software products configured. Click save to publish changes.
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddNew} variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Another Product
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save All Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
