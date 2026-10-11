import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "CCTV & Security Systems",
  description: "Professional CCTV camera supply, installation, and after-support across Kathmandu Valley. IP and analog cameras, DVR/NVR, remote monitoring.",
  openGraph: {
    title: "CCTV & Security Systems — Prixna IT Solution",
    description: "Camera supply, professional installation and after-support across the Valley.",
  },
};

const solutionData = {
  title: "CCTV & Security Systems",
  icon: "Shield",
  category: "Security",
  businessProblem: [
    "Theft, shrinkage, and unauthorized access",
    "No visibility into premises after hours",
    "Disputes with no video evidence",
    "Poor camera coverage or blind spots",
    "Unreliable systems that fail when needed",
  ],
  proposedSolution: [
    "IP cameras (2MP, 4MP, 8MP) with PoE",
    "Analog HD cameras for budget installations",
    "DVR/NVR with 4-64 channel capacity",
    "Remote viewing via mobile app and web",
    "Professional cabling and neat installation",
    "Motion alerts and scheduled recording",
  ],
  benefits: [
    "24/7 premises monitoring",
    "Reduced theft and shrinkage",
    "Evidence for disputes and insurance",
    "Remote access from anywhere",
    "Professional installation with warranty",
    "Local support for maintenance",
  ],
  scopeOfService: [
    "Free site survey and camera placement planning",
    "Camera supply, DVR/NVR, cabling, and accessories",
    "Professional installation and configuration",
    "Network setup for remote access",
    "Staff training on playback and backup",
    "Annual maintenance and cleaning",
  ],
  implementationApproach: [
    "Site visit for coverage assessment",
    "Customized camera layout plan",
    "Transparent quotation with all costs",
    "Installation in 1-3 days depending on size",
    "System testing and handover",
    "Ongoing support and warranty service",
  ],
  ctaText: "Schedule a Site Survey",
  ctaLink: "/contact?service=CCTV%20%26%20Security%20Installation",
};

export default function CctvSecurityPage() {
  return <SolutionDetailPage data={solutionData} />;
}