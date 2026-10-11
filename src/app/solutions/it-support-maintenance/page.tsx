import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "IT Support & Maintenance",
  description: "Hardware repair, software troubleshooting, and annual maintenance contracts (AMC) for businesses in Kathmandu Valley. On-site and remote support with defined SLAs.",
  openGraph: {
    title: "IT Support & Maintenance — Prixna IT Solution",
    description: "Hardware repair, software troubleshooting and annual care plans.",
  },
};

const solutionData = {
  title: "IT Support & Maintenance",
  icon: "Wrench",
  category: "Support",
  businessProblem: [
    "Unexpected IT failures halt business operations",
    "No dedicated IT staff for small/medium businesses",
    "Slow response from multiple vendors",
    "Recurring issues that never get fully resolved",
    "No preventive maintenance — only reactive fixes",
  ],
  proposedSolution: [
    "Annual Maintenance Contracts (AMC) with defined SLAs",
    "On-site and remote technical support",
    "Hardware repair and component replacement",
    "Software troubleshooting and updates",
    "Proactive system health monitoring",
    "Data backup verification and disaster recovery",
    "Priority response for critical issues",
  ],
  benefits: [
    "Predictable IT costs with fixed annual fees",
    "Fast response: phone, WhatsApp, or on-site",
    "Single point of contact for all IT issues",
    "Preventive maintenance reduces downtime",
    "Expertise across hardware, software, network",
    "Local team in Kathmandu — not remote-only",
  ],
  scopeOfService: [
    "Covered devices: PCs, laptops, printers, servers, network gear",
    "Unlimited remote support during business hours",
    "Monthly on-site preventive maintenance visits",
    "Emergency on-site response within 4 hours (Valley)",
    "Software updates, patches, and security fixes",
    "Backup monitoring and restore testing",
  ],
  implementationApproach: [
    "IT asset audit and health assessment",
    "Customized AMC plan based on inventory",
    "Onboarding: documentation, credentials, baselines",
    "Monthly maintenance and quarterly reviews",
    "Incident management with ticket tracking",
    "Annual renewal with performance report",
  ],
  ctaText: "Get Support Plan",
  ctaLink: "/contact?service=Repair%20%26%20Maintenance",
};

export default function ItSupportMaintenancePage() {
  return <SolutionDetailPage data={solutionData} />;
}