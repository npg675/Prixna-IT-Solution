# Software Demo Theatre — Guide & Duplication Blueprint

This demo experience is designed for **public traffic coming from AI chat, WhatsApp, marketing links, and direct campaigns** to watch a 2–4 minute software walkthrough, explore key features, and convert into free consultation leads.

---

## 1. Live Routes & Links

| Route | Purpose |
|---|---|
| [`/demo`](file:///d:/Prixna%20IT%20Solution%20Portfolio/src/app/demo/page.tsx) | Main Software Demo Theatre (defaults to featured software, e.g. Jigri ERP) |
| `/demo?product=jigri-erp` | Direct link to **Jigri ERP — Billing + Inventory** |
| `/demo?product=restaurant-pos` | Direct link to **Restaurant & Hotel POS + KOT** |
| `/demo?product=jigri-crm` | Direct link to **Jigri CRM — Leads & Pipeline** |
| `/demo?product=ehajiri-attendance` | Direct link to **eHajiri + Biometric Attendance** |
| `/demo?product=jigritools-suite` | Direct link to **JigriTools — 30+ Free Utilities** |
| `/demo.html` | Automatically redirects to `/demo` (preserving query params) |

---

## 2. Core Architecture & Files

```
src/
├── app/
│   └── demo/
│       └── page.tsx              # Main Theatre page, hero banner, tabs, side consultation form
├── components/
│   └── demo/
│       ├── DemoPlayer.tsx        # 16:9 Cinema frame with YouTube / video / interactive preview
│       ├── DemoTabs.tsx          # Smooth horizontal product selector ribbon
│       └── DemoFaq.tsx           # Nepal business software FAQ accordion
└── lib/
    └── demos-store.ts            # Central data store, types, YouTube embed parser & WhatsApp helper
```

---

## 3. How to Add a New Software Product / Demo (in 60 seconds)

Open [`src/lib/demos-store.ts`](file:///d:/Prixna%20IT%20Solution%20Portfolio/src/lib/demos-store.ts) and add your new product to `DEFAULT_DEMOS`:

```typescript
{
  id: "my-new-software",                          // URL slug: /demo?product=my-new-software
  name: "My New Software — Subtitle",
  tagline: "Short 1-sentence value proposition for customers",
  category: "Retail / Billing",
  icon: "🚀",                                     // Emoji or icon
  youtubeUrl: "https://youtu.be/YOUR_VIDEO_ID",   // YouTube watch, shortlink, shorts, or embed
  duration: "3 min demo",
  features: [
    "Feature 1: Key capability",
    "Feature 2: Key capability",
    "Feature 3: Key capability",
  ],
  keyWorkflows: [                                 // Chapters displayed below the player
    { time: "0:30", title: "Setup", desc: "Quick onboarding" },
    { time: "1:15", title: "Core Flow", desc: "Everyday operations" },
    { time: "2:20", title: "Reports", desc: "Day-end summary" },
  ],
  audience: "Target businesses (e.g. Marts, Clinics, Wholesalers)",
  consultService: "Business Software / SaaS Demo",
  planHint: "Monthly or annual NPR subscription quoted after free workflow study",
  active: true,
  featured: false,
}
```

That's it! The product selector tab, player, chapters, WhatsApp link, and consultation form will automatically render for your new software.

---

## 4. How to Duplicate this Demo Page into Another Project

To use this exact high-converting demo theatre in a new Next.js project:

1. **Copy the 4 core files**:
   - `src/lib/demos-store.ts`
   - `src/components/demo/DemoPlayer.tsx`
   - `src/components/demo/DemoTabs.tsx`
   - `src/components/demo/DemoFaq.tsx`
   - `src/app/demo/page.tsx`
2. **Update the data**:
   - In `demos-store.ts`, change `DEFAULT_DEMOS` with your project's software products and YouTube links.
   - Update phone/WhatsApp numbers in `getWhatsAppDemoLink()`.
3. **Connect your consultation form**:
   - In `src/app/demo/page.tsx`, replace or keep `<ConsultationForm />` to route inquiries to your email/CRM.

---

## 5. Video Player Modes

- **When `youtubeUrl` is provided**: Embeds a zero-cookie responsive YouTube cinema frame (`youtube-nocookie.com`).
- **When `videoFile` is provided**: Plays native MP4/WebM with responsive HTML5 player.
- **When no video is provided yet**: Displays an interactive simulation mockup with live feature badges and a 1-click **"Request Instant 1-on-1 Demo on WhatsApp"** button so visitors are never faced with an empty box.
