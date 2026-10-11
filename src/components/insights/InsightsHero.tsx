"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Shield, BarChart3, Calendar, Search, Lightbulb } from "lucide-react";

export function InsightsHero() {
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
          Knowledge Center
        </span>
        <h1 className="text-display-xl lg:text-display-lg text-foreground font-display leading-[1.1] mb-6">
          Learn & Decide Better
        </h1>
        <p className="text-muted-foreground text-body-lg lg:text-body-md max-w-2xl mx-auto leading-relaxed">
          Practical, Nepal-focused guides on business software, automation, IT infrastructure, cybersecurity, digital transformation, and industry-specific technology.
        </p>
      </motion.div>
    </section>
  );
}