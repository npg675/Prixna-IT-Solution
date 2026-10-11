import { NextRequest, NextResponse } from "next/server";
import { REVIEW_URL, detectLang, makeId, staffWhatsAppLink } from "@/lib/prixna-autopilot";
import { sendLeadNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* Feedback loop: POST { ref, rating 1-5, comment?, name?, phone? }
   4–5★ → thank + Google review link. 1–3★ → silent service-recovery ticket to staff. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "prixna-feedback", reviewUrl: REVIEW_URL });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { ref?: string; rating?: number; comment?: string; name?: string; phone?: string };
    const rating = Math.round(Number(body.rating));
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
    }
    const lang = detectLang(`${body.comment || ""} ${body.name || ""}`);
    const id = makeId("F-");
    if (rating >= 4) {
      await sendLeadNotificationEmail({
        name: body.name || "Customer", phone: body.phone || "-",
        service: `⭐ ${rating} feedback for ${body.ref || "-"}`,
        message: `Positive review signal. Ref ${body.ref}. Comment: ${body.comment || "-"}`,
        formType: "feedback-positive", referenceId: id,
      });
      return NextResponse.json({
        ok: true, id, mood: "happy",
        thank: lang === "ne" ? "Dherai dhanyabad! 🙏" : "Thank you so much! 🙏",
        reviewUrl: REVIEW_URL,
        shareText: lang === "ne"
          ? `Tapailai sewa man paryo bhane Google review dinus — 1 min lagchha!`
          : `Loved our work? A Google review takes 1 min and helps us a lot!`,
      });
    }
    // 1–3★: recover first, never push a public review
    await sendLeadNotificationEmail({
      name: body.name || "Customer", phone: body.phone || "-",
      service: `⚠️ Service recovery for ${body.ref || "-"}`,
      message: `Rating ${rating}/5. Comment: ${body.comment || "-"}. Call back + fix before asking for any review.`,
      formType: "feedback-recovery", referenceId: id,
    });
    return NextResponse.json({
      ok: true, id, mood: "recovery",
      thank: lang === "ne"
        ? "Maaf garnus 🙏 Hamro supervisor chaandai call garera samasya milaaunchha."
        : "We're sorry 🙏 Our supervisor will call shortly to make this right.",
      staffAlert: staffWhatsAppLink("recovery", `${id} rating ${rating} ref ${body.ref}: ${body.comment || "-"}`),
    });
  } catch (e) {
    console.error("feedback error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
