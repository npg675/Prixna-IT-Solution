import { NextResponse } from "next/server";
import {
  getMemoryCacheStats,
  clearAllMemoryCache,
  deleteMemoryCacheItem,
  invalidateProductCache,
} from "@/lib/ai-memory-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = getMemoryCacheStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "clear-all") {
      clearAllMemoryCache();
      return NextResponse.json({ success: true, message: "Entire memory cache cleared." });
    }

    if (action === "clear-products") {
      const count = invalidateProductCache();
      return NextResponse.json({ success: true, message: `Cleared ${count} product memory items.` });
    }

    if (action === "delete" && body?.id) {
      const ok = deleteMemoryCacheItem(body.id);
      return NextResponse.json({ success: ok, message: ok ? "Item deleted" : "Item not found" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
