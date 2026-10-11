import { Metadata } from "next";
import { InsightArticlePage } from "@/components/insights/InsightArticlePage";
import type { InsightArticleData } from "@/components/insights/InsightArticlePage";

export const metadata: Metadata = {
  title: "How to Choose Billing Software for Your Shop in Nepal",
  description: "VAT/PAN realities, must-have features and the demo questions that reveal the truth. A practical buying guide for Nepali retailers.",
  openGraph: {
    title: "How to Choose Billing Software for Your Shop in Nepal",
    description: "VAT/PAN realities, must-have features and the demo questions that reveal the truth.",
    type: "article",
    publishedTime: "2024-01-15",
    authors: ["Prixna IT Solution"],
    tags: ["billing software", "Nepal", "VAT", "retail", "buying guide"],
  },
};

const articleData: InsightArticleData = {
  title: "How to Choose Billing Software for Your Shop in Nepal",
  category: "Buying Guide",
  excerpt: "VAT/PAN realities, must-have features and the demo questions that reveal the truth.",
  author: {
    name: "Prixna IT Solution Team",
    role: "Business Technology Consultants",
  },
  publishDate: "2024-01-15",
  readTime: "8 min read",
  tags: ["billing software", "Nepal", "VAT", "retail", "buying guide"],
  content: [
    {
      type: "paragraph",
      content: "Choosing billing software in Nepal isn't just about features — it's about VAT compliance, Nepali calendar support, and whether the vendor will still answer your calls next year. This guide cuts through the marketing fluff.",
    },
    {
      type: "heading",
      content: "The Nepal Reality Check",
    },
    {
      type: "paragraph",
      content: "Before you look at features, answer these three questions:",
    },
    {
      type: "list",
      items: [
        "Does it handle VAT/PAN invoicing exactly as IRD requires?",
        "Does it use Bikram Sambat (BS) dates alongside AD?",
        "Can it generate the reports your accountant actually needs?",
      ],
    },
    {
      type: "paragraph",
      content: "If the answer to any is 'no' or 'we're adding it soon', walk away. Compliance isn't optional in Nepal.",
    },
    {
      type: "heading",
      content: "Must-Have Features for Nepali Retail",
    },
    {
      type: "list",
      items: [
        "BS/AD date support in all reports and invoices",
        "VAT invoice format matching IRD specifications",
        "Lakh/Crore number formatting (not just millions)",
        "Barcode scanning and label printing",
        "Stock alerts: low stock, expiry, reorder points",
        "Party-wise ledger for wholesale/credit customers",
        "Day-book and cash-book auto-generation",
        "Tally/Excel export for your accountant",
        "Offline mode for load-shedding hours",
        "Local support: phone, WhatsApp, on-site in Kathmandu",
      ],
    },
    {
      type: "heading",
      content: "The Demo Questions That Reveal the Truth",
    },
    {
      type: "paragraph",
      content: "Ask these during the demo. Vague answers = future pain:",
    },
    {
      type: "list",
      items: [
        "Show me a VAT invoice for a mixed tax-rate sale.",
        "Generate a day-book for Falgun 2080 with BS dates.",
        "How do I handle a return with different tax rates?",
        "Show the stock alert when batch XYZ expires next month.",
        "Export the data in Tally format — let me see the file.",
        "What happens when internet is down for 3 hours?",
        "Who do I call at 6 PM on a Saturday when billing freezes?",
      ],
    },
    {
      type: "heading",
      content: "Red Flags to Avoid",
    },
    {
      type: "list",
      items: [
        "\"We'll customize it for you\" (means you're the beta tester)",
        "No local references in Kathmandu Valley",
        "Only cloud-based with no offline mode",
        "Pricing in USD with no NPR invoice",
        "Demo only shows happy path — no error handling",
      ],
    },
    {
      type: "heading",
      content: "Our Recommendation",
    },
    {
      type: "paragraph",
      content: "Start with JigriTools' free billing utilities to understand your workflow. Then talk to us about Jigri ERP — built for Nepal, supported from Kathmandu, with honest pricing in NPR.",
    },
    {
      type: "cta",
      text: "Request a Billing Software Demo",
      link: "/contact?service=Business%20Software%20%2F%20SaaS%20Demo",
    },
  ],
  relatedArticles: [
    { title: "CCTV for Shops: How Many Cameras Do You Really Need?", href: "/insights/cctv-cameras-how-many", category: "Security" },
    { title: "Stop Registering Attendance on Paper: A Biometric Starter Guide", href: "/insights/biometric-attendance-guide", category: "Productivity" },
  ],
};

export default function ChoosingBillingSoftwarePage() {
  return <InsightArticlePage data={articleData} />;
}