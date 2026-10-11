"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/* Staff PIN gate — same keys/hash as static js/prixna-auth.js, so one PIN
   unlocks both stacks on the same device. Deterrent, not server security. */
const LS_HASH = "prixna_staff_hash_v1";
const SES_KEY = "prixna_staff_ok_v1";

export function hashPin(pin: string): string {
  let h1 = 5381, h2 = 52711;
  const s = "prixna::" + pin;
  for (let i = 0; i < s.length; i++) {
    h1 = ((h1 << 5) + h1 + s.charCodeAt(i)) | 0;
    h2 = ((h2 << 5) + h2 + s.charCodeAt((i * 7) % s.length)) | 0;
  }
  return "d" + (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

export function StaffGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "setup" | "locked" | "open">("loading");
  const [entry, setEntry] = useState("");
  const [first, setFirst] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SES_KEY) === "1") return setState("open");
    } catch { /* ignore */ }
    setState(localStorage.getItem(LS_HASH) ? "locked" : "setup");
  }, []);

  const press = useCallback((k: string) => {
    setErr("");
    if (k === "C") return setEntry("");
    if (k !== "✓") return setEntry((e) => (e.length >= 12 ? e : e + k));
    if (state === "setup") {
      if (entry.length < 4) return setErr("Use at least 4 digits.");
      if (first === null) {
        setFirst(entry); setEntry("");
        return setErr("Repeat the PIN to confirm.");
      }
      if (entry !== first) {
        setFirst(null); setEntry("");
        return setErr("Mismatch — start over.");
      }
      localStorage.setItem(LS_HASH, hashPin(entry));
      try { sessionStorage.setItem(SES_KEY, "1"); } catch { /* ignore */ }
      return setState("open");
    }
    if (hashPin(entry) === localStorage.getItem(LS_HASH)) {
      try { sessionStorage.setItem(SES_KEY, "1"); } catch { /* ignore */ }
      return setState("open");
    }
    setErr("Wrong PIN. Try again.");
    setEntry("");
  }, [entry, first, state]);

  if (state === "open") return <>{children}</>;
  if (state === "loading") {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Checking staff lock…</div>;
  }
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-navy-950 text-white">
        <CardContent className="pt-6 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-2 text-xl font-bold">Staff area</h1>
          <p className="mt-1 text-sm text-white/60">
            {state === "setup" ? "First run — set a staff PIN (4+ digits)." : "Enter staff PIN to continue."}
          </p>
          <div className="my-3 min-h-10 text-2xl tracking-[0.4em]">{entry ? "●".repeat(entry.length) : "–"}</div>
          <p className="min-h-5 text-sm text-red-300">{err}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9","C","0","✓"].map((k) => (
              <Button key={k} variant="secondary" onClick={() => press(k)}>{k}</Button>
            ))}
          </div>
          <a href="/" className="mt-4 inline-block text-xs text-white/50">← Back to site</a>
        </CardContent>
      </Card>
    </div>
  );
}
