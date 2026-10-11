"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageSquare, Search, FileText, Truck, GraduationCap, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Understand Your Requirements",
    description: "A free consultation — call, WhatsApp or site visit. We listen first.",
  },
  {
    number: "02",
    icon: Search,
    title: "Recommend a Suitable Solution",
    description: "Right-sized software, hardware or both — with honest alternatives and clear reasoning.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Transparent Quotation",
    description: "Itemised pricing in NPR. No hidden charges. You approve before we proceed.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Implement, Install & Configure",
    description: "Neat installation, tested before handover. Clean cabling, proper setup.",
  },
  {
    number: "05",
    icon: GraduationCap,
    title: "Training Where Applicable",
    description: "Your staff learns the system with practical guidance. Documentation provided.",
  },
  {
    number: "06",
    icon: Headphones,
    title: "Ongoing Support",
    description: "Help under agreed terms — phone, WhatsApp or on-site. We don't vanish after the sale.",
  },
];

export function ProcessSteps() {
  return (
    <section className="section bg-muted dark:bg-background" id="process">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="sticky top-24"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              How We Work
            </span>
            <h2 className="text-display-md text-foreground mb-4">A simple process, no surprises</h2>
            <p className="text-muted-foreground text-body-lg mb-8">
              You always know what happens next — and what it costs — before we touch your systems.
            </p>
            <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
              <Link href="/contact">Start with Step 1 — It's Free</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <Card className="group hover:shadow-card-hover transition-all duration-300 border-border">
                    <CardContent className="p-6 flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <step.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-primary font-mono text-lg font-bold">{step.number}</span>
                          <h3 className="text-headline-sm text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-body-sm">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}