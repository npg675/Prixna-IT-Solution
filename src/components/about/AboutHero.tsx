"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Building2, Users, Target, Lightbulb, Award, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function AboutHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-navy-950 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      <motion.div
        className="relative container-custom py-20 lg:py-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
            About Prixna IT Solution
          </span>
          <h1 className="text-display-xl lg:text-display-lg text-foreground font-display leading-[1.1] mb-6">
            Your Trusted Business Technology Partner in Kathmandu
          </h1>
          <p className="text-muted-foreground text-body-lg lg:text-body-md max-w-2xl mx-auto mb-10 leading-relaxed">
            We combine software, hardware, infrastructure, automation, and ongoing support into complete technology solutions for businesses across Nepal. One partner. One phone number. One integrated approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="white" size="lg">
              <a href="/contact">Start a Conversation</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 text-foreground hover:bg-white/10">
              <a href="/solutions">Explore Our Solutions</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}