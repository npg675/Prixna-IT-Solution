import { Metadata } from "next";
import { InsightArticlePage } from "@/components/insights/InsightArticlePage";

export const metadata: Metadata = {
  title: "Stop Registering Attendance on Paper: A Biometric Starter Guide",
  description: "Costs, payroll linking and what to ask before you buy a biometric attendance device. Practical guide for Nepali businesses.",
  openGraph: {
    title: "Stop Registering Attendance on Paper: A Biometric Starter Guide",
    description: "Costs, payroll linking and what to ask before you buy a device.",
    type: "article",
    publishedTime: "2024-01-25",
    authors: ["Prixna IT Solution"],
    tags: ["biometric", "attendance", "payroll", "Nepal", "HR"],
  },
};

import type { InsightArticleData } from "@/components/insights/InsightArticlePage";

const articleData: InsightArticleData = {
  title: "Stop Registering Attendance on Paper: A Biometric Starter Guide",
  category: "Productivity",
  excerpt: "Costs, payroll linking and what to ask before you buy a device.",
  author: {
    name: "Prixna IT Solution Team",
    role: "HR Technology Consultants",
  },
  publishDate: "2024-01-25",
  readTime: "7 min read",
  tags: ["biometric", "attendance", "payroll", "Nepal", "HR"],
  content: [
    {
      type: "paragraph",
      content: "Paper registers are error-prone, time-consuming, and easy to manipulate. Biometric attendance solves this — but only if you choose and implement it right.",
    },
    {
      type: "heading",
      content: "Why Switch from Paper?",
    },
    {
      type: "list",
      items: [
        "Buddy punching: colleagues clocking in for each other",
        "Manual compilation errors in payroll",
        "No real-time visibility: who's in, who's late?",
        "Audit trail missing for labor compliance",
        "HR spends hours on attendance instead of people work",
      ],
    },
    {
      type: "heading",
      content: "Device Types & Costs (Kathmandu Market)",
    },
    {
      type: "list",
      items: [
        "Fingerprint only: Rs 8,000 - 15,000",
        "Face + Fingerprint: Rs 15,000 - 25,000",
        "Face + Fingerprint + RFID + Password: Rs 20,000 - 35,000",
        "Outdoor/IP65 rated: Add Rs 5,000 - 10,000",
        "Installation & config: Rs 3,000 - 8,000",
        "Software (cloud/on-premise): Rs 500-2,000/user/year or one-time",
      ],
    },
    {
      type: "paragraph",
      content: "For 50 staff: budget Rs 40,000-70,000 total for hardware + first year software.",
    },
    {
      type: "heading",
      content: "Payroll Integration — The Real Value",
    },
    {
      type: "paragraph",
      content: "Attendance data must flow into payroll automatically. Look for:",
    },
    {
      type: "list",
      items: [
        "Export: Excel, CSV, Tally-compatible",
        "Overtime calculation rules (Nepal labor law)",
        "Late/early deductions configurable",
        "Shift-wise rules (night shift, rotating)",
        "Leave balance sync",
        "Festival/overtime multiplier support",
      ],
    },
    {
      type: "paragraph",
      content: "Jigri eHajiri does this natively — talk to us for a demo.",
    },
    {
      type: "heading",
      content: "Questions to Ask Before Buying",
    },
    {
      type: "list",
      items: [
        "Does it work offline? (Power cuts in Nepal)",
        "How many fingerprints/faces can it store?",
        "What's the verification speed? (<1 sec ideal)",
        "Is the software cloud or on-premise?",
        "Who hosts the data? Nepal or overseas?",
        "What's the warranty and local support SLA?",
        "Can it integrate with our payroll software?",
        "Is there a mobile app for managers?",
      ],
    },
    {
      type: "heading",
      content: "Implementation Checklist",
    },
    {
      type: "list",
      items: [
        "Mount at 1.4m height, away from direct sunlight",
        "Enroll all fingers (index + thumb) for reliability",
        "Configure shifts, grace periods, overtime rules",
        "Test with 5 staff for 1 week before full rollout",
        "Train HR on reports, exceptions, corrections",
        "Set up backup: daily auto-export to Google Drive",
      ],
    },
    {
      type: "cta",
      text: "Request a Biometric Demo",
      link: "/contact?service=Attendance%20%26%20Payroll",
    },
  ],
  relatedArticles: [
    { title: "How to Choose Billing Software for Your Shop in Nepal", href: "/insights/choosing-billing-software-nepal", category: "Buying Guide" },
    { title: "CCTV for Shops: How Many Cameras Do You Really Need?", href: "/insights/cctv-cameras-how-many", category: "Security" },
  ],
};

export default function BiometricAttendancePage() {
  return <InsightArticlePage data={articleData} />;
}