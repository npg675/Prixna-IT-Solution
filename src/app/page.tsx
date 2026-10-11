import { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { SolutionsOverview } from "@/components/home/SolutionsOverview";
import { ProductsShowcase } from "@/components/home/ProductsShowcase";
import { IndustriesOverview } from "@/components/home/IndustriesOverview";
import { WhyChoose } from "@/components/home/WhyChoose";
import { Testimonials } from "@/components/home/Testimonials";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ResourcesPreview } from "@/components/home/ResourcesPreview";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Complete Business Technology. One Trusted Partner.",
  description: "Prixna IT Solution Pvt. Ltd. is Kathmandu's business technology partner: integrated software (ERP, CRM, JigriTools), hardware infrastructure, CCTV, biometric systems, networking, and IT support. Get a free consultation.",
  openGraph: {
    title: "Complete Business Technology. One Trusted Partner.",
    description: "Software, hardware, automation and IT support for businesses in Nepal — from one trusted partner.",
    images: ["/og-image.jpg"],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <SolutionsOverview />
      <ProductsShowcase />
      <IndustriesOverview />
      <WhyChoose />
      <Testimonials />
      <ProcessSteps />
      <ResourcesPreview />
      <FinalCTA />
    </>
  );
}