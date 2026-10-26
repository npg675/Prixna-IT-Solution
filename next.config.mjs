/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      {
        source: "/quote.html",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/quote",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/bulk-quote.html",
        destination: "/contact?service=Bulk%20%2F%20Dealer%20Enquiry",
        permanent: false,
      },
      {
        source: "/bulk-quote",
        destination: "/contact?service=Bulk%20%2F%20Dealer%20Enquiry",
        permanent: false,
      },
      {
        source: "/software-saas.html",
        destination: "/solutions/business-software-saas",
        permanent: false,
      },
      {
        source: "/cctv-security.html",
        destination: "/solutions/cctv-security",
        permanent: false,
      },
      {
        source: "/biometric-access.html",
        destination: "/solutions/biometric-access",
        permanent: false,
      },
      {
        source: "/networking-servers.html",
        destination: "/solutions/networking-servers",
        permanent: false,
      },
      {
        source: "/repair-maintenance.html",
        destination: "/solutions/it-support-maintenance",
        permanent: false,
      },
      {
        source: "/digital-marketing-ai.html",
        destination: "/solutions/digital-marketing-ai",
        permanent: false,
      },
      {
        source: "/custom-development.html",
        destination: "/solutions/custom-development",
        permanent: false,
      },
      {
        source: "/accounting-erp-crm.html",
        destination: "/products/jigri-erp",
        permanent: false,
      },
      {
        source: "/attendance-payroll.html",
        destination: "/products/jigri-ehajiri",
        permanent: false,
      },
      {
        source: "/computers-laptops.html",
        destination: "/solutions/hardware-infrastructure",
        permanent: false,
      },
      {
        source: "/shop.html",
        destination: "/solutions/hardware-infrastructure",
        permanent: false,
      },
      {
        source: "/shop",
        destination: "/solutions/hardware-infrastructure",
        permanent: false,
      },
      {
        source: "/contact.html",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/about.html",
        destination: "/about",
        permanent: false,
      },
      {
        source: "/industries.html",
        destination: "/industries",
        permanent: false,
      },
      {
        source: "/projects.html",
        destination: "/projects",
        permanent: false,
      },
      {
        source: "/resources.html",
        destination: "/insights",
        permanent: false,
      },
      {
        source: "/feedback.html",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/demo.html",
        destination: "/demo",
        permanent: false,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "prixnaitsolution.com.np",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;