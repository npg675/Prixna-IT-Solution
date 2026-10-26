"use client";

import * as React from "react";
import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Play,
  Sparkles,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Phone,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Monitor,
  Cpu,
  Layers,
  ChevronRight,
  Headphones,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  getDemosFromStorage,
  getDemoById,
  DEFAULT_DEMOS,
  type SoftwareDemo,
  getWhatsAppDemoLink,
} from "@/lib/demos-store";
import { DemoPlayer } from "@/components/demo/DemoPlayer";
import { DemoTabs } from "@/components/demo/DemoTabs";
import { DemoFaq } from "@/components/demo/DemoFaq";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";

function DemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productParam = searchParams.get("product") || "";

  const [allDemos, setAllDemos] = useState<SoftwareDemo[]>(DEFAULT_DEMOS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAllDemos(getDemosFromStorage());
    setMounted(true);
  }, []);

  const activeDemos = mounted ? allDemos : DEFAULT_DEMOS;

  const currentDemo = useMemo(() => {
    return getDemoById(productParam, activeDemos);
  }, [productParam, activeDemos]);

  const handleSelectProduct = (id: string) => {
    router.push(`/demo?product=${encodeURIComponent(id)}`, { scroll: false });
  };

  const waLink = getWhatsAppDemoLink(currentDemo);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner / Hero Header */}
      <section className="relative overflow-hidden bg-navy-950 pb-12 pt-28 text-white md:pb-16 md:pt-32">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-royal-600/25 via-navy-950 to-navy-950"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-tech/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-custom relative">
          {/* Breadcrumb Navigation */}
          <nav className="mb-4 flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/solutions" className="hover:text-white transition-colors">
              Software Solutions
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">{currentDemo.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tech opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-tech" />
                </span>
                <span>🎬 Software Demo Theatre · Prixna IT Solution</span>
              </div>

              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
                Watch Software Demo:{" "}
                <span className="bg-gradient-to-r from-royal-200 via-tech to-royal-300 bg-clip-text text-transparent">
                  {currentDemo.name}
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                {currentDemo.tagline}. Watch the short walkthrough below — then, only if you like it, request a free Kathmandu workflow consultation and transparent NPR subscription.
              </p>

              {/* 3-Step Simple Flow */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-medium text-white">
                  <b className="font-mono text-tech">1</b> ▶️ Watch 2–4 Min Demo
                </span>
                <span className="text-white/40">→</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-medium text-white">
                  <b className="font-mono text-tech">2</b> 🆓 Free Shop Consultation
                </span>
                <span className="text-white/40">→</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-medium text-white">
                  <b className="font-mono text-tech">3</b> ✅ Simple NPR Plan &amp; Training
                </span>
              </div>
            </div>

            {/* Quick Consultation CTA */}
            <div className="lg:col-span-4 lg:text-right">
              <div className="inline-flex flex-col items-start rounded-xl border border-white/15 bg-navy-900/80 p-4 backdrop-blur-md lg:items-end">
                <span className="text-xs font-semibold text-tech uppercase tracking-wider">
                  Direct Kathmandu Hotline
                </span>
                <a
                  href={getTelUrl("+9779813714582")}
                  className="mt-1 flex items-center gap-2 text-lg font-bold text-white hover:text-tech transition-colors"
                >
                  <Phone className="h-4 w-4 text-tech" />
                  +977 9813714582
                </a>
                <span className="text-[11px] text-white/60">
                  Sun–Fri, 9:30 AM – 6:30 PM NPT (Koteshwor-32)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Theatre & Consultation Layout */}
      <main className="container-custom py-8 md:py-12">
        {/* Software Selector Tabs */}
        <div className="mb-8">
          <DemoTabs
            demos={activeDemos}
            selectedId={currentDemo.id}
            onSelect={handleSelectProduct}
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Main Video & Deep-Dive (Left 8 Cols) */}
          <div className="space-y-10 lg:col-span-8">
            {/* The Cinema Video Player Shell */}
            <DemoPlayer demo={currentDemo} />

            {/* Product Overview & Features Grid */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    What Makes {currentDemo.name.split("—")[0].trim()} Ideal for Nepal
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Built around actual counter and office workflows in Kathmandu Valley and beyond.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {currentDemo.category}
                  </Badge>
                  {(currentDemo.websiteUrl || currentDemo.liveDemoUrl) && (
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10">
                      <a
                        href={currentDemo.websiteUrl || currentDemo.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-3 w-3 text-primary" />
                        Website ↗
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Feature Points */}
              <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                {currentDemo.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/50 p-3.5"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        {feat}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Audience & Plan Hint */}
              <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Businesses
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {currentDemo.audience}
                  </p>
                </div>

                <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Pricing &amp; Subscription Model
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {currentDemo.planHint}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Software Demos in the Suite */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Explore Other Software Demos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tap any product to watch its 2–4 minute video demo
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allDemos
                  .filter((d) => d.id !== currentDemo.id)
                  .map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => handleSelectProduct(other.id)}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">{other.icon}</span>
                          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {other.duration}
                          </span>
                        </div>
                        <h4 className="mt-3 font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {other.name}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                          {other.tagline}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-primary">
                        <span>▶️ Watch Demo</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Buying FAQ Accordion */}
            <DemoFaq />
          </div>

          {/* Sticky Side Conversion Funnel (Right 4 Cols) */}
          <div className="lg:col-span-4" id="demo-consultation-section">
            <div className="sticky top-24 space-y-6">
              {/* Consultation Booking Box */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6">
                <div className="mb-4">
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                    Free Consultation
                  </Badge>
                  <h3 className="mt-2 font-display text-lg font-bold text-foreground">
                    Liked {currentDemo.name.split("—")[0].trim()}?
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Leave your details below. Our team calls you to understand your shop/office workflow, answer questions, and quote a tailored NPR plan.
                  </p>
                </div>

                <ConsultationForm
                  service={currentDemo.consultService || "Business Software / SaaS Demo"}
                  formType="software-demo-watch"
                  title=""
                  subtitle=""
                  submitText="Request Free Consultation →"
                  showBooking={true}
                  className="space-y-3"
                />

                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-center text-xs text-muted-foreground mb-3">
                    Prefer immediate WhatsApp response?
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-green-600/30 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-300"
                  >
                    <a href={waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                      Chat on WhatsApp Now
                    </a>
                  </Button>
                </div>
              </div>

              {/* Company Credibility Card */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Prixna IT Solution Pvt. Ltd.</span>
                </div>
                <p>📍 Real shop &amp; support center: Koteshwor-32, Kathmandu</p>
                <p>📞 Call: +977 9813714582 (Sun–Fri, 9:30–6:30)</p>
                <p>⭐ 4.5★ Google Rating · 8 verified local reviews</p>
                <p>🛠️ Complete software + hardware support from one trusted partner</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-background/95 px-4 py-2.5 backdrop-blur-md shadow-2xl lg:hidden">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
            {currentDemo.name.split("—")[0].trim()}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {currentDemo.duration}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-green-600/30 bg-green-500/10 text-green-700 hover:bg-green-500/20 px-2.5"
          >
            <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
            </a>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              const el = document.getElementById("demo-consultation-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-xs font-semibold px-3.5"
          >
            Free Consultation →
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}
