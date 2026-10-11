import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "Networking & Infrastructure",
  description: "Office Wi-Fi, LAN cabling, server installation, VPN and firewall setup. Professional networking infrastructure for businesses in Kathmandu Valley.",
  openGraph: {
    title: "Networking & Infrastructure — Prixna IT Solution",
    description: "Office Wi-Fi, LAN, and server installation done right the first time.",
  },
};

const solutionData = {
  title: "Networking & Infrastructure",
  icon: "Wifi",
  category: "Infrastructure",
  businessProblem: [
    "Slow or unreliable office Wi-Fi",
    "Network downtime affecting productivity",
    "No structured cabling — messy and unreliable",
    "Security vulnerabilities in network",
    "Difficulty managing remote access",
  ],
  proposedSolution: [
    "Structured LAN cabling (CAT6, CAT6a, Fiber)",
    "Enterprise Wi-Fi: controller-based or mesh",
    "Server rack installation and cable management",
    "VPN and secure remote access",
    "Firewall configuration and network segmentation",
    "Network monitoring and proactive maintenance",
  ],
  benefits: [
    "Reliable, high-speed connectivity throughout",
    "Secure network with controlled access",
    "Scalable infrastructure for growth",
    "Reduced downtime with proactive monitoring",
    "Professional cable management",
    "Compliance-ready network documentation",
  ],
  scopeOfService: [
    "Network design and site survey",
    "Cabling installation and certification",
    "Wi-Fi access point placement and configuration",
    "Server room setup: racks, cooling, power",
    "Firewall, VPN, and VLAN configuration",
    "Documentation and as-built drawings",
  ],
  implementationApproach: [
    "Site survey and requirements gathering",
    "Network design with heat maps for Wi-Fi",
    "Phased installation to minimize disruption",
    "Testing, certification, and handover",
    "Admin training and documentation",
    "Ongoing monitoring and AMC support",
  ],
  ctaText: "Plan Your Network",
  ctaLink: "/contact?service=Networking%20%2F%20Servers",
};

export default function NetworkingServersPage() {
  return <SolutionDetailPage data={solutionData} />;
}