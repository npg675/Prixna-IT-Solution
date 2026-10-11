"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight, Camera, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const verifiedReviews = [
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

const caseStudies = [
  {
    id: "retail-cctv-billing",
    title: "Retail CCTV + Billing Setup",
    client: "Confidential - Kathmandu Retail Chain",
    status: "Awaiting client photo approval",
    industry: "Retail & Wholesale",
    services: ["CCTV & Security", "Business Software"],
    description: "Multi-location CCTV with centralized monitoring + integrated billing and inventory system.",
  },
  {
    id: "office-network-attendance",
    title: "Office Network & Attendance Rollout",
    client: "Confidential - Corporate Office",
    status: "Awaiting client photo approval",
    industry: "Offices & Corporate",
    services: ["Networking", "Biometric Access"],
    description: "Structured LAN, managed Wi-Fi, server setup, and biometric attendance with payroll integration.",
  },
  {
    id: "restaurant-kot-billing",
    title: "Restaurant KOT Billing Go-Live",
    client: "Confidential - Kathmandu Restaurant",
    status: "Awaiting client photo approval",
    industry: "Restaurants & Hospitality",
    services: ["Business Software", "Hardware", "Networking"],
    description: "KOT billing, kitchen printers, table management, guest Wi-Fi, and CCTV in one integrated deployment.",
  },
];

export function ProjectsGrid() {
  return (
    <section className="section bg-background" id="projects">
      <div className="container-custom">
        {/* Verified Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4 block">
                Verified Reviews
              </span>
              <h2 className="text-display-md text-foreground mb-2">What Clients Say Publicly</h2>
            </div>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJLeSgRjcZ6zkR0UwBUHfxTFE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary"
            >
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              Write a Review
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {verifiedReviews.map((review, index) => (
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
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 dark:text-muted-foreground"
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="text-foreground text-body-md mb-4 flex-1">"{review.quote}"</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <a
                        href={review.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors underline"
                      >
                        Verified on {review.source}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.article>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-2"
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-muted dark:glass-card border-border">
                <CardContent className="p-6 flex flex-col h-full justify-center">
                  <div className="text-center">
                    <h3 className="text-headline-sm text-foreground mb-2">Are You Our Customer?</h3>
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
            </motion.div>
          </div>
        </motion.div>

        {/* Case Studies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4 block">
                Case Studies
              </span>
              <h2 className="text-display-md text-foreground mb-2">Project Showcase</h2>
              <p className="text-muted-foreground text-body-lg">
                Every case study we publish follows this format: starting problem → what we installed → before/after → client-approved photo → client's own words.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {caseStudies.map((study, index) => (
              <motion.article
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card className="h-full border-border">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">In Progress</Badge>
                      <span className="text-muted-foreground text-xs">{study.industry}</span>
                    </div>
                    <h3 className="text-headline-sm text-foreground mb-2">{study.title}</h3>
                    <p className="text-muted-foreground text-body-sm mb-4">{study.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {study.services.map((svc) => (
                        <Badge key={svc} variant="outline" className="text-xs">{svc}</Badge>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm italic mb-4">Status: {study.status}</p>
                    <div className="flex items-center gap-2 text-sm text-primary mt-auto">
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      <span>Client photos pending approval</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.article>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Become Our Next Success Story →</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}