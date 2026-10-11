"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, FileText, Shield, BarChart3, Calendar, Search, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const insights = [
  {
    href: "/insights/choosing-billing-software-nepal",
    category: "Buying Guide",
    title: "How to Choose Billing Software for Your Shop in Nepal",
    description: "VAT/PAN realities, must-have features and the demo questions that reveal the truth.",
    icon: FileText,
    readTime: "8 min read",
    publishDate: "2024-01-15",
  },
  {
    href: "/insights/cctv-cameras-how-many",
    category: "Security",
    title: "CCTV for Shops: How Many Cameras Do You Really Need?",
    description: "Coverage planning, storage math and installation mistakes to avoid.",
    icon: Shield,
    readTime: "6 min read",
    publishDate: "2024-01-20",
  },
  {
    href: "/insights/biometric-attendance-guide",
    category: "Productivity",
    title: "Stop Registering Attendance on Paper: A Biometric Starter Guide",
    description: "Costs, payroll linking and what to ask before you buy a device.",
    icon: BarChart3,
    readTime: "7 min read",
    publishDate: "2024-01-25",
  },
];

const categories = [
  { name: "All", count: 3 },
  { name: "Business Software", count: 1 },
  { name: "IT Infrastructure", count: 0 },
  { name: "Cybersecurity", count: 0 },
  { name: "Digital Transformation", count: 0 },
  { name: "Industry Technology", count: 1 },
  { name: "Productivity", count: 1 },
];

export function InsightsGrid() {
  return (
    <section className="section bg-background" id="insights">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-display-md text-foreground mb-4">Guides from the Knowledge Center</h2>
          <p className="text-muted-foreground text-body-lg">
            Practical, Nepal-focused advice on business software, security and hardware.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                cat.name === "All"
                  ? "bg-primary text-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-primary/20"
              )}
            >
              {cat.name} <span className="ml-2 text-xs opacity-60">({cat.count})</span>
            </button>
          ))}
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.article
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full group hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {insight.readTime}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <insight.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-headline-sm text-foreground mb-2">{insight.title}</h3>
                  <p className="text-muted-foreground text-body-sm mb-4 flex-1">{insight.description}</p>
                  <Link
                    href={insight.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary transition-colors group mt-auto"
                  >
                    Read guide →
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
          <p className="text-muted-foreground text-body-md mb-4">
            Want more guides? We're publishing new articles weekly on business technology for Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/9779813714582?text=Hello%20Prixna%20IT%20Solution%2C%20I%20have%20a%20topic%20suggestion%20for%20your%20knowledge%20center."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:underline"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.472.099-.174.05-.372-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z"/></svg>
              Suggest a Topic on WhatsApp
            </a>
            <a href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Request a Guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}