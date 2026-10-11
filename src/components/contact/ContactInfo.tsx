"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, MessageCircle, Clock, Globe, Facebook, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

const methodCards = [
  {
    icon: Phone,
    tile: "bg-gradient-to-br from-royal-600 to-royal-500 shadow-[0_8px_20px_-6px_rgba(53,99,255,0.55)]",
    title: "Call Us",
    href: getTelUrl("+9779813714582"),
    external: false,
    action: "+977 9813714582",
    note: "Sun–Fri, 9:30 AM – 6:30 PM",
  },
  {
    icon: MessageCircle,
    tile: "bg-gradient-to-br from-[#25D366] to-[#1DA851] shadow-[0_8px_20px_-6px_rgba(37,211,102,0.55)]",
    title: "WhatsApp",
    href: getWhatsAppUrl("9779813714582", "Hello Prixna IT Solution, I need a free consultation."),
    external: true,
    action: "Chat Now",
    note: "Instant response in business hours",
  },
  {
    icon: Mail,
    tile: "bg-gradient-to-br from-tech-500 to-royal-500 shadow-[0_8px_20px_-6px_rgba(34,211,238,0.5)]",
    title: "Email Us",
    href: "mailto:info@prixnaitsolution.com.np",
    external: false,
    action: "info@prixnaitsolution.com.np",
    note: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    tile: "bg-gradient-to-br from-navy-800 to-royal-700 shadow-[0_8px_20px_-6px_rgba(16,27,53,0.5)]",
    title: "Visit Us",
    href: "https://maps.google.com/?cid=5858322710047837393",
    external: true,
    action: "Koteshwor-32, Kathmandu",
    note: "Open in Google Maps",
  },
];

const hours = [
  { day: "Sunday – Friday", hours: "9:30 AM – 6:30 PM", open: true },
  { day: "Saturday", hours: "Closed", open: false },
  { day: "Public Holidays", hours: "Closed (or by appointment)", open: false },
];

const socials = [
  {
    icon: Facebook,
    tile: "bg-[#1877F2]/10 text-[#1877F2]",
    name: "Facebook",
    handle: "/prixnaitsolution",
    href: "https://www.facebook.com/prixnaitsolution",
  },
  {
    icon: Globe,
    tile: "bg-royal-600/10 text-royal-600 dark:text-royal-300",
    name: "JigriTools",
    handle: "jigritools.com",
    href: "https://jigritools.com/",
  },
];

export function ContactInfo() {
  return (
    <section className="section bg-background">
      <div className="container-custom">
        {/* Contact method cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {methodCards.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              target={c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.2, 0, 0, 1] }}
              className="group relative overflow-hidden rounded-xl border bg-card p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-premium-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-royal-600 via-royal-400 to-tech transition-transform duration-500 group-hover:scale-x-100"
              />
              <span className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3", c.tile)}>
                <c.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="block font-display text-[17px] font-bold text-foreground">{c.title}</span>
              <span className="mt-1.5 block break-all text-sm font-semibold text-primary">{c.action}</span>
              <span className="mt-1 flex items-center justify-center gap-1 text-[13px] text-muted-foreground">
                {c.note}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
              </span>
            </motion.a>
          ))}
        </div>

        {/* Hours + social */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden hover:translate-y-0">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-6 py-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-royal-600/10">
                    <Clock className="h-5 w-5 text-royal-600 dark:text-royal-300" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">Business Hours</h3>
                </div>
                <ul className="divide-y divide-border">
                  {hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors duration-200 hover:bg-muted/60"
                    >
                      <span className="flex items-center gap-2.5 font-medium text-foreground">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "relative flex h-2.5 w-2.5",
                            h.open ? "[&>span]:bg-green-500" : "[&>span]:bg-muted-foreground/50"
                          )}
                        >
                          {h.open && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                          )}
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" />
                        </span>
                        {h.day}
                      </span>
                      <span className={cn("text-sm", h.open ? "font-semibold text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                        {h.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="mb-4 font-display text-lg font-bold text-foreground">Connect With Us</h3>
            <div className="space-y-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 rounded-xl border bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", s.tile)}>
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">{s.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">{s.handle}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Privacy notice — premium navy panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative mt-12 overflow-hidden rounded-2xl bg-navy-950 p-8 text-center shadow-premium-lg lg:p-10"
        >
          <div className="absolute inset-0 bg-grid-navy opacity-70" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-royal-600 via-tech to-royal-600" aria-hidden="true" />
          <div className="relative">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <ShieldCheck className="h-6 w-6 text-tech" aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl font-bold text-white">Privacy Notice</h3>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
              We collect only the information you voluntarily provide through this form to respond to your enquiry. We never
              share your details with third parties, sell your data, or send unsolicited marketing. Your information is stored
              securely and used solely for contacting you about your technology requirements. By submitting this form, you consent
              to being contacted by phone, WhatsApp, email, or SMS regarding your enquiry.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
