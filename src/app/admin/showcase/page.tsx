"use client";

import Link from "next/link";
import { StaffGate } from "@/components/StaffGate";
import { Button } from "@/components/ui/Button";
import { ShowcaseTab } from "@/components/admin/ShowcaseTab";

function ShowcaseAdminInner() {
  return (
    <div className="container-custom py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground"><Link href="/admin" className="underline">Admin</Link> / Showcase</p>
          <h1 className="font-display text-3xl font-bold">✨ Showcase manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hardware &amp; software items for /showcase + AI recommendations. Same device data as before — nothing lost.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/admin">📥 Lead inbox</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/dashboard">🎛️ Control Center</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/showcase" target="_blank">View page ↗</Link></Button>
        </div>
      </div>
      <ShowcaseTab />
    </div>
  );
}

export default function ShowcaseAdminPage() {
  return <StaffGate><ShowcaseAdminInner /></StaffGate>;
}
