import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/Toaster";
import { StickyMobileCTA } from "@/components/common/StickyMobileCTA";
import { Analytics } from "@/components/common/Analytics";
import { PrixnaAIWidget } from "@/components/PrixnaAIWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prixnaitsolution.com.np"),
  title: {
    default: "Prixna IT Solution — Complete Business Technology. One Trusted Partner.",
    template: "%s | Prixna IT Solution",
  },
  description: "Prixna IT Solution Pvt. Ltd. is Kathmandu's business technology partner: integrated software (ERP, CRM, JigriTools), hardware infrastructure, CCTV, biometric systems, networking, and IT support. Get a free consultation.",
  keywords: [
    "business software Nepal",
    "ERP Nepal",
    "CRM Nepal",
    "JigriTools",
    "CCTV installation Kathmandu",
    "biometric attendance Nepal",
    "IT support Kathmandu",
    "networking servers Nepal",
    "custom software development Nepal",
    "digital transformation Nepal",
  ],
  authors: [{ name: "Prixna IT Solution Pvt. Ltd." }],
  creator: "Prixna IT Solution",
  publisher: "Prixna IT Solution",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: "https://prixnaitsolution.com.np",
    siteName: "Prixna IT Solution",
    title: "Complete Business Technology. One Trusted Partner.",
    description: "Software, hardware, automation and IT support for businesses in Nepal — from one trusted partner.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prixna IT Solution - Complete Business Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete Business Technology. One Trusted Partner.",
    description: "Software, hardware, automation and IT support for businesses in Nepal — from one trusted partner.",
    images: ["/og-image.jpg"],
    creator: "@prixnaitsolution",
  },
  verification: {
    google: "google-site-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A1A38" },
    { media: "(prefers-color-scheme: dark)", color: "#1A2230" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://prixnaitsolution.com.np/#org",
                  name: "Prixna IT Solution Pvt. Ltd.",
                  url: "https://prixnaitsolution.com.np/",
                  email: "info@prixnaitsolution.com.np",
                  telephone: "+9779813714582",
                  logo: "https://prixnaitsolution.com.np/logo.png",
                  sameAs: [
                    "https://www.facebook.com/prixnaitsolution",
                    "https://jigritools.com/",
                  ],
                },
                {
                  "@type": "LocalBusiness",
                  name: "Prixna IT Solution Pvt. Ltd.",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Koteshwor-32",
                    addressLocality: "Kathmandu",
                    addressCountry: "NP",
                  },
                  telephone: "+9779813714582",
                  priceRange: "Rs",
                  openingHours: "Mo-Fr 09:30-18:30",
                  hasMap: "https://maps.google.com/?cid=5858322710047837393",
                },
                {
                  "@type": "WebSite",
                  url: "https://prixnaitsolution.com.np/",
                  name: "Prixna IT Solution",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://prixnaitsolution.com.np/search?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main" className="min-h-screen">
            {children}
          </main>
          <Footer />
          <StickyMobileCTA />
          <Toaster />
          <Analytics />
          <PrixnaAIWidget />
        </Providers>
      </body>
    </html>
  );
}