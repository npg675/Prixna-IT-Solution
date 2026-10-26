"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Clock,
  Sparkles,
  Share2,
  CheckCircle2,
  MessageCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Layers,
  Copy,
  Check,
  PhoneCall,
  Laptop,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/hooks/use-toast";
import {
  type SoftwareDemo,
  parseYouTubeEmbed,
  getWhatsAppDemoLink,
} from "@/lib/demos-store";

interface DemoPlayerProps {
  demo: SoftwareDemo;
  onOpenConsultation?: () => void;
}

export function DemoPlayer({ demo, onOpenConsultation }: DemoPlayerProps) {
  const [copied, setCopied] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState(0);

  const embedUrl = parseYouTubeEmbed(demo.youtubeUrl);
  const waLink = getWhatsAppDemoLink(demo);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/demo?product=${encodeURIComponent(demo.id)}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        toast({
          title: "Demo link copied!",
          description: `Share link for ${demo.name} copied to clipboard.`,
        });
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleAskAI = () => {
    if (typeof window !== "undefined") {
      const fab = document.getElementById("prixna-ai-fab");
      if (fab) {
        fab.click();
        setTimeout(() => {
          const inp = document.getElementById("prixna-ai-input") as HTMLInputElement | null;
          if (inp) {
            inp.value = `I'm watching the demo for ${demo.name}. Can you explain the pricing, hardware requirements, and how to get started?`;
            inp.focus();
          }
        }, 500);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Cinema Video Frame Shell */}
      <div className="relative rounded-2xl border border-white/10 bg-navy-950 p-2 shadow-2xl backdrop-blur-xl sm:p-3">
        {/* Ambient Neon Glow */}
        <div
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-royal-600/30 via-tech/25 to-royal-400/30 opacity-70 blur-xl transition-opacity duration-700 hover:opacity-100"
          aria-hidden="true"
        />

        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-navy-900">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${demo.name} walkthrough video`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : demo.videoFile ? (
            <video
              src={demo.videoFile}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            /* Interactive Live Simulation & Dashboard Mockup when video is being uploaded */
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-royal-950 p-4 sm:p-6 md:p-8">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-xs text-white/50">
                    prixna-software://{demo.id}/live-preview
                  </span>
                </div>
                <Badge variant="outline" className="border-tech/40 bg-tech/10 text-tech text-[11px]">
                  <Sparkles className="mr-1 h-3 w-3" /> Live Software Tour
                </Badge>
              </div>

              {/* Central Software Feature Stage */}
              <div className="my-auto grid items-center gap-6 md:grid-cols-12">
                <div className="space-y-3 md:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                    <span className="text-xl">{demo.icon}</span>
                    <span className="font-medium text-white">{demo.category}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-tech">{demo.duration}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                    {demo.name}
                  </h3>

                  <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                    {demo.tagline}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {demo.features.slice(0, 3).map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/90"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-tech shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-md md:col-span-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-tech">
                    Live Demo Access
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    Full video uploading to channel. Experience a live 1-on-1 walkthrough tailored to your shop.
                  </p>
                  <div className="mt-4 space-y-2">
                    {(demo.websiteUrl || demo.liveDemoUrl) && (
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-tech text-navy-950 font-semibold hover:bg-tech/90 shadow-lg shadow-tech/20"
                      >
                        <a
                          href={demo.websiteUrl || demo.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="mr-1.5 h-4 w-4" />
                          Visit Official Website ↗
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      size="sm"
                      className={`w-full font-semibold shadow-lg ${
                        demo.websiteUrl || demo.liveDemoUrl
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-tech text-navy-950 hover:bg-tech/90 shadow-tech/20"
                      }`}
                    >
                      <a href={waLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-1.5 h-4 w-4 text-[#128C7E]" />
                        Request Instant 1-on-1 Demo
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                      onClick={() => {
                        const el = document.getElementById("demo-consultation-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                        else onOpenConsultation?.();
                      }}
                    >
                      <Calendar className="mr-1.5 h-4 w-4 text-tech" />
                      Book Free Valley Site Visit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Bar inside mockup */}
              <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  Verified for Nepal Tax FY 2082/83 &amp; PAN/VAT
                </span>
                <span className="hidden sm:inline">
                  📍 Koteshwor-32, Kathmandu · Setup &amp; Training Included
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Under-Player Interactive Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="group font-medium shadow-md transition-all hover:scale-[1.02]"
            onClick={() => {
              const el = document.getElementById("demo-consultation-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else onOpenConsultation?.();
            }}
          >
            <Calendar className="mr-1.5 h-4 w-4 text-white" />
            Book Free Consultation
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-green-600/30 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-300"
          >
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-1.5 h-4 w-4 text-[#25D366]" />
              WhatsApp Us
            </a>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAskAI}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-tech" />
            Ask Prixna AI
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(demo.websiteUrl || demo.liveDemoUrl) && (
            <Button
              asChild
              variant="default"
              size="sm"
              className="bg-tech text-navy-950 hover:bg-tech/90 font-semibold shadow-sm"
            >
              <a
                href={demo.websiteUrl || demo.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="mr-1.5 h-3.5 w-3.5" />
                Visit Product Website ↗
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="border-border text-xs"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                Link Copied
              </>
            ) : (
              <>
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Share Demo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Video Chapters / Workflow Breakdown */}
      {demo.keyWorkflows && demo.keyWorkflows.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Key Walkthrough Chapters (What you see in this demo)
            </h4>
            <span className="text-xs text-muted-foreground">
              Total runtime: {demo.duration}
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {demo.keyWorkflows.map((step, idx) => {
              const active = activeWorkflowTab === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveWorkflowTab(idx)}
                  className={`group relative flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-primary">
                      ⏱ {step.time}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                      Step {idx + 1}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
