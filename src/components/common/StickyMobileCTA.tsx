"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";

export function StickyMobileCTA() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden" role="complementary" aria-label="Quick contact">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-premium-lg backdrop-blur">
        <a
          href={getTelUrl("+9779813714582")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" aria-hidden="true" /> Call Now
        </a>
        <a
          href={getWhatsAppUrl("9779813714582", "Hello Prixna IT Solution, I need a free consultation.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
      </div>
      <div className="mt-1.5 text-center">
        <Link href="/contact" className="text-xs font-semibold text-primary underline underline-offset-2">
          Or book a free consultation →
        </Link>
      </div>
    </div>
  );
}
