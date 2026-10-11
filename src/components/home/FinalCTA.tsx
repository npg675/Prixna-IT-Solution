"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function FinalCTA() {
  return (
    <section className="section bg-background text-foreground relative overflow-hidden" id="contact-cta">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl" />

      <div className="relative container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-display-md text-foreground mb-4">Let's Find the Right Technology for Your Business.</h2>
          <p className="text-muted-foreground text-body-lg max-w-2xl mx-auto">
            Free consultation · Transparent NPR quotation · Support after installation. Serving Kathmandu Valley and businesses across Nepal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button asChild variant="white" size="xl" className="w-full sm:w-auto">
            <a href="/contact">Get a Free Consultation</a>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-full sm:w-auto border-white/30 hover:bg-white/10">
            <a href="/contact?service=Bulk%20%2F%20Dealer%20Enquiry">Request a Quote</a>
          </Button>
          <Button asChild variant="whatsapp" size="xl" className="w-full sm:w-auto">
            <a href={getWhatsAppUrl("Hello Prixna IT Solution, I need a free consultation for my business.")} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div className="p-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <a href={getTelUrl("+9779813714582")} className="text-foreground font-medium hover:text-primary transition-colors">
              +977 9813714582
            </a>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-[#25D366]" aria-hidden="true" />
            </div>
            <a href={getWhatsAppUrl("9779813714582")} target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary transition-colors">
              WhatsApp
            </a>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <a href="mailto:info@prixnaitsolution.com.np" className="text-foreground font-medium hover:text-primary transition-colors">
              info@prixnaitsolution.com.np
            </a>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <address className="not-italic text-muted-foreground text-sm">
              Koteshwor-32<br />
              Kathmandu, Nepal
            </address>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-border text-center text-muted-foreground text-sm"
        >
          <p>Sun–Fri, 9:30 AM – 6:30 PM (Sat: closed) · <Clock className="h-4 w-4 inline" aria-hidden="true" /></p>
        </motion.div>
      </div>
    </section>
  );
}