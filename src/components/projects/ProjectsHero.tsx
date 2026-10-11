"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ProjectsHero() {
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
          Proof, Not Promises
        </span>
        <h1 className="text-display-xl lg:text-display-lg text-foreground font-display leading-[1.1] mb-6">
          Real Projects. Verified Results.
        </h1>
        <p className="text-muted-foreground text-body-lg lg:text-body-md max-w-2xl mx-auto mb-10 leading-relaxed">
          We publish only real, client-approved projects and verified public reviews. Where a story is still being approved, we say so openly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="white" size="lg">
            <a href="https://maps.google.com/?cid=5858322710047837393" target="_blank" rel="noopener noreferrer">
              ⭐ Read Our Google Reviews
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/30 text-foreground hover:bg-white/10">
            <a href="/contact">Start Your Project</a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}