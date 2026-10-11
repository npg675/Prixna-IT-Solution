import { Metadata } from "next";
import { SolutionDetailPage } from "@/components/solutions/SolutionDetailPage";

export const metadata: Metadata = {
  title: "Biometric & Access Control",
  description: "Fingerprint attendance devices and door access control systems with software setup and payroll integration. Professional installation across Kathmandu Valley.",
  openGraph: {
    title: "Biometric & Access Control — Prixna IT Solution",
    description: "Fingerprint attendance and door access with software setup.",
  },
};

const solutionData = {
  title: "Biometric & Access Control",
  icon: "Shield",
  category: "Security",
  businessProblem: [
    "Manual attendance registers are error-prone",
    "Buddy punching and time theft",
    "No integration with payroll systems",
    "Unauthorized access to sensitive areas",
    "No audit trail for compliance",
  ],
  proposedSolution: [
    "Fingerprint and face recognition attendance devices",
    "Door access controllers with RFID/biometric",
    "Jigri eHajiri: Digital attendance & leave software",
    "Payroll integration for automated salary calculation",
    "Real-time monitoring and reporting dashboard",
    "Cloud and on-premise deployment options",
  ],
  benefits: [
    "Eliminate buddy punching and time theft",
    "Automated payroll-ready attendance data",
    "Secure access control for sensitive areas",
    "Real-time visibility into staff presence",
    "Compliance-ready audit trails",
    "Integration with existing HR systems",
  ],
  scopeOfService: [
    "Device selection based on headcount and environment",
    "Supply, installation, and network configuration",
    "Software setup (Jigri eHajiri or third-party)",
    "Staff enrollment and training",
    "Payroll software integration",
    "Annual maintenance and support",
  ],
  implementationApproach: [
    "Requirements analysis: users, shifts, locations",
    "Device recommendation and demo",
    "Quotation with hardware + software + installation",
    "Installation and network integration",
    "Staff enrollment and admin training",
    "Go-live support and ongoing AMC",
  ],
  ctaText: "Request Attendance Demo",
  ctaLink: "/contact?service=Attendance%20%26%20Payroll",
};

export default function BiometricAccessPage() {
  return <SolutionDetailPage data={solutionData} />;
}