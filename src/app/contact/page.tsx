import { Suspense } from "react";
import { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactFormSection } from "@/components/contact/ContactFormSection";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Contact & Consultation",
  description: "Get a free business technology consultation from Prixna IT Solution. Book a meeting, request a quote, or discuss your IT project. Serving Kathmandu Valley and businesses across Nepal.",
  openGraph: {
    title: "Contact & Consultation — Prixna IT Solution",
    description: "Free consultation · Transparent NPR quotation · Support after installation.",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ContactFormSection />
      </Suspense>
      <ContactInfo />
      <FinalCTA />
    </>
  );
}