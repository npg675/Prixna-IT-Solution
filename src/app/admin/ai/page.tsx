"use client";

import Link from "next/link";
import { StaffGate } from "@/components/StaffGate";
import { Button } from "@/components/ui/Button";
import { AISettingsTab } from "@/components/admin/AISettingsTab";

function AIAdminInner() {
  return (
    <div className="container-custom py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground"><Link href="/admin" className="underline">Admin</Link> / AI Assistant</p>
          <h1 className="font-display text-3xl font-bold">🤖 AI Assistant settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Provider, catalog, prompts and sales behaviour. Same settings as before — nothing lost.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/admin">📥 Lead inbox</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/admin/demos">🎬 Demo Videos</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/dashboard">🎛️ Control Center</Link></Button>
        </div>
      </div>
      <AISettingsTab />
    </div>
  );
}

export default function AIAdminPage() {
  return <StaffGate><AIAdminInner /></StaffGate>;
}
