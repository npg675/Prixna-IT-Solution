"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Monitor,
  Code,
  Cpu,
  Shield,
  Wifi,
  Wrench,
  Megaphone,
  Box,
  Sparkles,
  Users,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getTelUrl, getWhatsAppUrl } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";

interface NavChild {
  name: string;
  href: string;
  desc: string;
  icon: LucideIcon;
}

const solutionLinks: NavChild[] = [
  { name: "Business Software & SaaS", href: "/solutions/business-software-saas", desc: "ERP, billing, inventory", icon: Monitor },
  { name: "Custom Software & Websites", href: "/solutions/custom-development", desc: "Web apps built for you", icon: Code },
  { name: "Hardware & IT Equipment", href: "/solutions/hardware-infrastructure", desc: "Supply + setup", icon: Cpu },
  { name: "CCTV & Security", href: "/solutions/cctv-security", desc: "Cameras + install", icon: Shield },
  { name: "Biometric & Access", href: "/solutions/biometric-access", desc: "Attendance + doors", icon: Users },
  { name: "Networking & Servers", href: "/solutions/networking-servers", desc: "LAN, Wi-Fi, servers", icon: Wifi },
  { name: "IT Support & AMC", href: "/solutions/it-support-maintenance", desc: "Repair + care plans", icon: Wrench },
  { name: "Marketing & AI Automation", href: "/solutions/digital-marketing-ai", desc: "Leads + automation", icon: Megaphone },
];

const productLinks: NavChild[] = [
  { name: "JigriTools (Free)", href: "/products/jigritools", desc: "30+ free utilities", icon: Box },
  { name: "Jigri ERP", href: "/products/jigri-erp", desc: "Billing + inventory", icon: Sparkles },
  { name: "Jigri CRM", href: "/products/jigri-crm", desc: "Leads + pipeline", icon: Users },
  { name: "Jigri eHajiri", href: "/products/jigri-ehajiri", desc: "Attendance + leave", icon: Calendar },
];

const plainLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Industries", href: "/industries" },
  { name: "Projects", href: "/projects" },
  { name: "Insights", href: "/insights" },
  { name: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

const linkBase =
  "relative inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-md px-1.5 text-[13px] font-semibold tracking-[-0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 2xl:px-3 2xl:text-[14px]";
const linkUnderline =
  "after:absolute after:inset-x-1.5 after:bottom-1 after:h-[2px] after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-300 2xl:after:inset-x-3";

function DropPanel({ items, viewAllHref, viewAllLabel }: { items: NavChild[]; viewAllHref: string; viewAllLabel: string }) {
  return (
    <div className="absolute left-1/2 top-full z-50 w-[36rem] -translate-x-1/2 pt-2">
      <div className="animate-in slide-down overflow-hidden rounded-xl border border-border bg-popover shadow-premium-lg">
        <ul className="grid grid-cols-2 gap-1 p-3">
          {items.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group/item flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover/item:bg-primary/15">
                  <l.icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover/item:text-primary">
                    {l.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{l.desc}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:text-primary group-hover/item:opacity-100" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={viewAllHref}
          className="flex items-center justify-center gap-1.5 border-t border-border bg-muted/50 px-4 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {viewAllLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

interface DropdownItemProps {
  id: "solutions" | "products";
  label: string;
  href: string;
  items: NavChild[];
  viewAllLabel: string;
  pathname: string;
  openMenu: string | null;
  setOpenMenu: (v: string | null) => void;
}

function DropdownItem({ id, label, href, items, viewAllLabel, pathname, openMenu, setOpenMenu }: DropdownItemProps) {
  const active = isActive(pathname, href);
  const open = openMenu === id;
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  React.useEffect(() => () => cancelClose(), []);

  return (
    <li
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpenMenu(id);
      }}
      onMouseLeave={scheduleClose}
    >
      <span
        className={cn(
          linkBase,
          linkUnderline,
          "gap-1",
          active ? "text-primary after:scale-x-100" : "text-foreground/75 after:scale-x-0 hover:text-foreground hover:after:scale-x-100"
        )}
      >
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`nav-panel-${id}`}
          aria-label={`${open ? "Collapse" : "Expand"} ${label} submenu`}
          onClick={() => setOpenMenu(open ? null : id)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpenMenu(null);
          }}
          className="rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-all duration-300",
              open ? "rotate-180 text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
        </button>
      </span>
      {open && (
        <div id={`nav-panel-${id}`} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <DropPanel items={items} viewAllHref={href} viewAllLabel={viewAllLabel} />
        </div>
      )}
    </li>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setOpenSection(null);
    setOpenMenu(null);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {/* Slim utility bar — corporate trust signals */}
      <div className="hidden bg-navy-950 text-[13px] text-white/85 lg:block" role="complementary" aria-label="Contact summary">
        <div className="container-custom flex h-9 items-center justify-between">
          <p className="tracking-wide">
            Complete Business Technology. <span className="font-semibold text-white">One Trusted Partner.</span>
            <span className="mx-2 text-white/30" aria-hidden="true">|</span>
            <span className="text-white/70">Koteshwor-32, Kathmandu</span>
          </p>
          <div className="flex items-center gap-5">
            <a href={getTelUrl("+9779813714582")} className="inline-flex items-center gap-1.5 rounded transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
              <Phone className="h-3.5 w-3.5 text-electric-400" aria-hidden="true" /> +977 9813714582
            </a>
            <a href="mailto:info@prixnaitsolution.com.np" className="rounded transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
              info@prixnaitsolution.com.np
            </a>
            <span className="text-white/60">Sun–Fri · 9:30–18:30</span>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/85",
          scrolled ? "border-border shadow-card" : "border-transparent"
        )}
      >
        <nav className="container-custom" aria-label="Main navigation">
          <div className="flex h-[68px] items-center justify-between gap-2 2xl:gap-4">
            <Link href="/" className="shrink-0 rounded-md py-1 transition-transform duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Prixna IT Solution - Home">
              <BrandLogo priority compact revealTagline={scrolled} />
            </Link>

            {/* Desktop nav — centered in available space for a balanced premium row */}
            <ul className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
              <li>
                <Link
                  href="/"
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={cn(linkBase, linkUnderline, pathname === "/" ? "text-primary after:scale-x-100" : "text-foreground/75 after:scale-x-0 hover:text-foreground hover:after:scale-x-100")}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  aria-current={isActive(pathname, "/about") ? "page" : undefined}
                  className={cn(linkBase, linkUnderline, isActive(pathname, "/about") ? "text-primary after:scale-x-100" : "text-foreground/75 after:scale-x-0 hover:text-foreground hover:after:scale-x-100")}
                >
                  About Us
                </Link>
              </li>
              <DropdownItem id="solutions" label="Solutions" href="/solutions" items={solutionLinks} viewAllLabel="View all solutions" pathname={pathname} openMenu={openMenu} setOpenMenu={setOpenMenu} />
              <DropdownItem id="products" label="Products" href="/products" items={productLinks} viewAllLabel="Explore Jigri family" pathname={pathname} openMenu={openMenu} setOpenMenu={setOpenMenu} />
              {plainLinks.filter((l) => !["/", "/about"].includes(l.href)).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(linkBase, linkUnderline, isActive(pathname, item.href) ? "text-primary after:scale-x-100" : "text-foreground/75 after:scale-x-0 hover:text-foreground hover:after:scale-x-100")}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2.5 xl:flex">
              <a
                href={getWhatsAppUrl("9779813714582", "Hello Prixna IT Solution, I need a free consultation for my business.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[13px] font-semibold text-foreground/75 transition-all duration-200 hover:-translate-y-px hover:text-[#1DA851] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" aria-hidden="true" />
                <span className="hidden 2xl:inline">WhatsApp</span>
              </a>
              <Button asChild variant="default" size="sm" className="group h-9 shrink-0 px-3.5 text-[13px] transition-all duration-200 hover:-translate-y-px">
                <Link href="/contact">
                  <span className="hidden 2xl:inline">Book a Consultation</span>
                  <span className="2xl:hidden">Consultation</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-[68px] z-40 bg-navy-950/40 backdrop-blur-[2px] xl:hidden"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                id="mobile-drawer"
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: "tween", duration: 0.25, ease: [0.2, 0, 0, 1] }}
                className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-border bg-background shadow-premium-lg xl:hidden"
              >
                <nav className="container-custom py-4" aria-label="Mobile navigation">
                  <ul className="space-y-1">
                    <MobileLink href="/" label="Home" pathname={pathname} />
                    <MobileLink href="/about" label="About Us" pathname={pathname} />
                    <MobileGroup
                      id="solutions"
                      label="Solutions"
                      href="/solutions"
                      pathname={pathname}
                      open={openSection === "solutions"}
                      onToggle={() => setOpenSection((s) => (s === "solutions" ? null : "solutions"))}
                      links={solutionLinks}
                    />
                    <MobileGroup
                      id="products"
                      label="Products & Platforms"
                      href="/products"
                      pathname={pathname}
                      open={openSection === "products"}
                      onToggle={() => setOpenSection((s) => (s === "products" ? null : "products"))}
                      links={productLinks}
                    />
                    <MobileLink href="/industries" label="Industries" pathname={pathname} />
                    <MobileLink href="/projects" label="Projects" pathname={pathname} />
                    <MobileLink href="/insights" label="Insights" pathname={pathname} />
                    <MobileLink href="/contact" label="Contact" pathname={pathname} />
                  </ul>

                  <div className="mt-4 space-y-2.5 border-t border-border pt-4 pb-2">
                    <Button asChild variant="default" size="lg" className="w-full">
                      <Link href="/contact">Book a Consultation</Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href={getTelUrl("+9779813714582")}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-muted"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" /> Call Us
                      </a>
                      <a
                        href={getWhatsAppUrl("9779813714582", "Hello Prixna IT Solution, I need a free consultation.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1DA851]"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                      </a>
                    </div>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}

function MobileLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = isActive(pathname, href);
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-[48px] items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active ? "bg-primary/10 text-primary" : "text-foreground/85 hover:bg-muted hover:text-foreground"
        )}
      >
        {label}
        <ArrowRight className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
      </Link>
    </li>
  );
}

function MobileGroup({
  id,
  label,
  href,
  pathname,
  open,
  onToggle,
  links,
}: {
  id: string;
  label: string;
  href: string;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  links: NavChild[];
}) {
  const active = isActive(pathname, href);
  return (
    <li className={cn("rounded-lg border transition-colors duration-200", open ? "border-border bg-muted/40" : "border-transparent")}>
      <div className="flex items-center gap-1 px-1 py-1">
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-[44px] flex-1 items-center rounded-lg px-2.5 text-[15px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "text-primary" : "text-foreground/85"
          )}
        >
          {label}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`mobile-sub-${id}`}
          aria-label={`${open ? "Collapse" : "Expand"} ${label} submenu`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} aria-hidden="true" />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={`mobile-sub-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 px-2 pb-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      pathname === l.href
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground/75 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <l.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold">{l.name}</span>
                      <span className="block text-xs text-muted-foreground">{l.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
