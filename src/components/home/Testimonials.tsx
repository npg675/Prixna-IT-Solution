"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, StarHalf, Quote, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "Good service for computer repair and CCTV installation. Work was done on time as promised.",
    rating: 5,
    source: "Google Maps",
    sourceUrl: "https://maps.google.com/?cid=5858322710047837393",
  },
  {
    quote: "Professional team, fair pricing, and they actually follow up after installation. Rare to find in Kathmandu.",
    rating: 5,
    source: "Google Maps",
    sourceUrl: "https://maps.google.com/?cid=5858322710047837393",
  },
  {
    quote: "Installed our office network and biometric attendance. Clean cabling, proper configuration, and staff training included.",
    rating: 5,
    source: "Google Maps",
    sourceUrl: "https://maps.google.com/?cid=5858322710047837393",
  },
];

export function Testimonials() {
  return (
    <section className="section bg-background" id="testimonials">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Customers & Proof
          </span>
          <h2 className="text-display-md text-foreground mb-4">What our clients say</h2>
          <p className="text-muted-foreground text-body-lg">
            Verified public reviews only. We never publish invented testimonials — new client-approved stories will appear here as they arrive.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 dark:text-muted-foreground"
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-muted-foreground/30 dark:text-muted-foreground mb-4" aria-hidden="true" />
                  <p className="text-foreground text-body-md mb-4 flex-1">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <a
                      href={testimonial.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline"
                    >
                      Verified on {testimonial.source}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="col-span-2">
            <Card className="h-full border-border">
              <CardContent className="p-6 flex flex-col h-full justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="text-3xl font-bold text-foreground">4.5</span>
                    <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <Star className="h-8 w-8 text-muted-foreground/30 dark:text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-muted-foreground text-body-md">
                    Overall rating <strong>4.5 / 5</strong> across 8 public Google reviews for our Koteshwor location.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full bg-muted dark:glass-card border-border">
              <CardContent className="p-6 flex flex-col h-full justify-center">
                <div className="text-center">
                  <h3 className="text-headline-sm text-foreground mb-2">Are you our customer?</h3>
                  <p className="text-muted-foreground text-body-sm mb-4">
                    Your honest review helps other Nepali businesses choose with confidence.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href="https://search.google.com/local/writereview?placeid=ChIJLeSgRjcZ6zkR0UwBUHfxTFE"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Write a Google Review →
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-body-sm mb-4">
            We publish only real, client-approved case studies with photographs.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/projects">View Case Study Format →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}