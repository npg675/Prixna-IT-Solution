"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "Do I need brand new computers to run this software?",
    a: "Not necessarily. Our software (Jigri ERP, POS, CRM) is lightweight and designed to run smoothly on standard Windows desktops or laptops (Intel Core i3 / 4GB RAM or higher). If you do need computers, thermal printers, cash drawers, or barcode scanners, our hardware team supplies genuine equipment with full local warranty from Koteshwor, Kathmandu.",
  },
  {
    q: "Does the software work if internet goes down?",
    a: "Yes. Core billing and point-of-sale features operate with local offline capability so power cuts or ISP outages never stop your counter from printing receipts. As soon as connectivity returns, your ledger and multi-branch data automatically syncs to cloud storage safely.",
  },
  {
    q: "Is it compliant with Nepal Inland Revenue Department (IRD) & PAN/VAT rules?",
    a: "Yes. All invoice formats support IRD billing formats, PAN/VAT breakdown, fiscal year 2082/83 tax slabs, customer Khata ledgers, and Bikram Sambat (BS) date calendars natively.",
  },
  {
    q: "Can you help migrate our existing customer data and stock from Excel?",
    a: "Absolutely. When you subscribe, our technical team handles item catalog import, initial stock take entry, customer ledger migration, and barcode setup so you can go live without downtime.",
  },
  {
    q: "What does the Free Consultation include?",
    a: "We talk to you on the phone, over WhatsApp, or send a technician to your shop in Kathmandu Valley. We study your daily counter workflow, show you a hands-on live demo, and give you an honest, transparent quotation in NPR. Zero high-pressure sales.",
  },
  {
    q: "How does the subscription work?",
    a: "No hidden setup fees. Subscriptions are billed in simple NPR (quarterly, semi-annual, or annual) and include regular software updates, bug fixes, phone/remote support, and Kathmandu on-site assistance under agreed terms.",
  },
];

export function DemoFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Frequently Asked Questions for Business Owners in Nepal
          </h3>
          <p className="text-xs text-muted-foreground">
            Clear, honest answers regarding hardware, internet, training, and subscriptions.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between gap-4 text-left font-semibold text-foreground hover:text-primary transition-colors text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm animate-in fade-in-50 duration-200">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
