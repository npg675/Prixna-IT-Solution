/* Prixna calendar helpers — ICS invites + Google Calendar links + NPT slot parsing.
   No deps. Used by booking-ics route, voice-webhook, reminders. */

const DAY_INDEX: Record<string, number> = {
  sun: 0, sunday: 0, mon: 1, monday: 1, tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3, thu: 4, thur: 4, thurs: 4, thursday: 4, fri: 5, friday: 5,
};

export function parseSlotToNPT(dayLabel: string, timeLabel: string, from = new Date()): Date | null {
  const key = Object.keys(DAY_INDEX).find((k) => new RegExp(k, "i").test(dayLabel || ""));
  if (!key) return null;
  const target = DAY_INDEX[key];
  // current time in Kathmandu
  const nowNpt = new Date(from.toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }));
  // parse "11am", "11:30 am", "14:00"
  const m = String(timeLabel || "").match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  let hh = m ? parseInt(m[1], 10) : 11;
  const mm = m?.[2] ? parseInt(m[2], 10) : 0;
  const ap = m?.[3]?.toLowerCase();
  if (ap === "pm" && hh < 12) hh += 12;
  if (ap === "am" && hh === 12) hh = 0;
  if (!ap && hh < 9) hh += 12; // "3" likely means 3pm in business context
  hh = Math.min(Math.max(hh, 9), 18);

  const d = new Date(nowNpt);
  let delta = (target - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + delta);
  d.setHours(hh, mm, 0, 0);
  if (d.getTime() <= nowNpt.getTime()) d.setDate(d.getDate() + 7); // next week if passed
  if (d.getDay() === 6) d.setDate(d.getDate() + 1); // never Saturday → Sunday
  return d;
}

/** Convert a Kathmandu wall-time Date to UTC Date for ICS (NPT = UTC+5:45). */
function nptToUtc(d: Date): Date {
  return new Date(d.getTime() - (5 * 60 + 45) * 60_000);
}

function icsDate(d: Date): string {
  const u = nptToUtc(d);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${u.getUTCFullYear()}${p(u.getUTCMonth() + 1)}${p(u.getUTCDate())}T${p(u.getUTCHours())}${p(u.getUTCMinutes())}00Z`;
}

export interface BookingCal {
  id: string; name: string; phone: string; service: string; day: string; time: string; location?: string;
}

export function bookingStartEnd(b: BookingCal, durationMin = 60): { start: Date; end: Date } | null {
  const start = parseSlotToNPT(b.day, b.time);
  if (!start) return null;
  return { start, end: new Date(start.getTime() + durationMin * 60_000) };
}

export function buildICS(b: BookingCal): string | null {
  const se = bookingStartEnd(b);
  if (!se) return null;
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Prixna IT Solution//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@prixnaitsolution.com.np`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(se.start)}`, `DTEND:${icsDate(se.end)}`,
    `SUMMARY:${esc(`Prixna visit — ${b.service} (${b.id})`)}`,
    `DESCRIPTION:${esc(`Customer: ${b.name} ${b.phone}. Ref ${b.id}. Staff confirms on call. Koteshwor-32, Kathmandu. +977 9813714582.`)}`,
    `LOCATION:${esc(b.location || "Koteshwor-32, Kathmandu")}`,
    "STATUS:CONFIRMED", "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Prixna visit tomorrow", "END:VALARM",
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Prixna visit in 2 hours", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function googleCalendarUrl(b: BookingCal): string | null {
  const se = bookingStartEnd(b);
  if (!se) return null;
  const fmt = (d: Date) => icsDate(d).replace("Z", "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Prixna visit — ${b.service} (${b.id})`,
    dates: `${fmt(se.start)}/${fmt(se.end)}`,
    details: `Customer: ${b.name} ${b.phone}. Ref ${b.id}.`,
    location: b.location || "Koteshwor-32, Kathmandu",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
