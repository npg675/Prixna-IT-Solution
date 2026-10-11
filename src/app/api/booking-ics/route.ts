import { NextRequest, NextResponse } from "next/server";
import { buildICS } from "@/lib/calendar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* GET /api/booking-ics?id=B-XX&name=X&phone=98..&service=CCTV&day=Sunday&time=11am
   Returns a downloadable .ics invite (works in Google/Apple/Outlook Calendar). */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const booking = {
    id: q.get("id") || "B-XXXX",
    name: q.get("name") || "",
    phone: q.get("phone") || "",
    service: q.get("service") || "Prixna visit",
    day: q.get("day") || "",
    time: q.get("time") || "",
    location: q.get("location") || "Koteshwor-32, Kathmandu",
  };
  const ics = buildICS(booking);
  if (!ics) {
    return NextResponse.json(
      { error: "Could not parse day/time. Use day=Sunday..Friday and time like '11am'." },
      { status: 400 }
    );
  }
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.id}.ics"`,
    },
  });
}
