import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageCircle, Facebook, Globe, ArrowUpRight, ChevronRight } from "lucide-react";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Solutions", href: "/solutions" },
  { name: "Industries", href: "/industries" },
  { name: "Projects", href: "/projects" },
  { name: "Insights", href: "/insights" },
  { name: "Contact Us", href: "/contact" },
];

const solutionLinks = [
  { name: "Business Software & ERP", href: "/solutions/business-software-saas" },
  { name: "CRM & Business Automation", href: "/solutions/business-software-saas" },
  { name: "Website & App Development", href: "/solutions/custom-development" },
  { name: "IT Infrastructure & Hardware", href: "/solutions/hardware-infrastructure" },
  { name: "CCTV, Biometric & Security", href: "/solutions/cctv-security" },
  { name: "AI & Digital Transformation", href: "/solutions/digital-marketing-ai" },
];

const platformLinks = [
  { name: "🎬 Watch Software Demos", href: "/demo" },
  { name: "✨ New Showcase", href: "/showcase" },
  { name: "JigriTools (Free)", href: "/products/jigritools" },
  { name: "Jigri ERP", href: "/products/jigri-erp" },
  { name: "Jigri CRM", href: "/products/jigri-crm" },
  { name: "Jigri eHajiri", href: "/products/jigri-ehajiri" },
];

const linkCls =
  "group inline-flex items-center gap-2 text-[14px] text-white/70 transition-all duration-200 hover:translate-x-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 rounded-sm";

/** Quick-links bullet: chevron chip that lights up and glides on hover. */
function QuickBullet() {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 transition-all duration-300 group-hover:border-royal-400/50 group-hover:bg-royal-600/25 group-hover:shadow-[0_0_12px_rgba(53,99,255,0.5)]"
    >
      <ChevronRight className="h-3 w-3 text-white/45 transition-all duration-300 group-hover:translate-x-px group-hover:text-tech" />
    </span>
  );
}

/** Solutions bullet: gradient diamond that spins into a glow on hover. */
function SolutionBullet() {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center"
    >
      <span className="block h-[8px] w-[8px] rotate-45 rounded-[2px] bg-gradient-to-br from-royal-400 to-tech transition-all duration-500 group-hover:rotate-[225deg] group-hover:shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
    </span>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-white" role="contentinfo">
      {/* Top accent hairline — signature royal → cyan */}
      <div className="h-1 bg-gradient-to-r from-royal-600 via-tech to-royal-600" aria-hidden="true" />

      <div className="container-custom pb-10 pt-14 lg:pt-20">
        {/* Main 4-column grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Column 1 — Company identity */}
          <div>
            <Link href="/" className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400" aria-label="Prixna IT Solution - Home">
              <BrandLogo variant="footer" />
            </Link>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/70">
              Complete Business Technology. One Trusted Partner. Software, hardware, IT services,
              business automation, and modern technology solutions for growing businesses.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="https://www.facebook.com/prixnaitsolution"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Prixna IT Solution on Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-electric-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
              >
                <Facebook className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
              <a
                href="https://jigritools.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="JigriTools — free utilities by Prixna"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-electric-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
              >
                <Globe className="h-[18px] w-[18px]" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2 — Quick links */}
          <nav aria-label="Quick links">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-white">Quick Links</h3>
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-electric-500" aria-hidden="true" />
            <ul className="mt-5 space-y-1.5">
              {quickLinks.map((l) => (
                <li key={l.href + l.name}>
                  <Link href={l.href} className={linkCls}>
                    <QuickBullet />
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Solutions */}
          <nav aria-label="Our solutions">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-white">Our Solutions</h3>
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-electric-500" aria-hidden="true" />
            <ul className="mt-5 space-y-1.5">
              {solutionLinks.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className={linkCls}>
                    <SolutionBullet />
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4 — Contact */}
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-white">Contact Information</h3>
            <span className="mt-2 block h-0.5 w-8 rounded-full bg-electric-500" aria-hidden="true" />
            <address className="mt-5 space-y-3.5 text-[14px] not-italic">
              <a
                href="https://maps.google.com/?cid=5858322710047837393"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 rounded text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" aria-hidden="true" />
                <span>Koteshwor-32,<br />Kathmandu, Nepal</span>
              </a>
              <a href={getTelUrl("+9779813714582")} className="flex items-center gap-2.5 rounded text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
                <Phone className="h-4 w-4 shrink-0 text-electric-400" aria-hidden="true" />
                <span className="font-semibold text-white">+977 9813714582</span>
              </a>
              <a href="mailto:info@prixnaitsolution.com.np" className="flex items-center gap-2.5 rounded text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
                <Mail className="h-4 w-4 shrink-0 text-electric-400" aria-hidden="true" />
                <span className="break-all">info@prixnaitsolution.com.np</span>
              </a>
              <a href="https://prixnaitsolution.com.np/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded text-white/70 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
                <Globe className="h-4 w-4 shrink-0 text-electric-400" aria-hidden="true" />
                <span>prixnaitsolution.com.np</span>
              </a>
              <p className="flex items-center gap-2.5 text-white/70">
                <Clock className="h-4 w-4 shrink-0 text-electric-400" aria-hidden="true" />
                <span>Sun–Fri · 9:30 AM – 6:30 PM</span>
              </p>
              <a
                href={getWhatsAppUrl("9779813714582", "Hello Prixna IT Solution, I need a free consultation for my business.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#1DA851] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat on WhatsApp
              </a>
            </address>
          </div>
        </div>

        {/* Platforms strip */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/50">Jigri Platforms</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {platformLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group inline-flex items-center gap-1 text-[13.5px] font-medium text-white/65 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 rounded-sm"
                >
                  {l.name}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-px group-hover:opacity-100" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-white/55 sm:flex-row">
          <p>© {currentYear} Prixna IT Solution Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="rounded-sm transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
              Privacy Policy
            </Link>
            <span className="h-3 w-px bg-white/20" aria-hidden="true" />
            <Link href="/terms" className="rounded-sm transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
