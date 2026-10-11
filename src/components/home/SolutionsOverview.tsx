"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Monitor, Code, Cpu, Shield, Wifi, Wrench, Zap, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const solutions = [
  {
    href: "/solutions/business-software-saas",
    icon: Monitor,
    title: "Business Software & SaaS",
    description: "Billing, inventory, ERP, CRM and JigriTools products that simplify daily operations.",
    features: ["Jigri ERP & CRM", "Restaurant & Hospitality", "Accounting & Inventory", "Free JigriTools"],
  },
  {
    href: "/solutions/custom-development",
    icon: Code,
    title: "Custom Software & Websites",
    description: "Websites, web apps and tailored software built around your workflow.",
    features: ["Web Applications", "Mobile Apps", "API Integrations", "Legacy Modernization"],
  },
  {
    href: "/solutions/hardware-infrastructure",
    icon: Cpu,
    title: "Hardware & IT Equipment",
    description: "Computers, laptops, printers, scanners, servers and genuine accessories.",
    features: ["Desktops & Laptops", "Printers & Scanners", "Servers & Workstations", "Genuine Accessories"],
  },
  {
    href: "/solutions/cctv-security",
    icon: Shield,
    title: "CCTV & Security Systems",
    description: "Camera supply, professional installation and after-support across the Valley.",
    features: ["IP & Analog Cameras", "DVR/NVR Systems", "Remote Monitoring", "Installation & Support"],
  },
  {
    href: "/solutions/biometric-access",
    icon: Shield,
    title: "Biometric & Access Control",
    description: "Fingerprint attendance and door access with software setup.",
    features: ["Attendance Devices", "Door Access Control", "Payroll Integration", "Staff Training"],
  },
  {
    href: "/solutions/networking-servers",
    icon: Wifi,
    title: "Networking & Infrastructure",
    description: "Office Wi-Fi, LAN, and server installation done right the first time.",
    features: ["Structured Cabling", "Managed Wi-Fi", "Server Setup", "VPN & Firewall"],
  },
  {
    href: "/solutions/it-support-maintenance",
    icon: Wrench,
    title: "Repair & Maintenance",
    description: "Hardware repair, software troubleshooting and annual care plans.",
    features: ["Hardware Repair", "Software Troubleshooting", "AMC Plans", "On-site Support"],
  },
  {
    href: "/solutions/digital-marketing-ai",
    icon: Megaphone,
    title: "Digital Marketing & AI Automation",
    description: "Practical marketing, design and automation that bring enquiries.",
    features: ["Social Media", "SEO & Content", "AI Workflow Automation", "Lead Generation"],
  },
];

export function SolutionsOverview() {
  return (
    <section className="section bg-background" id="solutions">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Start from your need
          </span>
          <h2 className="text-display-md text-foreground mb-4">Three clear pathways for your business</h2>
          <p className="text-muted-foreground text-body-lg">
            Tell us which situation sounds like you — we'll recommend a suitable, honestly-priced setup.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution, index) => (
            <motion.article
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full group hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <solution.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-headline-sm text-foreground mb-2">{solution.title}</h3>
                  <p className="text-muted-foreground text-body-sm mb-4 flex-1">{solution.description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {solution.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={solution.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary transition-colors group"
                  >
                    Explore {solution.title.split(" & ")[0]} →
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
            <Link href="/solutions">View All Solutions →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}