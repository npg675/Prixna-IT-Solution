import { NextRequest, NextResponse } from "next/server";
import { bookingStartEnd } from "@/lib/calendar";
import { validPhone } from "@/lib/prixna-autopilot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ReminderBooking {
  id: string; name?: string; phone: string; service?: string;
  day: string; time: string; email?: string;
}

/* Cron / Apps Script calls this hourly.
   POST { bookings: [...] } → returns who needs T-24h / T-2h nudges + ready-to-send messages.
   GET → health. Configure Vercel cron: "0 * * * *" → /api/reminders */
export async function GET() {
  return NextResponse.json({ ok: true, service: "prixna-reminders", windows: ["T-24h", "T-2h"] });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { bookings?: ReminderBooking[] };
    const now = Date.now();
    const due24: object[] = [];
    const due2: object[] = [];
    for (const b of body.bookings || []) {
      if (!validPhone(b.phone)) continue;
      const se = bookingStartEnd({ id: b.id, name: b.name || "", phone: b.phone, service: b.service || "", day: b.day, time: b.time });
      if (!se) continue;
      const diffHrs = (se.start.getTime() - now) / 3_600_000;
      const base = `Namaste ${b.name?.split(" ")[0] || ""} 🙏 Reminder: Prixna visit (${b.id}) for ${b.service || "service"} is on ${b.day} at ${b.time}. Reply YES to confirm or call +977 9813714582 to reschedule.`;
      const wa = `https://wa.me/${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(base)}`;
      if (diffHrs >= 22 && diffHrs <= 26) due24.push({ id: b.id, phone: b.phone, message: base, whatsapp: wa });
      else if (diffHrs >= 1.5 && diffHrs <= 2.5) due2.push({ id: b.id, phone: b.phone, message: base, whatsapp: wa });
    }
    return NextResponse.json({ ok: true, due24h: due24, due2h: due2, checked: (body.bookings || []).length });
  } catch (e) {
    console.error("reminders error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
