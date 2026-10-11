"use client";

import { useEffect } from "react";

/* Prixna AI widget bridge for the Next.js app.
   Canonical brain lives in root js/ (static site); `npm run sync:widget`
   copies it to public/ before dev/build. This component injects it in order
   and seeds window.PRIXNA config (incl. Sheets endpoint from env). */
declare global {
  interface Window {
    PRIXNA?: Record<string, unknown>;
  }
}

function seedConfig() {
  const w = window as unknown as { PRIXNA?: Record<string, unknown> };
  w.PRIXNA = {
    name: "Prixna IT Solution Pvt. Ltd.",
    phoneDisplay: "+977 9813714582",
    phoneHref: "tel:+9779813714582",
    whatsappNumber: "9779813714582",
    email: "info@prixnaitsolution.com.np",
    address: "Koteshwor-32, Kathmandu, Nepal",
    hours: "Sun–Fri, 9:30 AM – 6:30 PM (Sat: closed)",
    mapsUrl: "https://maps.google.com/?cid=5858322710047837393",
    sheetsEndpoint: process.env.NEXT_PUBLIC_SHEETS_ENDPOINT || null,
    aiBackend: "/api/ai-chat",
    staffWhatsApp: "9779813714582",
    ...(w.PRIXNA || {}),
  };
}

function load(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-prixna="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.setAttribute("data-prixna", src);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("failed to load " + src));
    document.body.appendChild(s);
  });
}

export function PrixnaAIWidget() {
  useEffect(() => {
    let cancelled = false;
    seedConfig();
    fetch("/api/ai-settings")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data && window.PRIXNA) {
          window.PRIXNA.voiceGender = data.voiceGender || "female";
          window.PRIXNA.voicePitch = typeof data.voicePitch === "number" ? data.voicePitch : 1.0;
          window.PRIXNA.voiceRate = typeof data.voiceRate === "number" ? data.voiceRate : 1.0;
        }
      })
      .catch(() => {});

    // Purge legacy copies (pre-version URLs, Fast Refresh leftovers): exactly one brain.
    document.querySelectorAll('script[data-prixna]').forEach((s) => s.remove());
    document.getElementById("prixna-ai-fab")?.remove();
    document.getElementById("prixna-ai-panel")?.remove();
    (window as unknown as { __PRIXNA_AI_LOADED?: boolean; __PRIXNA_NOTIFY_LOADED?: boolean }).__PRIXNA_AI_LOADED = false;
    (window as unknown as { __PRIXNA_NOTIFY_LOADED?: boolean }).__PRIXNA_NOTIFY_LOADED = false;
    load("/js/prixna-notify.js?v=20261012n")
      .then(() => (cancelled ? undefined : load("/js/prixna-ai.js?v=20261012n")))
      .catch((e) => console.error("[prixna-ai]", e));
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
