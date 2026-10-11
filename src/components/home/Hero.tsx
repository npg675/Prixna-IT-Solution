"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Monitor, Cpu, Shield, Wifi, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

const capabilities = [
  { icon: Monitor, title: "Business Software", desc: "ERP, CRM, Billing & JigriTools" },
  { icon: Cpu, title: "Hardware & CCTV", desc: "Computers, cameras, biometric devices" },
  { icon: Shield, title: "Security Systems", desc: "Access control, surveillance, firewalls" },
  { icon: Wifi, title: "Networking", desc: "Office Wi-Fi, LAN, server setup" },
  { icon: Zap, title: "AI Automation", desc: "Digital workflow transformation" },
  { icon: Shield, title: "Support & AMC", desc: "Ongoing maintenance & troubleshooting" },
];

export function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-navy-950 pt-16">
      <div className="absolute inset-0 bg-navy-950" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid-navy" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-royal-600/25 via-navy-950 to-navy-950" aria-hidden="true" />
      <div className="absolute -top-24 right-[8%] h-72 w-72 rounded-full bg-tech/10 blur-3xl" aria-hidden="true" />

      <motion.div
        className="relative container-custom py-20 lg:py-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0, 0, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 text-white text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tech opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tech" />
              </span>
              Now serving businesses across Nepal
            </span>

            <h1 className="text-display-xl lg:text-display-lg text-white font-display leading-[1.1] mb-6">
              Complete Business Technology.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-300 via-royal-200 to-tech">One Trusted Partner.</span>
            </h1>

            <p className="text-white/70 text-body-lg lg:text-body-md max-w-xl mb-8 leading-relaxed">
              We empower businesses with integrated software, hardware, and intelligent technology solutions that simplify operations, improve productivity, and support sustainable growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button asChild size="xl" className="group w-full sm:w-auto">
                <Link href="/contact">
                  Book a Consultation
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="w-full sm:w-auto border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white transition-all duration-300">
                <Link href="/solutions">Explore Our Solutions</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
              <a href={getTelUrl("+9779813714582")} className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +977 9813714582
              </a>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <a href={getWhatsAppUrl("9779813714582")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="h-5 w-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.472.099-.174.05-.372-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z" />
                </svg>
                WhatsApp
              </a>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span>📍 Koteshwor-32, Kathmandu</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0, 0, 1] }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-royal-600/30 to-tech/20 rounded-2xl blur-3xl opacity-50" aria-hidden="true" />
              <div className="relative rounded-2xl border border-white/10 bg-navy-900 p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 rounded border border-white/10 bg-navy-950 px-3 py-1.5 text-center text-white/50 text-xs font-mono">dashboard.prixna.local</div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {capabilities.slice(0, 3).map((cap, i) => (
                      <motion.div
                        key={cap.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                        className="rounded-xl border border-white/10 bg-navy-800 p-4 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:border-tech/40"
                      >
                        <cap.icon className="h-8 w-8 text-tech mx-auto mb-2" aria-hidden="true" />
                        <h4 className="font-semibold text-white text-sm">{cap.title}</h4>
                        <p className="text-white/60 text-xs mt-1">{cap.desc}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-navy-800 p-4">
                    <p className="text-white/60 text-xs mb-3">This week's performance vs. target</p>
                    <div className="flex items-end gap-2 h-24">
                      {[45, 70, 55, 85, 66, 95, 78].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: [0.2, 0, 0, 1] }}
                          className="flex-1 bg-gradient-to-t from-royal-600 to-tech rounded-t transition-all hover:brightness-125"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-center text-white/50 text-xs mt-4">
                  Software · Hardware · CCTV · Biometric · Networking — working as one system
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -bottom-8 -left-8 rounded-2xl border border-white/10 bg-navy-900 p-4 shadow-2xl transition-transform duration-300 hover:-translate-y-2 lg:-left-16"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-royal-600/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-royal-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">30+ Free Utilities</p>
                  <p className="text-white/65 text-sm">JigriTools: BS↔AD, EMI, Tax, Unicode, QR, PDF</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -bottom-8 -right-8 rounded-2xl border border-white/10 bg-navy-900 p-4 shadow-2xl transition-transform duration-300 hover:-translate-y-2 delay-100 lg:-right-16"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">4.5★ Google Rating</p>
                  <p className="text-white/65 text-sm">8 verified reviews · Real shop & service center</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        aria-hidden="true"
      >
        <svg className="h-6 w-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}