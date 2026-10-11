"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Wrench, Wrench as Tools, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const trustItems = [
  {
    icon: MapPin,
    title: "Real Shop & Service Center",
    description: "Visit us at Koteshwor-32, Kathmandu",
  },
  {
    icon: Star,
    title: "Google Rating 4.5 / 5",
    description: "Based on 8 public Google reviews",
  },
  {
    icon: Wrench,
    title: "Software + Hardware, One Team",
    description: "Supply, install, integrate & support",
  },
  {
    icon: Zap,
    title: "Makers of JigriTools",
    description: "30+ free online utilities for Nepal",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-muted dark:bg-background py-12">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 lg:p-6 hover:bg-background hover:border-border rounded-xl transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-body-md">{item.title}</h3>
                <p className="text-muted-foreground text-body-sm mt-1">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}