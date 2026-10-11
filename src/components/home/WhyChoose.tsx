"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Users, Lightbulb, Truck, Headphones, Shield, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const whyChoose = [
  {
    icon: Users,
    title: "Simpler Coordination",
    description: "One phone number for software questions, hardware supply, installation and breakdowns. No more juggling multiple vendors.",
  },
  {
    icon: Lightbulb,
    title: "Suitable Recommendations",
    description: "We suggest what fits your size and budget — including free options like JigriTools where they do the job. No overselling.",
  },
  {
    icon: Truck,
    title: "Implementation Assistance",
    description: "Installation, configuration, data entry help and staff training, so the system is actually used — not just installed.",
  },
  {
    icon: Headphones,
    title: "Ongoing Support",
    description: "Phone, WhatsApp and on-site help under clear agreed terms — no vanishing after the sale. We're here for the long term.",
  },
  {
    icon: Shield,
    title: "Local Presence",
    description: "Real shop & service center in Koteshwor-32. Walk in, see our setup, meet the team. Kathmandu-based since day one.",
  },
  {
    icon: Award,
    title: "Proven Track Record",
    description: "4.5★ Google rating, 8 verified reviews, and real client projects across retail, hospitality, education, and healthcare.",
  },
];

export function WhyChoose() {
  return (
    <section className="section bg-background text-foreground" id="why-choose">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Why Prixna
          </span>
          <h2 className="text-display-md text-foreground mb-4">One partner for the whole system</h2>
          <p className="text-muted-foreground text-body-lg">
            Buying software from one shop, hardware from another, and calling a third person when things break is expensive. Here's the calmer way.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChoose.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full glass-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-headline-sm text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-body-sm">{item.description}</p>
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
          <Button asChild variant="white" size="lg">
            <Link href="/about">More About Our Company →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}