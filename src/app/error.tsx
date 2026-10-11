"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section bg-background pt-28 text-center">
      <div className="container-custom max-w-xl">
        <h1 className="font-display text-4xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">Please try again. If it persists, call +977 9813714582 or WhatsApp us.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="default" onClick={reset}>Try again</Button>
          <Button asChild variant="outline"><Link href="/">Back to Home</Link></Button>
        </div>
      </div>
    </section>
  );
}
