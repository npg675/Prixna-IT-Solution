"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Store, Utensils, GraduationCap, Pill, Building2, Factory, Home, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const industries = [
  {
    href: "/industries/retail-wholesale",
    icon: Store,
    title: "Retail & Wholesale",
    description: "Billing, stock control, barcode & CCTV that cut shrinkage.",
    challenges: ["Slow billing at rush hour", "Stock leakage", "No daily profit picture"],
    setup: ["Billing + inventory software", "Barcode printer & scanner", "Billing PC with backup", "Shop CCTV"],
  },
  {
    href: "/industries/restaurants-hospitality",
    icon: Utensils,
    title: "Restaurants & Hotels",
    description: "KOT billing, table management, kitchen printers & Wi-Fi for guests.",
    challenges: ["Wrong KOTs", "Table mix-ups", "Food-cost blindness"],
    setup: ["KOT billing", "Kitchen printer", "Table management", "Guest Wi-Fi", "CCTV for cash counter"],
  },
  {
    href: "/industries/schools-education",
    icon: GraduationCap,
    title: "Schools & Education",
    description: "Computer labs, attendance systems, networks & AMC support.",
    challenges: ["Lab maintenance", "Staff attendance records", "Unreliable internet in class"],
    setup: ["Computer lab supply & care plan", "Biometric attendance", "Campus Wi-Fi", "Projector setup"],
  },
  {
    href: "/industries/pharmacy-healthcare",
    icon: Pill,
    title: "Pharmacy & Healthcare",
    description: "Batch/expiry tracking, billing accuracy & reliable backups.",
    challenges: ["Batch/expiry mistakes", "Billing accuracy", "Prescription rush"],
    setup: ["Pharmacy billing with stock alerts", "Reliable billing PC + power backup", "Data backup routine"],
  },
  {
    href: "/industries/offices-corporate",
    icon: Building2,
    title: "Offices & Corporate",
    description: "Structured LAN + managed Wi-Fi, server/backup setup, laptops & printers, support terms.",
    challenges: ["Data safety", "Network downtime", "Scattered vendors"],
    setup: ["Structured LAN + managed Wi-Fi", "Server/backup setup", "Laptops & printers", "Support terms"],
  },
  {
    href: "/industries/workshops-manufacturing",
    icon: Factory,
    title: "Workshops & Manufacturing",
    description: "Ruggedized setup advice, job/invoice tracking software, CCTV for premises, AMC-style support.",
    challenges: ["Job tracking", "Dusty environments killing PCs", "No IT support on call"],
    setup: ["Ruggedized setup advice", "Job/invoice tracking software", "CCTV for premises", "AMC-style support"],
  },
  {
    href: "/industries/home-professionals",
    icon: Home,
    title: "Home Users & Professionals",
    description: "Laptop/desktop repair & upgrades, genuine accessories, home Wi-Fi fix, free JigriTools.",
    challenges: ["Slow laptops", "Data loss", "Home Wi-Fi dead zones"],
    setup: ["Laptop/desktop repair & upgrades", "Genuine accessories", "Home Wi-Fi fix", "Free JigriTools"],
  },
  {
    href: "/industries/sme-enterprise",
    icon: Briefcase,
    title: "SMEs & Growing Enterprises",
    description: "Integrated ERP, CRM, attendance, networking and support scaled to your growth.",
    challenges: ["Scaling systems", "Multiple disconnected tools", "Compliance & reporting"],
    setup: ["Integrated ERP/CRM", "Attendance & payroll", "Network infrastructure", "Managed IT support"],
  },
];

export function IndustriesOverview() {
  return (
    <section className="section bg-background" id="industries">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Solutions by Industry
          </span>
          <h2 className="text-display-md text-foreground mb-4">Technology matched to how you work</h2>
          <p className="text-muted-foreground text-body-lg">
            Common challenges in your trade — and the software, hardware and services that solve them.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <motion.article
              key={industry.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full group hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <industry.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-headline-sm text-foreground mb-2">{industry.title}</h3>
                  <p className="text-muted-foreground text-body-sm mb-4 flex-1">{industry.description}</p>
                  <Link
                    href={industry.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary transition-colors group mt-auto"
                  >
                    View solutions →
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/industries">See All Industries & Solution Maps →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}