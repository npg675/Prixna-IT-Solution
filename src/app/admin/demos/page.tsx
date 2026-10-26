"use client";

import Link from "next/link";
import { StaffGate } from "@/components/StaffGate";
import { Button } from "@/components/ui/Button";
import { DemosTab } from "@/components/admin/DemosTab";

function DemosAdminInner() {
  return (
    <div className="container-custom py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link href="/admin" className="underline">
              Admin
            </Link>{" "}
            / Demo Videos
          </p>
          <h1 className="font-display text-3xl font-bold">🎬 Software Demo Videos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage YouTube video walkthroughs for ERP, POS, CRM, and attendance. Live on{" "}
            <Link href="/demo" target="_blank" className="underline">
              /demo
            </Link>{" "}
            and the AI Chat Assistant.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">📥 Lead inbox</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">🎛️ Control Center</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/ai">🤖 AI Assistant</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/demo" target="_blank">
              View Demo Theatre ↗
            </Link>
          </Button>
        </div>
      </div>
      <DemosTab />
    </div>
  );
}

export default function DemosAdminPage() {
  return (
    <StaffGate>
      <DemosAdminInner />
    </StaffGate>
  );
}
