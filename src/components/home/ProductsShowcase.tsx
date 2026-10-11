"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Box, Users, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const products = [
  {
    href: "/products/jigritools",
    badge: "FREE · LIVE NOW",
    badgeVariant: "success" as const,
    icon: Box,
    title: "JigriTools — Free Online Utilities",
    description: "30+ free tools: BS↔AD date converter, EMI & tax calculators, Unicode converter, CV maker, QR generator, PDF tools and more. Runs privately in the browser.",
    features: [
      "No sign-up needed",
      "Nepal-ready (BS calendar, lakh/crore, FY 2082/83 tax)",
      "New tools added from user feedback",
    ],
    ctaText: "Explore JigriTools",
    ctaVariant: "default" as const,
    externalLink: "https://jigritools.com/",
  },
  {
    href: "/products/jigri-erp",
    badge: "REQUEST DEMO · COMING SOON",
    badgeVariant: "secondary" as const,
    icon: Box,
    title: "Jigri ERP — Business Management",
    description: "Accounting, billing, inventory and reporting in one place for retail, wholesale and distribution businesses. Availability and pricing on request.",
    features: [
      "Billing & inventory workflows",
      "Business reports for decision-making",
      "Setup, data migration & training",
    ],
    ctaText: "Request a Demo",
    ctaVariant: "outline" as const,
  },
  {
    href: "/products/jigri-crm",
    badge: "REQUEST DEMO · COMING SOON",
    badgeVariant: "secondary" as const,
    icon: Users,
    title: "Jigri CRM — Customer Management",
    description: "Track customers, follow-ups and sales pipelines. Talk to us for early access.",
    features: [
      "Lead & follow-up tracking",
      "Sales pipeline visualization",
      "Customer communication history",
    ],
    ctaText: "Request Early Access",
    ctaVariant: "outline" as const,
  },
  {
    href: "/products/jigri-ehajiri",
    badge: "REQUEST DEMO · COMING SOON",
    badgeVariant: "secondary" as const,
    icon: Calendar,
    title: "Jigri eHajiri — Digital Attendance",
    description: "Manage staff attendance and leave digitally. Works with biometric devices we install.",
    features: [
      "Digital attendance & leave records",
      "Biometric device integration",
      "Payroll-ready reports",
    ],
    ctaText: "Request Early Access",
    ctaVariant: "outline" as const,
  },
];

export function ProductsShowcase() {
  return (
    <section className="section bg-muted dark:bg-background" id="products">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Featured Software Platforms
          </span>
          <h2 className="text-display-md text-foreground mb-4">Meet the Jigri Product Family</h2>
          <p className="text-muted-foreground text-body-lg">
            Built and supported by our team. Start free where a free plan exists — upgrade only when it earns its keep.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.article
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <product.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <Badge variant={product.badgeVariant} className="text-xs whitespace-nowrap flex-shrink-0">
                      {product.badge}
                    </Badge>
                  </div>
                  <h3 className="text-headline-sm text-foreground mb-2">{product.title}</h3>
                  <p className="text-muted-foreground text-body-sm mb-4 flex-1">{product.description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant={product.ctaVariant} className="w-full">
                      <Link href={product.href}>{product.ctaText}</Link>
                    </Button>
                    {product.externalLink && (
                      <Button asChild variant="ghost" className="w-full justify-center text-sm">
                        <a href={product.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          Open live site
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}