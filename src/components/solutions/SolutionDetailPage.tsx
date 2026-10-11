"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, ArrowLeft, Monitor, Code, Cpu, Shield, Wifi, Wrench, Zap, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  Code,
  Cpu,
  Shield,
  Wifi,
  Wrench,
  Zap,
  Megaphone,
};

interface SolutionDetailPageProps {
  data: {
    title: string;
    icon: string;
    category: string;
    businessProblem: string[];
    proposedSolution: string[];
    benefits: string[];
    scopeOfService: string[];
    implementationApproach: string[];
    ctaText: string;
    ctaLink: string;
  };
}

export function SolutionDetailPage({ data }: SolutionDetailPageProps) {
  const Icon = iconMap[data.icon] || Monitor;

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
              href="/solutions"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Solutions
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="text-sm">{data.category}</Badge>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-display-xl lg:text-display-lg text-foreground font-display leading-[1.1] mb-4">
              {data.title}
            </h1>
            <p className="text-muted-foreground text-body-lg max-w-2xl">
              Complete solutions combining software, hardware, and support — tailored for businesses in Nepal.
            </p>
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
                <h2 className="text-headline-lg text-foreground mb-6">Business Problems We Solve</h2>
                <div className="space-y-4">
                  {data.businessProblem.map((problem, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 bg-muted dark:glass-card rounded-xl"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <span className="text-red-500 font-bold text-sm">!</span>
                      </div>
                      <p className="text-foreground text-body-md">{problem}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-headline-lg text-foreground mb-6">Our Proposed Solution</h2>
                <div className="space-y-4">
                  {data.proposedSolution.map((solution, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 bg-primary/20 dark:bg-primary/20 rounded-xl border border-primary/50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <p className="text-foreground text-body-md">{solution}</p>
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
                <h2 className="text-headline-lg text-foreground mb-6">Key Benefits</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 p-4 bg-muted dark:glass-card rounded-xl"
                    >
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-foreground text-body-sm">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-headline-lg text-foreground mb-6">Scope of Service</h2>
                <div className="space-y-3">
                  {data.scopeOfService.map((item, index) => (
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
                      <p className="text-foreground text-body-md">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-headline-lg text-foreground mb-6">Implementation Approach</h2>
                <div className="space-y-4">
                  {data.implementationApproach.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-5 bg-gradient-to-r from-primary/20 to-transparent dark:from-primary/20 rounded-xl border border-primary/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <p className="text-foreground text-body-md mt-1">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
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
                    <h3 className="text-headline-md text-foreground">Ready to Get Started?</h3>
                    <p className="text-muted-foreground">
                      Book a free consultation. We'll understand your needs, show you relevant demos, and provide a transparent NPR quotation.
                    </p>
                    <Button asChild variant="primary" size="lg" className="w-full">
                      <Link href={data.ctaLink}>{data.ctaText}</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/contact?service=Business%20Software%20%2F%20SaaS%20Demo">
                        Discuss Your Requirements
                      </Link>
                    </Button>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Prefer direct contact?</p>
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
                    <h3 className="text-headline-sm text-foreground mb-4">Related Solutions</h3>
                    <ul className="space-y-2">
                      <li><Link href="/solutions/custom-development" className="text-primary hover:underline text-sm">Custom Software & Websites</Link></li>
                      <li><Link href="/solutions/it-support-maintenance" className="text-primary hover:underline text-sm">IT Support & Maintenance</Link></li>
                      <li><Link href="/products/jigri-erp" className="text-primary hover:underline text-sm">Jigri ERP Platform</Link></li>
                      <li><Link href="/products/jigri-crm" className="text-primary hover:underline text-sm">Jigri CRM Platform</Link></li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-muted dark:bg-background">
        <div className="container-custom">
          <ConsultationForm
            title="Request a Software Consultation"
            subtitle="Tell us about your requirements and we'll recommend the right solution."
            service="Business Software / SaaS Demo"
            formType="business-software-saas"
            showBooking
          />
        </div>
      </section>
    </>
  );
}