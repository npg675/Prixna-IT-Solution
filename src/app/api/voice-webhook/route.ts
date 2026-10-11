import { NextRequest, NextResponse } from "next/server";
import {
  BUSINESS,
  isBusinessOpen,
  isSaturdayDayLabel,
  makeId,
  validPhone,
  staffWhatsAppLink,
  checkAvailability,
  detectPriority,
  detectLang,
  feedbackUrl,
  tpl,
} from "@/lib/prixna-autopilot";
import { sendLeadNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---- rate limit: 30 tool calls / min / IP (voice agents retry fast) ----
const hits = new Map<string, number[]>();
function rateLimited(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > limit;
}

type ToolArgs = Record<string, string | undefined>;

async function notifyStaff(subject: string, body: string, leadLike: { name?: string; phone?: string; email?: string; service?: string; message?: string; referenceId?: string }) {
  // Email is the durable record; WhatsApp link is returned to the voice agent to speak / SMS fallback.
  try {
    await sendLeadNotificationEmail({
      name: leadLike.name || "Voice caller",
      phone: leadLike.phone || "-",
      email: leadLike.email || "",
      service: leadLike.service || subject,
      message: body,
      formType: "voice-call",
      referenceId: leadLike.referenceId || "-",
    });
  } catch (e) {
    console.error("staff email failed:", e);
  }
}

/** Execute one autopilot tool. Returns the payload Vapi speaks / logs. */
async function runTool(tool: string, a: ToolArgs) {
  const phone = validPhone(a.phone || "");
  switch (tool) {
    case "create_lead": {
      if (!phone) return { ok: false, error: "Need a valid 10-digit callback number before saving." };
      const id = makeId("L-");
      const summary = `ID: ${id} | Name: ${a.name || "-"} | Phone: ${phone} | Need: ${a.need || "-"} | Location: ${a.location || "-"}`;
      await notifyStaff(`New voice lead ${id}`, summary, {
        name: a.name, phone, service: a.need, message: `Business: ${a.business_type || "-"} | Location: ${a.location || "-"}`, referenceId: id,
      });
      return { ok: true, id, staffAlert: staffWhatsAppLink("lead", summary), next: "Confirm the reference ID to the caller and offer booking." };
    }
    case "create_ticket": {
      if (!phone) return { ok: false, error: "Need a valid callback number for the ticket." };
      const id = makeId("T-");
      const priority = a.priority || detectPriority(a.device || "", a.problem || "");
      const summary = `ID: ${id} (${priority}) | Phone: ${phone} | Device: ${a.device} | Problem: ${a.problem}`;
      await notifyStaff(`${priority === "Urgent" ? "🚨 URGENT ticket" : "Support ticket"} ${id}`, summary, {
        phone, service: "Repair & Support", message: `${a.device}: ${a.problem}`, referenceId: id,
      });
      return { ok: true, id, priority, open: isBusinessOpen(), staffAlert: staffWhatsAppLink("ticket", summary) };
    }
    case "book_appointment": {
      if (!a.name || a.name.trim().length < 2) return { ok: false, error: "Need the caller name." };
      if (!phone) return { ok: false, error: "Need a valid callback number." };
      if (isSaturdayDayLabel(a.day || "")) {
        return { ok: false, error: "Saturday closed. Offer Sun–Fri 9:30–18:30.", retryWith: "Ask for a Sunday-to-Friday slot." };
      }
      const id = makeId("B-");
      const cal = { id, name: a.name, phone, service: a.service || "Visit", day: a.day || "", time: a.time || "", location: a.location || "Koteshwor-32, Kathmandu" };
      const { googleCalendarUrl, bookingStartEnd } = await import("@/lib/calendar");
      const se = bookingStartEnd(cal);
      const base = process.env.NEXT_PUBLIC_SITE_URL || "https://prixnaitsolution.com.np";
      const icsUrl = `${base}/api/booking-ics?` + new URLSearchParams({ id, name: a.name, phone, service: cal.service, day: cal.day, time: cal.time, location: cal.location }).toString();
      const summary = `ID: ${id} | ${a.name} (${phone}) | ${a.service} | ${a.day} ${a.time} | ${a.location || "Valley"}${se ? ` | starts: ${se.start.toISOString()}` : ""}`;
      await notifyStaff(`New booking ${id}`, `${summary}\nCalendar: ${googleCalendarUrl(cal) || "-"}\nICS: ${icsUrl}`, {
        name: a.name, phone, service: a.service, message: `Slot: ${a.day} ${a.time} | Location: ${a.location || "-"} | ICS: ${icsUrl}`, referenceId: id,
      });
      return { ok: true, id, staffAlert: staffWhatsAppLink("booking", summary), googleCalendarUrl: googleCalendarUrl(cal), icsUrl, feedbackUrl: feedbackUrl(id), feedbackAsk: tpl("feedbackAsk", detectLang(`${a.name} ${cal.service}`), { name: a.name, id }), confirmToCaller: `Booking ${id} on ${a.day} at ${a.time}. Team confirms on ${phone}. Calendar invite link sent.` };
    }
    case "request_callback": {
      if (!phone) return { ok: false, error: "Need a valid callback number." };
      const id = makeId("C-");
      const when = isBusinessOpen() ? "within ~15 minutes" : "next working morning (Sun–Fri 9:30+)";
      await notifyStaff(`Callback request ${id}`, `Call ${phone} ${when}.`, { phone, service: "Callback", message: `Urgency: ${a.urgency || "-"}`, referenceId: id });
      return { ok: true, id, when, staffAlert: staffWhatsAppLink("callback", `${id} → ${phone} (${when})`) };
    }
    case "escalate_to_human": {
      const id = makeId("H-");
      await notifyStaff(`🚨 Human handoff ${id} [${a.priority || "High"}]`, `Reason: ${a.reason}\nSummary: ${a.transcript_summary}`, {
        service: "Human handoff", message: `${a.reason} — ${a.transcript_summary}`, referenceId: id,
      });
      return {
        ok: true, id, speak: `Connecting you to our technician at ${BUSINESS.phoneDisplay}. Ticket ${id} is noted so you won't repeat yourself.`,
        tel: "tel:+9779813714582",
      };
    }
    case "check_availability": {
      return { ok: true, ...checkAvailability(a.product || "") };
    }
    case "send_whatsapp_summary": {
      if (!phone) return { ok: false, error: "Need customer phone." };
      // Meta Cloud API send happens in Apps Script / WATI; here return the 1-tap link as fallback + log.
      const link = `https://wa.me/${phone}?text=${encodeURIComponent(a.message || "")}`;
      return { ok: true, queued: !process.env.WHATSAPP_TOKEN, link };
    }
    case "request_feedback": {
      // Usage: after a completed visit/call. Ask rating first; never push Google review on low scores.
      const ref = a.ref || a.bookingId || "";
      const lang = detectLang(`${a.name || ""} ${ref}`);
      return {
        ok: true, feedbackUrl: feedbackUrl(ref),
        ask: tpl("feedbackAsk", lang, { name: a.name, id: ref }),
        note: "If caller sounds unhappy, skip the review ask and escalate_to_human instead.",
      };
    }
    case "request_bulk_quote": {
      if (!phone) return { ok: false, error: "Need a valid callback number." };
      if (!a.items || a.items.trim().length < 5) {
        return { ok: false, error: "Need item list + quantities.", retryWith: "Ask: which items and how many of each?" };
      }
      const id = makeId("L-");
      const summary = `ID: ${id} | ${a.name || "-"} (${phone}) [${a.business || "-"}] | BULK: ${(a.items || "").slice(0, 200)}`;
      await notifyStaff(`📦 Bulk enquiry ${id}`, summary, {
        name: a.name, phone, service: "Bulk / Dealer Enquiry",
        message: `Business: ${a.business || "-"} | List: ${a.items}`, referenceId: id,
      });
      return { ok: true, id, staffAlert: staffWhatsAppLink("bulk", summary), confirmToCaller: `Bulk request ${id} noted. Team replies with one itemised quotation.` };
    }
    default:
      return { ok: false, error: `Unknown tool: ${tool}` };
  }
}

/** Normalize Vapi / Bland / Retell / direct POST into {tool, args}. */
function parseToolCall(body: Record<string, unknown>): { tool: string; args: ToolArgs } | null {
  // Direct format: { tool, args }
  if (typeof body.tool === "string") return { tool: body.tool, args: (body.args as ToolArgs) || {} };
  // Vapi server-tool format: { message: { toolCalls: [{ function: { name, arguments } }] } }
  const msg = body.message as { toolCalls?: Array<{ function?: { name?: string; arguments?: unknown } }> } | undefined;
  const call = msg?.toolCalls?.[0]?.function;
  if (call?.name) {
    let args: ToolArgs = {};
    try {
      args = typeof call.arguments === "string" ? JSON.parse(call.arguments) : (call.arguments as ToolArgs) || {};
    } catch { args = {}; }
    return { tool: call.name, args };
  }
  return null;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "prixna-voice-webhook",
    openNow: isBusinessOpen(),
    hours: BUSINESS.hoursLabel,
    tools: ["create_lead", "create_ticket", "book_appointment", "request_callback", "escalate_to_human", "check_availability", "send_whatsapp_summary", "request_feedback", "request_bulk_quote"],
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const body = (await request.json()) as Record<string, unknown>;

    // End-of-call report (Vapi: message.type === "end-of-call-report") → staff digest, no tool result needed.
    const msgType = (body.message as { type?: string } | undefined)?.type;
    if (msgType === "end-of-call-report" || body.event === "call-ended") {
      const summary = JSON.stringify(body).slice(0, 1500);
      await notifyStaff("📞 Call ended — transcript", summary, { service: "Voice call report", message: summary, referenceId: makeId("V-") });
      return NextResponse.json({ ok: true, logged: true });
    }

    const parsed = parseToolCall(body);
    if (!parsed) return NextResponse.json({ error: "No tool call found. Send {tool, args} or Vapi toolCalls." }, { status: 400 });

    const result = await runTool(parsed.tool, parsed.args);
    // Vapi expects { results: [{ toolCallId, result }]} for server tools; direct callers get {result}.
    const toolCallId = (body.message as { toolCalls?: Array<{ id?: string }> } | undefined)?.toolCalls?.[0]?.id;
    if (toolCallId) return NextResponse.json({ results: [{ toolCallId, result: JSON.stringify(result) }] });
    return NextResponse.json({ result });
  } catch (error) {
    console.error("voice-webhook error:", error);
    return NextResponse.json({ error: "Failed to run tool" }, { status: 500 });
  }
}
