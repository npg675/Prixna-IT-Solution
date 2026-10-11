import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quotation Builder (Staff)",
  robots: { index: false, follow: false },
};

export default function QuoteBuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
