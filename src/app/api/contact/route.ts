import { NextRequest, NextResponse } from "next/server";
import { sendLeadNotificationEmail, sendAutoReplyEmail } from "@/lib/email";
import { leadFormSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Minimal in-memory rate limit: 5 submissions / minute / IP (single-instance).
// For multi-instance / 10k concurrent traffic, move to Upstash Redis.
const hits = new Map<string, number[]>();
function rateLimited(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > limit;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
    }

    const body = await request.json();

    // Honeypot (bots fill hidden field)
    if (body.company_site) {
      return NextResponse.json({ success: true, referenceId: body.id ?? "ok" });
    }
    
    const validationResult = leadFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Send notification email to admin
    await sendLeadNotificationEmail({
      ...data,
      formType: body.form || "general",
      referenceId: body.id,
    });

    // Send auto-reply to user if email provided
    if (data.email) {
      await sendAutoReplyEmail({
        ...data,
        formType: body.form || "general",
        referenceId: body.id,
      });
    }

    return NextResponse.json({ success: true, referenceId: body.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}