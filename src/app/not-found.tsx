import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="section bg-background pt-28 text-center">
      <div className="container-custom max-w-xl">
        <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase">404</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page moved or never existed. Try the homepage or book a free consultation instead.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="default"><Link href="/">Back to Home</Link></Button>
          <Button asChild variant="outline"><Link href="/contact">Book a Consultation</Link></Button>
        </div>
      </div>
    </section>
  );
}
