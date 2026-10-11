import { NextRequest, NextResponse } from "next/server";
import { BUSINESS, makeId, validPhone, isBusinessOpen, staffWhatsAppLink } from "@/lib/prixna-autopilot";
import { sendLeadNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* Missed-call win-back.
   Telecom/Vapi posts POST { from, time?, rings? } → staff emailed + win-back message returned.
   Wire your SIP/Vapi 'call missed' webhook here, or log manually from admin. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "prixna-missed-call" });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { from?: string; time?: string; rings?: number };
    const phone = validPhone(body.from || "");
    if (!phone) return NextResponse.json({ error: "Need caller number in 'from'." }, { status: 400 });
    const id = makeId("M-");
    const when = isBusinessOpen() ? "within ~15 minutes" : "next working morning (Sun–Fri 9:30+)";
    await sendLeadNotificationEmail({
      name: "Missed caller", phone, service: "Missed-call callback",
      message: `Missed call from ${phone} at ${body.time || new Date().toISOString()} (rings: ${body.rings ?? "?"}). Auto win-back SMS/WhatsApp prepared. Please call back ${when}.`,
      formType: "missed-call", referenceId: id,
    });
    const winback = `Namaste 🙏 You called Prixna IT Solution (${BUSINESS.phoneDisplay}). Sorry we missed you! We call back ${when}. For instant help reply with your need (e.g. CCTV, laptop repair) or tap to chat: https://wa.me/${BUSINESS.staffWhatsApp}?text=${encodeURIComponent("Hello Prixna! I called and missed you.")}`;
    return NextResponse.json({
      ok: true, id, when,
      smsMessage: winback.slice(0, 300),
      whatsapp: `https://wa.me/${phone}?text=${encodeURIComponent(winback.slice(0, 800))}`,
      staffAlert: staffWhatsAppLink("missed-call", `${id} → ${phone} (${when})`),
    });
  } catch (e) {
    console.error("missed-call error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
