"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Puzzle, Cpu, Shield, Zap, Users, Infinity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const approachItems = [
  {
    icon: Puzzle,
    title: "Integrated Thinking",
    description: "We don't see software, hardware, and infrastructure as separate silos. Every solution we design considers how all pieces work together — from the ERP on your server to the CCTV camera at your gate.",
  },
  {
    icon: Cpu,
    title: "Software + Hardware Unity",
    description: "Most vendors do one or the other. We do both. That means your billing software talks to your barcode scanner, your attendance system integrates with payroll, and your network supports it all reliably.",
  },
  {
    icon: Shield,
    title: "Security by Design",
    description: "Data protection, access control, and business continuity aren't add-ons — they're built into every system we deliver. From firewall rules to automated backups, we think about risk so you don't have to.",
  },
  {
    icon: Zap,
    title: "Automation-First Mindset",
    description: "Manual processes are error-prone and don't scale. We identify automation opportunities in every engagement — from invoice generation to attendance sync — freeing your team for higher-value work.",
  },
  {
    icon: Users,
    title: "People-Centric Implementation",
    description: "Technology fails when people don't use it. We invest in training, documentation, and change management so your team actually adopts the new systems. Support continues long after go-live.",
  },
  {
    icon: Infinity,
    title: "Long-Term Partnership",
    description: "We're not a project shop. We're here for the journey — AMC support, system upgrades, new module additions, and strategic technology planning as your business grows.",
  },
];

export function OurApproach() {
  return (
    <section className="section bg-muted dark:bg-background" id="approach">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Our Approach
          </span>
          <h2 className="text-display-md text-foreground mb-4">How We Think About Technology</h2>
          <p className="text-muted-foreground text-body-lg">
            Six principles that shape every engagement — from a single laptop repair to a full ERP rollout.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approachItems.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6 lg:p-8 h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <item.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-headline-md text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-body-md">{item.description}</p>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}