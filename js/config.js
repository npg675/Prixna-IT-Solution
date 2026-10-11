/* Prixna IT Solution — central site configuration.
   Edit values here; every page picks them up automatically. */
window.PRIXNA = {
  name: "Prixna IT Solution Pvt. Ltd.",
  shortName: "Prixna IT Solution",
  tagline: "Complete Business Technology. One Trusted Partner.",
  phoneDisplay: "+977 9813714582",
  phoneHref: "tel:+9779813714582",
  whatsappNumber: "9779813714582", // country code + number, no '+'
  email: "info@prixnaitsolution.com.np",
  address: "Koteshwor-32, Kathmandu, Nepal",
  hours: "Sun–Fri, 9:30 AM – 6:30 PM (Sat: closed)",
  mapsUrl: "https://maps.google.com/?cid=5858322710047837393",
  reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJLeSgRjcZ6zkR0UwBUHfxTFE",
  facebook: "https://www.facebook.com/prixnaitsolution",
  jigriToolsUrl: "https://jigritools.com/",
  logoUrl: "https://prixnaitsolution.com.np/wp-content/uploads/2023/08/cropped-cropped-prixna-it-solution-logo-scaled-61x60.png",
  // Optional integrations (leave null until credentials exist):
  formEndpoint: null,   // e.g. "https://formsubmit.co/ajax/info@prixnaitsolution.com.np"
  analyticsId: null,    // e.g. Google Analytics "G-XXXXXXX" — auto-loads when set
  // --- Prixna AI Autopilot (Phase 2) ---
  // 1. Deploy api/prixna-autopilot.gs as Apps Script Web App (Anyone), paste URL here:
  sheetsEndpoint: null, // e.g. "https://script.google.com/macros/s/AKfyc.../exec"
  aiBackend: null,       // optional advanced AI server; when null, local brain + sheetsEndpoint is used
  staffWhatsApp: "9779813714582", // staff gets instant booking/ticket alerts here
  staffEmail: "info@prixnaitsolution.com.np",
  autopilot: { notifyStaff: true, customerConfirm: true, retryQueue: true },
  // --- Quotations & advance payment (Phase 7) — FILL YOUR REAL DETAILS ---
  payment: {
    esewaId: "",            // e.g. "9813714582" — shown on quotations; blank = hidden
    bankName: "",           // e.g. "Nabil Bank, Koteshwor Branch"
    bankAccount: "",        // e.g. "01234567890123"
    bankHolder: "Prixna IT Solution Pvt. Ltd.",
    advancePercent: 30,     // % advance to start bulk/installation work
    quoteValidityDays: 7,
    vatPercent: 13,
    terms: "Prices in NPR. Installation/support as agreed. Warranty as per distributor terms — confirmed at purchase."
  },
  leadInboxNote: "Leads are stored on this device (lead inbox) until a server endpoint or CRM is connected."
};
