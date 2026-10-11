"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ContactHero() {
  return (
    <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-navy-950 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      <motion.div
        className="relative container-custom py-16 lg:py-24 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
          Let's Start a Conversation
        </span>
        <h1 className="text-display-xl lg:text-display-lg text-foreground font-display leading-[1.1] mb-6">
          Ready to Find the Right Technology?
        </h1>
        <p className="text-muted-foreground text-body-lg lg:text-body-md max-w-2xl mx-auto mb-10 leading-relaxed">
          Free consultation · Transparent NPR quotation · Support after installation. Serving Kathmandu Valley and businesses across Nepal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="white" size="xl">
            <a href="#consultation-form">Book a Consultation</a>
          </Button>
          <Button asChild variant="outline" size="xl" className="border-white/30 text-foreground hover:bg-white/10">
            <a href="https://wa.me/9779813714582?text=Hello%20Prixna%20IT%20Solution%2C%20I%20need%20a%20free%20consultation%20for%20my%20business." target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}