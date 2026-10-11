"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Box, Sparkles, Users, Calendar, ExternalLink, CheckCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Box,
  Sparkles,
  Users,
  Calendar,
};

interface ProductDetailPageProps {
  data: {
    title: string;
    tagline: string;
    badge: string;
    badgeVariant: "success" | "secondary" | "default" | "warning" | "destructive" | "outline";
    icon: string;
    purpose: string[];
    coreCapabilities: string[];
    businessBenefits: string[];
    integrationOptions: string[];
    screenshots: string[];
    demoUrl?: string;
    ctaText: string;
    ctaLink: string;
    ctaVariant: "default" | "primary" | "outline" | "secondary" | "ghost" | "destructive" | "white" | "whatsapp";
    externalLink?: string;
    isFree: boolean;
    freeTierDetails?: string;
  };
}

export function ProductDetailPage({ data }: ProductDetailPageProps) {
  const Icon = iconMap[data.icon] || Box;

  return (
    <>
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-navy-950 pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

        <motion.div
          className="relative container-custom py-16 lg:py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          <div className="max-w-4xl">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Products
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={data.badgeVariant} className="text-sm">{data.badge}</Badge>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-display-xl lg:text-display-lg text-foreground font-display leading-[1.1] mb-2">
              {data.title}
            </h1>
            <p className="text-muted-foreground text-body-lg max-w-2xl mb-6">{data.tagline}</p>
            {data.isFree && (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                <span>Completely Free — No Sign-up Required</span>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      <section className="section bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-headline-lg text-foreground mb-6">Purpose & Target Audience</h2>
                <div className="space-y-4 text-body-md text-muted-foreground">
                  {data.purpose.map((para, index) => (
                    <p key={index}>{para}</p>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-headline-lg text-foreground mb-6">Core Capabilities</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.coreCapabilities.map((capability, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.03 }}
                      className="flex gap-3 p-4 bg-muted dark:glass-card rounded-xl"
                    >
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-foreground text-body-sm">{capability}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-headline-lg text-foreground mb-6">Business Benefits</h2>
                <div className="space-y-3">
                  {data.businessBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 p-4 bg-gradient-to-r from-primary/20 to-transparent dark:from-primary/20 rounded-xl border border-primary/50"
                    >
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-foreground text-body-md">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {data.integrationOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-headline-lg text-foreground mb-6">Integration Options</h2>
                  <div className="space-y-3">
                    {data.integrationOptions.map((integration, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 p-4 bg-muted dark:glass-card rounded-xl"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                          {index + 1}
                        </span>
                        <p className="text-foreground text-body-md">{integration}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {data.screenshots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-headline-lg text-foreground mb-6">Screenshots</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {data.screenshots.map((screenshot, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="aspect-video rounded-xl bg-secondary flex items-center justify-center"
                      >
                        <span className="text-muted-foreground">Screenshot {index + 1}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {data.freeTierDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                >
                  <div className="flex gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Free Tier Details</h3>
                      <p className="text-green-800 dark:text-green-200 text-body-sm">{data.freeTierDetails}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="sticky top-24"
              >
                <Card className="border-primary/50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-headline-md text-foreground">Get Started</h3>
                    <p className="text-muted-foreground">
                      {data.isFree
                        ? "Open the live site and start using all tools immediately — no registration needed."
                        : "Book a demo to see the platform in action. We'll walk you through features relevant to your business."
                      }
                    </p>
                    <Button asChild variant={data.ctaVariant} size="lg" className="w-full">
                      <a href={data.ctaLink} target={data.externalLink ? "_blank" : undefined} rel={data.externalLink ? "noopener noreferrer" : undefined}>
                        {data.ctaText}
                        {data.externalLink && <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />}
                      </a>
                    </Button>
                    {!data.isFree && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/contact?service=JigriTools%20Enquiry">
                          Discuss Custom Requirements
                        </Link>
                      </Button>
                    )}
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Have questions?</p>
                      <div className="space-y-2">
                        <a href="tel:+9779813714582" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          +977 9813714582
                        </a>
                        <a href="https://wa.me/9779813714582" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground hover:text-[#25D366] transition-colors">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.472.099-.174.05-.372-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z"/></svg>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted dark:glass-card">
                  <CardContent className="p-6">
                    <h3 className="text-headline-sm text-foreground mb-4">Related Products</h3>
                    <ul className="space-y-2">
                      <li><Link href="/products/jigri-erp" className="text-primary hover:underline text-sm">Jigri ERP — Business Management</Link></li>
                      <li><Link href="/products/jigri-crm" className="text-primary hover:underline text-sm">Jigri CRM — Customer Management</Link></li>
                      <li><Link href="/products/jigri-ehajiri" className="text-primary hover:underline text-sm">Jigri eHajiri — Digital Attendance</Link></li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {!data.isFree && (
        <section className="section bg-muted dark:bg-background">
          <div className="container-custom">
            <ConsultationForm
              title={`Request a ${data.title} Demo`}
              subtitle="Tell us about your requirements and we'll schedule a personalized walkthrough."
              service={data.title}
              formType={data.title.toLowerCase().replace(/\s+/g, "-")}
              showBooking
            />
          </div>
        </section>
      )}
    </>
  );
}