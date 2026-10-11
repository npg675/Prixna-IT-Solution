"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, FileText, Shield, BarChart3, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const resources = [
  {
    href: "/insights/choosing-billing-software-nepal",
    category: "Buying Guide",
    title: "How to Choose Billing Software for Your Shop in Nepal",
    description: "VAT/PAN realities, must-have features and the demo questions that reveal the truth.",
    icon: FileText,
    readTime: "8 min read",
  },
  {
    href: "/insights/cctv-cameras-how-many",
    category: "Security",
    title: "CCTV for Shops: How Many Cameras Do You Really Need?",
    description: "Coverage planning, storage math and installation mistakes to avoid.",
    icon: Shield,
    readTime: "6 min read",
  },
  {
    href: "/insights/biometric-attendance-guide",
    category: "Productivity",
    title: "Stop Registering Attendance on Paper: A Biometric Starter Guide",
    description: "Costs, payroll linking and what to ask before you buy a device.",
    icon: BarChart3,
    readTime: "7 min read",
  },
];

export function ResourcesPreview() {
  return (
    <section className="section bg-background" id="resources">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Learn & Decide Better
          </span>
          <h2 className="text-display-md text-foreground mb-4">Guides from the Knowledge Center</h2>
          <p className="text-muted-foreground text-body-lg">
            Practical, Nepal-focused advice on business software, security and hardware.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {resources.map((resource, index) => (
            <motion.article
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full group hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {resource.readTime}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <resource.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-headline-sm text-foreground mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-body-sm mb-4 flex-1">{resource.description}</p>
                  <Link
                    href={resource.href}
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
          className="text-center"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/insights">Visit the Knowledge Center →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}