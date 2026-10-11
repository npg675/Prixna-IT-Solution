import Image from "next/image";
import { cn } from "@/lib/utils";

export const BRAND_LOGO_URL =
  "https://prixnaitsolution.com.np/wp-content/uploads/2023/08/cropped-cropped-prixna-it-solution-logo-scaled-61x60.png";

interface BrandLogoProps {
  variant?: "header" | "footer";
  className?: string;
  priority?: boolean;
  /** Compact mode for the header row: smaller mark, no tagline — prevents crowding the nav. */
  compact?: boolean;
  /**
   * Scroll-revealed tagline (header only). When provided, the
   * "Complete Business Technology" line animates open beneath the
   * wordmark once the top utility bar has scrolled away.
   */
  revealTagline?: boolean;
}

/**
 * Shared brand lockup. Uses the official Prixna IT Solution logo asset
 * at its natural aspect ratio (never stretched) with a monogram fallback
 * if the remote asset is unavailable.
 */
export function BrandLogo({ variant = "header", className, priority = false, compact = false, revealTagline }: BrandLogoProps) {
  const isFooter = variant === "footer";
  const animatedTagline = compact && revealTagline !== undefined;
  return (
    <span className={cn("group/logo relative flex shrink-0 items-center", compact ? "gap-2" : "gap-2.5", className)}>
      {/* Ambient glow behind the mark — breathes stronger on hover */}
      <span
        aria-hidden="true"
        className="absolute -left-1 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl bg-gradient-to-br from-royal-500/50 via-tech/30 to-royal-700/50 opacity-70 blur-[10px] transition-all duration-500 group-hover/logo:from-tech/60 group-hover/logo:via-royal-400/40 group-hover/logo:to-tech-500/60 group-hover/logo:opacity-100"
      />
      <span
        className={cn(
          "relative bg-gradient-to-br from-royal-500 via-tech to-royal-700 p-[1.5px] shadow-[0_0_16px_rgba(53,99,255,0.35)] transition-shadow duration-500 group-hover/logo:shadow-[0_0_28px_rgba(34,211,238,0.55)]",
          isFooter ? "h-11 w-11 rounded-xl" : compact ? "h-9 w-9 rounded-[10px]" : "h-10 w-10 rounded-[10px]"
        )}
      >
        {/* Hover color-shift overlay — cyan takes over the ring */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-tl from-tech via-royal-400 to-tech-500 opacity-0 transition-opacity duration-500 group-hover/logo:opacity-100",
            isFooter ? "rounded-xl" : "rounded-[10px]"
          )}
        />
        <span
          className={cn(
            "flex h-full w-full items-center justify-center overflow-hidden bg-white",
            isFooter ? "rounded-[10px]" : "rounded-[8px]"
          )}
        >
          <Image
            src={BRAND_LOGO_URL}
            alt="Prixna IT Solution logo"
            width={61}
            height={60}
            priority={priority}
            className="h-full w-full object-contain p-0.5"
            sizes="48px"
          />
        </span>
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block whitespace-nowrap font-display font-bold tracking-tight",
            isFooter ? "text-[18px] text-white" : compact ? "text-[16px] text-foreground" : "text-[17px] text-foreground"
          )}
        >
          <span className="bg-gradient-to-r from-royal-700 via-royal-500 to-tech-500 bg-[length:200%_auto] bg-clip-text text-transparent transition-[background-position] duration-700 ease-out group-hover/logo:bg-[position:100%_center] dark:from-royal-200 dark:via-royal-100 dark:to-tech">
            Prixna
          </span>{" "}
          <span className={isFooter ? "font-semibold text-electric-400" : "font-semibold text-primary"}>IT Solution</span>
        </span>
        {!compact && (
          <span
            className={cn(
              "block whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em]",
              isFooter ? "text-white/60" : "text-muted-foreground"
            )}
          >
            Business Technology Partner
          </span>
        )}
        {animatedTagline && (
          <span
            aria-hidden="true"
            className={cn(
              "grid transition-all duration-500 ease-out",
              revealTagline ? "mt-1 grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] translate-y-1 opacity-0"
            )}
          >
            <span className="min-h-0 overflow-hidden">
              <span className="block whitespace-nowrap bg-gradient-to-r from-royal-700 via-royal-500 to-tech-500 bg-clip-text text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-transparent">
                Complete Business
              </span>
              <span className="block whitespace-nowrap bg-gradient-to-r from-royal-700 via-royal-500 to-tech bg-clip-text text-[10px] font-bold uppercase leading-snug tracking-[0.32em] text-transparent">
                Technology
              </span>
            </span>
          </span>
        )}
      </span>
    </span>
  );
}
