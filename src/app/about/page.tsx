import { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { MissionVisionValues } from "@/components/about/MissionVisionValues";
import { OurApproach } from "@/components/about/OurApproach";
import { Capabilities } from "@/components/about/Capabilities";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Prixna IT Solution Pvt. Ltd. — our mission, vision, values, and approach to combining software, hardware, and intelligent technology for business success in Nepal.",
  openGraph: {
    title: "About Prixna IT Solution — Complete Business Technology Partner",
    description: "Our mission, vision, values, and approach to technology for businesses in Nepal.",
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <MissionVisionValues />
      <OurApproach />
      <Capabilities />
      <FinalCTA />
    </>
  );
}