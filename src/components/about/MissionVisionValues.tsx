"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Users, Lightbulb, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const missionVisionValues = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To empower businesses in Nepal with integrated technology solutions that simplify operations, improve productivity, and support sustainable growth — delivered with honesty, expertise, and long-term partnership.",
    color: "electric",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "To be the most trusted business technology partner in Nepal — known for combining software, hardware, and intelligent automation into seamless solutions that help local businesses compete globally.",
    color: "electric",
  },
  {
    icon: Heart,
    title: "Our Values",
    items: [
      { title: "Integrity First", desc: "Honest recommendations, transparent pricing, no hidden agendas." },
      { title: "Client Success", desc: "We win when our clients win. Long-term partnerships over quick sales." },
      { title: "Technical Excellence", desc: "Deep expertise across software, hardware, networking, and security." },
      { title: "Local Understanding", desc: "Nepal-specific solutions: BS calendar, VAT/PAN, lakh/crore, Nepali language." },
      { title: "Continuous Learning", desc: "We stay current so you don't have to. New tools, better methods." },
      { title: "Accountability", desc: "We own our work. If something breaks, we fix it — fast." },
    ],
    color: "electric",
  },
];

export function MissionVisionValues() {
  return (
    <section className="section bg-background" id="mission-vision-values">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Foundation
          </span>
          <h2 className="text-display-md text-foreground mb-4">Mission, Vision & Values</h2>
          <p className="text-muted-foreground text-body-lg">
            The principles that guide every decision, recommendation, and interaction.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {missionVisionValues.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 lg:p-8 h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <item.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-headline-md text-foreground mb-4">{item.title}</h3>
                  {item.description && (
                    <p className="text-muted-foreground text-body-md mb-6">{item.description}</p>
                  )}
                  {item.items && (
                    <ul className="space-y-4">
                      {item.items.map((value) => (
                        <li key={value.title} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{value.title}</p>
                            <p className="text-muted-foreground text-sm">{value.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}