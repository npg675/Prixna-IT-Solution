import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "Digital Marketing & AI Automation",
  description: "Practical digital marketing, SEO, social media management, and AI workflow automation for businesses in Nepal. Lead generation and brand building that delivers measurable results.",
  openGraph: {
    title: "Digital Marketing & AI Automation — Prixna IT Solution",
    description: "Practical marketing, design and automation that bring enquiries.",
  },
};

const solutionData = {
  title: "Digital Marketing & AI Automation",
  icon: "Megaphone",
  category: "Digital",
  businessProblem: [
    "No online presence or outdated website",
    "Low-quality leads from traditional marketing",
    "Manual repetitive tasks wasting staff time",
    "No visibility into marketing ROI",
    "Competitors outranking you on Google",
  ],
  proposedSolution: [
    "Website design, development, and SEO optimization",
    "Google Business Profile setup and management",
    "Social media content strategy and management",
    "AI-powered workflow automation (n8n, Zapier, custom)",
    "Lead capture forms and CRM integration",
    "Email marketing and WhatsApp automation",
    "Performance tracking and monthly reporting",
  ],
  benefits: [
    "Increased online visibility and enquiries",
    "Automated lead nurture and follow-up",
    "Time savings from repetitive task automation",
    "Measurable ROI with monthly analytics",
    "Professional brand presence across channels",
    "Local market understanding for Nepal",
  ],
  scopeOfService: [
    "Digital audit and strategy development",
    "Website build or redesign with SEO foundation",
    "Content creation: blogs, social posts, videos",
    "Campaign setup: Google Ads, Meta Ads, SEO",
    "Automation workflow design and deployment",
    "Monthly performance review and optimization",
  ],
  implementationApproach: [
    "Discovery: goals, audience, current assets",
    "Strategy: channels, content, automation map",
    "Setup: website, profiles, tools, integrations",
    "Launch: campaigns go live, tracking enabled",
    "Optimize: weekly monitoring, monthly reviews",
    "Scale: increase budget on winners, test new",
  ],
  ctaText: "Build Your Digital Presence",
  ctaLink: "/contact?service=Digital%20Marketing%20%2F%20AI%20Automation",
};

export default function DigitalMarketingAiPage() {
  return <SolutionDetailPage data={solutionData} />;
}