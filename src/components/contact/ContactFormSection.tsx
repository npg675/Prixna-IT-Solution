"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const serviceOptions = [
  { value: "Free Business Consultation", label: "Free Business Consultation", description: "General discussion about your technology needs" },
  { value: "Business Software / SaaS Demo", label: "Business Software / SaaS Demo", description: "See Jigri ERP, CRM, or other software in action" },
  { value: "JigriTools Enquiry", label: "JigriTools Enquiry", description: "Feedback, tool requests, or custom utility development" },
  { value: "Custom Software / Website Development", label: "Custom Software / Website Development", description: "Web apps, mobile apps, API integrations" },
  { value: "Accounting / ERP / CRM", label: "Accounting / ERP / CRM", description: "Jigri ERP or third-party implementation" },
  { value: "Restaurant / Hospitality Solution", label: "Restaurant / Hospitality Solution", description: "KOT billing, table management, kitchen printers" },
  { value: "Attendance & Payroll", label: "Attendance & Payroll", description: "Jigri eHajiri or biometric device integration" },
  { value: "Computers / Laptops / Equipment", label: "Computers / Laptops / Equipment", description: "Hardware procurement and setup" },
  { value: "CCTV & Security Installation", label: "CCTV & Security Installation", description: "Camera supply, installation, and support" },
  { value: "Biometric / Access Control", label: "Biometric / Access Control", description: "Attendance devices and door access systems" },
  { value: "Networking / Servers", label: "Networking / Servers", description: "LAN, Wi-Fi, server setup, VPN, firewall" },
  { value: "Repair & Maintenance", label: "Repair & Maintenance", description: "Hardware repair, AMC plans, troubleshooting" },
  { value: "Digital Marketing / AI Automation", label: "Digital Marketing / AI Automation", description: "SEO, social media, workflow automation" },
  { value: "Bulk / Dealer Enquiry", label: "Bulk / Dealer Enquiry", description: "Volume pricing for resellers and corporates" },
  { value: "Other", label: "Other", description: "Any other technology requirement" },
];

export function ContactFormSection() {
  return (
    <section className="section bg-muted dark:bg-background" id="consultation-form">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              Consultation Request
            </span>
            <h2 className="text-display-md text-foreground mb-4">Book Your Free Consultation</h2>
            <p className="text-muted-foreground text-body-lg">
              Tell us about your requirements. We'll call you back within business hours to discuss and provide a transparent NPR quotation.
            </p>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-px rounded-2xl bg-gradient-to-br from-royal-600/40 via-tech/25 to-royal-600/40 blur-[2px]" />
            <Card className="relative border-primary/25 shadow-premium-lg hover:translate-y-0">
              <CardContent className="p-6 lg:p-10">
                <ConsultationForm
                  title=""
                  subtitle=""
                  service=""
                  formType="contact-page"
                  showBooking
                />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-4 text-center md:grid-cols-3">
            {[
              { icon: Phone, tile: "bg-royal-600/10 text-royal-600 dark:text-royal-300", title: "Prefer to Call?", desc: "+977 9813714582 (Sun–Fri, 9:30–18:30)" },
              { icon: MessageCircle, tile: "bg-[#25D366]/10 text-[#1DA851]", title: "WhatsApp Us", desc: "Instant chat for quick questions" },
              { icon: Mail, tile: "bg-tech-500/10 text-tech-500", title: "Email Us", desc: "info@prixnaitsolution.com.np" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: 0.15 + index * 0.1, ease: [0.2, 0, 0, 1] }}
                className="group rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-premium"
              >
                <span className={cn("mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", item.tile)}>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}