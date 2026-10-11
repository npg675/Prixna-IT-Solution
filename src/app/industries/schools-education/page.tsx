import { Metadata } from "next";
import { IndustryDetailPage } from "@/components/industries/IndustryDetailPage";

export const metadata: Metadata = {
  title: "School & Education Technology Solutions",
  description: "Complete technology solutions for schools, colleges, and training centers in Nepal. Computer labs, biometric attendance, campus Wi-Fi, projectors, and AMC support.",
  openGraph: {
    title: "Schools & Education — Prixna IT Solution",
    description: "Computer labs, attendance systems, networks & AMC support for education institutions.",
  },
};

const industryData = {
  title: "Schools & Education",
  icon: "GraduationCap",
  description: "Computer labs, attendance systems, networks & AMC support.",
  challenges: [
    "Computer lab maintenance with limited IT staff",
    "Staff attendance records on paper are unreliable",
    "Unreliable internet disrupts digital learning",
    "Projector and AV equipment failures during classes",
    "No centralized management for multi-campus",
    "Budget constraints for technology upgrades",
  ],
  typicalSetup: [
    "Computer lab supply with 3-year AMC",
    "Biometric attendance for staff and students",
    "Campus Wi-Fi with content filtering",
    "Projector and smart board installation",
    "Server for centralized file storage and backup",
    "Network monitoring and proactive support",
  ],
  relatedSolutions: [
    { title: "Biometric & Access Control", href: "/solutions/biometric-access", icon: "Shield" },
    { title: "Networking & Infrastructure", href: "/solutions/networking-servers", icon: "Wifi" },
    { title: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", icon: "Cpu" },
    { title: "IT Support & Maintenance", href: "/solutions/it-support-maintenance", icon: "Wrench" },
    { title: "Custom Software & Websites", href: "/solutions/custom-development", icon: "Code" },
  ],
  relatedProducts: [
    { title: "Jigri eHajiri", href: "/products/jigri-ehajiri", badge: "REQUEST DEMO", icon: "Calendar" },
    { title: "JigriTools", href: "/products/jigritools", badge: "FREE", icon: "Box" },
  ],
  ctaText: "Discuss Your Campus Setup",
  ctaLink: "/contact?service=Computers%20%2F%20Laptops%20%2F%20Equipment",
};

export default function SchoolsEducationPage() {
  return <IndustryDetailPage data={industryData} />;
}