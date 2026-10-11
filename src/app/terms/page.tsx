import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for consultations, quotations, implementation, and support from Prixna IT Solution Pvt. Ltd.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <section className="section bg-background pt-28">
      <div className="container-custom max-w-3xl">
        <p className="text-sm font-semibold text-primary"><Link href="/">Home</Link> / Terms</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
          <h2>Consultations & quotes</h2>
          <p>Initial consultations are free. Itemised NPR quotations are valid as stated; scope changes require written approval.</p>
          <h2>Implementation</h2>
          <p>Hardware warranties follow distributor terms confirmed in writing at purchase. Software scope, training, and handover are documented before go-live.</p>
          <h2>Support</h2>
          <p>Support is provided under agreed terms (phone, WhatsApp, on-site). Response times follow the AMC or project agreement.</p>
          <h2>Contact</h2>
          <p>Prixna IT Solution Pvt. Ltd., Koteshwor-32, Kathmandu · <a href="tel:+9779813714582">+977 9813714582</a> · <a href="mailto:info@prixnaitsolution.com.np">info@prixnaitsolution.com.np</a></p>
        </div>
      </div>
    </section>
  );
}
