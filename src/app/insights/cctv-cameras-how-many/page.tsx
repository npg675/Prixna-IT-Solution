import { Metadata } from "next";
import { InsightArticlePage } from "@/components/insights/InsightArticlePage";
import type { InsightArticleData } from "@/components/insights/InsightArticlePage";

export const metadata: Metadata = {
  title: "CCTV for Shops: How Many Cameras Do You Really Need?",
  description: "Coverage planning, storage math and installation mistakes to avoid. A practical guide for shop owners in Nepal.",
  openGraph: {
    title: "CCTV for Shops: How Many Cameras Do You Really Need?",
    description: "Coverage planning, storage math and installation mistakes to avoid.",
    type: "article",
    publishedTime: "2024-01-20",
    authors: ["Prixna IT Solution"],
    tags: ["CCTV", "security", "Nepal", "shop", "installation"],
  },
};

const articleData: InsightArticleData = {
  title: "CCTV for Shops: How Many Cameras Do You Really Need?",
  category: "Security",
  excerpt: "Coverage planning, storage math and installation mistakes to avoid.",
  author: {
    name: "Prixna IT Solution Team",
    role: "Security Systems Specialists",
  },
  publishDate: "2024-01-20",
  readTime: "6 min read",
  tags: ["CCTV", "security", "Nepal", "shop", "installation"],
  content: [
    {
      type: "paragraph",
      content: "Every shop owner asks this question. The answer isn't a number — it's a coverage plan. Here's how to think about it.",
    },
    {
      type: "heading",
      content: "The Coverage Formula",
    },
    {
      type: "paragraph",
      content: "Start with zones, not camera count. Every shop needs coverage for:",
    },
    {
      type: "list",
      items: [
        "Cash counter (wide + close-up)",
        "Entry/exit (face capture)",
        "Main sales floor (overview)",
        "Stock room / godown",
        "Back alley / loading area (if applicable)",
      ],
    },
    {
      type: "paragraph",
      content: "A typical 500-800 sq ft Kathmandu shop needs 4-6 cameras. A 1500+ sq ft showroom needs 8-12.",
    },
    {
      type: "heading",
      content: "Camera Types & Placement",
    },
    {
      type: "list",
      items: [
        "Cash counter: 2MP+ dome (wide) + 4MP+ bullet (close-up for denominations)",
        "Entry: 4MP+ bullet at 2.5m height, angled for faces",
        "Sales floor: 2MP+ dome with wide angle (90-110°)",
        "Stock room: 2MP+ dome, IR for low light",
        "Outdoor: 4MP+ bullet, IP67, IR 30m+",
      ],
    },
    {
      type: "heading",
      content: "Storage Math (The Part Everyone Forgets)",
    },
    {
      type: "paragraph",
      content: "For 6 cameras at 2MP, H.265, 15fps, 24/7 recording: ~1.2 TB/month. Plan for 2TB minimum for 30-day retention. 4MP doubles storage needs.",
    },
    {
      type: "heading",
      content: "Installation Mistakes to Avoid",
    },
    {
      type: "list",
      items: [
        "Mounting too high — can't identify faces",
        "Pointing at bright lights / windows — backlight washes out image",
        "No UPS for DVR/NVR — power cut = recording gap",
        "Using indoor cameras outdoors — they'll die in monsoon",
        "Cheap cable (CCA) — signal loss over 50m",
        "No remote access setup — can't check from phone",
        "Default passwords — hello hackers",
      ],
    },
    {
      type: "heading",
      content: "Our Kathmandu Installation Standard",
    },
    {
      type: "list",
      items: [
        "Free site survey before quoting",
        "Pure copper CAT6 for all runs",
        "DVR/NVR on UPS with 4+ hour backup",
        "Remote viewing configured on your phone",
        "Cable trunking for neat, protected runs",
        "1-year installation warranty + AMC option",
        "Demo and handover with your staff",
      ],
    },
    {
      type: "cta",
      text: "Schedule a Free Site Survey",
      link: "/contact?service=CCTV%20%26%20Security%20Installation",
    },
  ],
  relatedArticles: [
    { title: "How to Choose Billing Software for Your Shop in Nepal", href: "/insights/choosing-billing-software-nepal", category: "Buying Guide" },
    { title: "Stop Registering Attendance on Paper: A Biometric Starter Guide", href: "/insights/biometric-attendance-guide", category: "Productivity" },
  ],
};

export default function CctvCamerasPage() {
  return <InsightArticlePage data={articleData} />;
}