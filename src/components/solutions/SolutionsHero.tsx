"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Monitor, Code, Cpu, Shield, Wifi, Wrench, Zap, Megaphone } from "lucide-react";

const solutions = [
  {
    href: "/solutions/business-software-saas",
    icon: Monitor,
    title: "Business Software & SaaS",
    description: "Billing, inventory, ERP, CRM and JigriTools products that simplify daily operations.",
    category: "Software",
  },
  {
    href: "/solutions/custom-development",
    icon: Code,
    title: "Custom Software & Websites",
    description: "Websites, web apps and tailored software built around your workflow.",
    category: "Software",
  },
  {
    href: "/solutions/hardware-infrastructure",
    icon: Cpu,
    title: "Hardware & IT Equipment",
    description: "Computers, laptops, printers, scanners, servers and genuine accessories.",
    category: "Hardware",
  },
  {
    href: "/solutions/cctv-security",
    icon: Shield,
    title: "CCTV & Security Systems",
    description: "Camera supply, professional installation and after-support across the Valley.",
    category: "Security",
  },
  {
    href: "/solutions/biometric-access",
    icon: Shield,
    title: "Biometric & Access Control",
    description: "Fingerprint attendance and door access with software setup.",
    category: "Security",
  },
  {
    href: "/solutions/networking-servers",
    icon: Wifi,
    title: "Networking & Infrastructure",
    description: "Office Wi-Fi, LAN, and server installation done right the first time.",
    category: "Infrastructure",
  },
  {
    href: "/solutions/it-support-maintenance",
    icon: Wrench,
    title: "IT Support & Maintenance",
    description: "Hardware repair, software troubleshooting and annual care plans.",
    category: "Support",
  },
  {
    href: "/solutions/digital-marketing-ai",
    icon: Megaphone,
    title: "Digital Marketing & AI Automation",
    description: "Practical marketing, design and automation that bring enquiries.",
    category: "Digital",
  },
];

export function SolutionsHero() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-navy-950 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      <motion.div
        className="relative container-custom py-20 lg:py-32 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
          Our Solutions
        </span>
        <h1 className="text-display-xl lg:text-display-lg text-foreground font-display leading-[1.1] mb-6">
          Complete Solutions for Every Business Need
        </h1>
        <p className="text-muted-foreground text-body-lg lg:text-body-md max-w-2xl mx-auto leading-relaxed">
          Eight integrated solution categories — software, hardware, security, infrastructure, and support — designed to work together as one system.
        </p>
      </motion.div>
    </section>
  );
}