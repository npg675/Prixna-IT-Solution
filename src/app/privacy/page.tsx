import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Prixna IT Solution collects, uses, and protects enquiry information. We never sell data or send unsolicited bulk messages.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <section className="section bg-background pt-28">
      <div className="container-custom max-w-3xl">
        <p className="text-sm font-semibold text-primary"><Link href="/">Home</Link> / Privacy</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-3 text-muted-foreground">Last updated: October 2026 · Prixna IT Solution Pvt. Ltd., Koteshwor-32, Kathmandu</p>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <h2>What we collect</h2>
          <p>Only what you voluntarily submit: name, phone, email, company, location, service interest, and message — plus a consent checkbox.</p>
          <h2>How we use it</h2>
          <ul>
            <li>Respond to your enquiry by call, SMS, email, or WhatsApp.</li>
            <li>Prepare quotations, demos, and project proposals.</li>
            <li>Internal lead follow-up (owner, status, history).</li>
          </ul>
          <h2>What we never do</h2>
          <ul>
            <li>No sale or sharing of personal data with third parties.</li>
            <li>No unsolicited bulk messages or spam.</li>
            <li>No unnecessary personal data collection.</li>
          </ul>
          <h2>Retention & rights</h2>
          <p>Contact <a href="mailto:info@prixnaitsolution.com.np">info@prixnaitsolution.com.np</a> or <a href="tel:+9779813714582">+977 9813714582</a> to access, correct, or delete your enquiry data.</p>
        </div>
      </div>
    </section>
  );
}
