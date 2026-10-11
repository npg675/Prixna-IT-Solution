"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Server, Monitor, Code, Wifi, Shield, Truck, Headphones, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const capabilities = [
  {
    category: "Software & Applications",
    icon: Monitor,
    items: [
      "ERP / CRM Implementation (Jigri ERP, Jigri CRM)",
      "Custom Web & Mobile Application Development",
      "Billing, Inventory & Accounting Software",
      "Restaurant / Hotel Management Systems",
      "Attendance & Payroll Systems (Jigri eHajiri)",
      "Free Utilities Platform (JigriTools - 30+ tools)",
      "API Integrations & System Connectivity",
      "Legacy System Modernization",
    ],
  },
  {
    category: "Hardware & Infrastructure",
    icon: Server,
    items: [
      "Desktops, Laptops & Workstations Supply",
      "Servers & Storage Solutions",
      "Printers, Scanners & Peripherals",
      "Networking Equipment (Switches, Routers, APs)",
      "Structured Cabling (CAT6, Fiber Optics)",
      "Power Backup (UPS, Router UPS with PoE)",
      "Rack & Cabinet Installation",
    ],
  },
  {
    category: "Security & Surveillance",
    icon: Shield,
    items: [
      "CCTV Camera Supply & Installation (IP/Analog)",
      "DVR / NVR Configuration & Remote Access",
      "Biometric Attendance Devices",
      "Access Control Systems (Door, Turnstile)",
      "Fire Alarm & Safety Systems",
      "Network Security & Firewall Setup",
    ],
  },
  {
    category: "Networking & Connectivity",
    icon: Wifi,
    items: [
      "Office LAN Design & Implementation",
      "Managed Wi-Fi (Controller-based, Mesh)",
      "VPN & Remote Access Solutions",
      "Server Room Setup & Cooling",
      "ISP Liaison & Leased Line Management",
      "Network Monitoring & Optimization",
    ],
  },
  {
    category: "Support & Maintenance",
    icon: Wrench,
    items: [
      "Annual Maintenance Contracts (AMC)",
      "On-site & Remote Technical Support",
      "Hardware Repair & Component Replacement",
      "Software Troubleshooting & Updates",
      "Data Backup & Disaster Recovery",
      "System Health Monitoring",
      "Priority Response SLAs",
    ],
  },
  {
    category: "Digital Services",
    icon: Code,
    items: [
      "Website Design & Development",
      "E-commerce Platform Setup",
      "Search Engine Optimization (SEO)",
      "Social Media Management",
      "Google Workspace / Microsoft 365 Setup",
      "AI Workflow Automation",
      "Digital Marketing Campaigns",
    ],
  },
];

export function Capabilities() {
  return (
    <section className="section bg-background" id="capabilities">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            What We Do
          </span>
          <h2 className="text-display-md text-foreground mb-4">Complete Capabilities Under One Roof</h2>
          <p className="text-muted-foreground text-body-lg">
            From the server room to the shop floor — software, hardware, security, networking, and support delivered by one integrated team.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 lg:p-8 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <cap.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-headline-md text-foreground">{cap.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {cap.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-body-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}