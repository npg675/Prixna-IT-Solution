/* ============================================================
   Prixna Autopilot Backend — Google Apps Script (FREE, no server)
   What it does: receives website events → logs to Google Sheet
   (Leads/Tickets/Bookings tabs) → emails staff → WhatsApps staff
   + customer confirmation via WhatsApp Cloud API (if configured).

   SETUP (10 min, one time):
   1. Go to https://sheets.google.com → create sheet "Prixna Autopilot"
      → copy its ID from URL (.../d/SHEET_ID/...).
   2. Go to https://script.google.com → New project → paste this file
      → set SHEET_ID below → Save.
   3. Deploy → New deployment → Web app → Execute as: Me,
      Who has access: Anyone → Deploy → copy /exec URL.
   4. In website js/config.js set: sheetsEndpoint: "YOUR /exec URL".
   5. Test: open /exec URL → should show {"ok":true,...}.
      Then submit a website form → row appears in Sheet in seconds.
   6. OPTIONAL WhatsApp auto-send (Meta Cloud API):
      - https://developers.facebook.com → create App → add WhatsApp
        product → get WHATSAPP_TOKEN + PHONE_NUMBER_ID.
      - Paste below, redeploy (New version). Customer + staff get
        auto WhatsApp. Without it, staff still gets email + Sheet row,
        and website gives 1-tap wa.me alert link (zero-config fallback).
   ============================================================ */

var SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
var STAFF_EMAIL = "info@prixnaitsolution.com.np";
var STAFF_WHATSAPP = "9779813714582"; // country code + number, no +

// Optional: Meta WhatsApp Cloud API (leave "" to skip auto-send)
var WHATSAPP_TOKEN = "";
var WHATSAPP_PHONE_ID = "";

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true, service: "prixna-autopilot",
    time: new Date().toISOString(),
    sheetLinked: SHEET_ID.indexOf("PASTE") === -1
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var events = body.events || [{ type: body.type || "lead", payload: body.payload || body, ts: new Date().toISOString() }];
    var sheet = SpreadsheetApp.openById(SHEET_ID);
    var results = events.map(function (ev) { return handleEvent(sheet, ev); });
    return json({ ok: true, handled: results.length, results: results });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function handleEvent(sheet, ev) {
  var type = String(ev.type || "lead").toLowerCase();
  var p = ev.payload || {};
  var row, tab;
  if (type.indexOf("voice") > -1 || type.indexOf("call") > -1) {
    logVoiceCall({ id: p.id||ev.id||"", createdAt: p.createdAt||ev.ts||"", phone: p.phone||p.from||"", duration: p.duration||"", summary: p.summary||p.message||"", recording: p.recording||"", page: ev.page||"voice" });
    notify("📞 Voice call " + (p.id||""), line(p) + "\n" + ((p.summary||p.message||"").toString().slice(0,400)), p, /urgent/i.test(p.summary||p.message||""));
  } else if (type.indexOf("stock") > -1) {
    tab = getTab(sheet, "Stock", ["created","product","left","threshold","ref","note"]);
    row = [p.createdAt||ev.ts||"", p.name||p.id||"", p.left!=null?p.left:"", p.lowAt!=null?p.lowAt:"", p.ref||"", (p.low ? "LOW STOCK" : "movement")];
    appendRow(tab, row);
    if (p.low) notify("⚠️ Low stock: " + (p.name||p.id), "Left: " + p.left + " (reorder at " + p.lowAt + ") · ref " + (p.ref||""), p, true);
  } else if (type.indexOf("feedback") > -1) {    tab = getTab(sheet, "Feedback", ["id","created","ref","rating","name","comment","page"]);
    row = [p.id||"", p.createdAt||ev.ts||"", p.ref||"", p.rating||"", p.name||"", (p.comment||"").toString().slice(0,500), ev.page||""];
    appendRow(tab, row);
    if (+p.rating <= 3) notify("⚠️ Low rating " + (p.rating||"") + "/5 (" + (p.ref||"") + ")", line(p) + "\n" + (p.comment||""), p, true);
  } else if (type.indexOf("quote") > -1 && type.indexOf("bulkquote") === -1) {
    tab = getTab(sheet, "Quotes", ["id","created","lead_ref","customer","phone","total","advance","status","page"]);
    row = [p.id||"", p.createdAt||ev.ts||"", p.leadRef||"", p.name||p.customer||"", p.phone||"", p.total||"", p.advance||"", p.status||"sent", ev.page||""];
    appendRow(tab, row);
    notify("🧾 Quote " + (p.id||"") + " (" + (p.status||"sent") + ")", line(p) + " | Total NPR " + (p.total||"-") + " | Advance NPR " + (p.advance||"-"), p, false);
  } else if (type.indexOf("bulk") > -1) {    tab = getTab(sheet, "BulkQuotes", ["id","created","name","phone","business","items","page"]);
    row = [p.id||"", p.createdAt||ev.ts||"", p.name||"", p.phone||"", p.company||p.business||"", (p.message||p.items||"").toString().slice(0,800), ev.page||""];
    appendRow(tab, row);
    notify("📦 New BULK enquiry " + (p.id||""), line(p) + " [" + (p.company||"") + "]\n" + (p.message||""), p, false);
  } else if (type.indexOf("book") > -1) {
    tab = getTab(sheet, "Bookings", ["id","created","name","phone","service","slot/day","time/location","status","page"]);
    row = [p.id||"", p.createdAt||ev.ts||"", p.name||"", p.phone||"", p.service||"", p.day||p.slot||"", p.time||p.location||"", p.status||"confirmed", ev.page||""];
    appendRow(tab, row);
    notify("📅 New BOOKING " + (p.id||""), line(p) + "\nSlot: " + (p.day||"") + " " + (p.time||p.slot||""), p);
  } else if (type.indexOf("ticket") > -1 || type.indexOf("support") > -1 || type.indexOf("handoff") > -1 || type.indexOf("recover") > -1) {
    tab = getTab(sheet, "Tickets", ["id","created","phone","device","problem","priority","status","page"]);
    row = [p.id||"", p.createdAt||ev.ts||"", p.phone||p.name||"", p.device||p.service||"", (p.problem||p.message||"").toString().slice(0,500), p.priority||"Medium", p.status||"open", ev.page||""];
    appendRow(tab, row);
    var urgent = /urgent/i.test(p.priority||"") || /urgent|stopped|down/i.test(p.problem||p.message||"");
    notify((urgent ? "🚨 URGENT TICKET " : "🎫 New TICKET ") + (p.id||""), line(p) + "\n" + (p.device||"") + ": " + (p.problem||p.message||""), p, urgent);
  } else {
    tab = getTab(sheet, "Leads", ["id","created","name","phone","email","service","message","page"]);
    row = [p.id||"", p.createdAt||ev.ts||"", p.name||"", p.phone||"", p.email||"", p.service||"", (p.message||"").toString().slice(0,500), ev.page||""];
    appendRow(tab, row);
    notify("✨ New LEAD " + (p.id||""), line(p) + "\n" + (p.service||"") + ": " + (p.message||""), p, false);
  }
  // customer confirmation (only if phone looks valid + WhatsApp configured)
  if (p.phone && WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) {
    sendWhatsApp(p.phone, "Namaste" + (p.name ? " " + p.name.split(" ")[0] : "") + " 🙏 Prixna IT Solution received your request (" + (p.id||"") + "). Our team calls back Sun–Fri 9:30–6:30. Ref: " + (p.id||"") + " — Koteshwor, Kathmandu.");
  }
  return { type: type, id: p.id || "" };
}

function line(p) { return "Name: " + (p.name||"-") + " | Phone: " + (p.phone||"-"); }

function notify(subject, body, p, urgent) {
  try {
    MailApp.sendEmail(STAFF_EMAIL, (urgent ? "🚨 " : "") + subject,
      body + "\n\nTime: " + new Date().toLocaleString("en-GB", { timeZone: "Asia/Kathmandu" }) + " NPT");
  } catch (e) {}
  // staff WhatsApp alert (auto if configured, else email+sheet is the record)
  if (WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) {
    sendWhatsApp(STAFF_WHATSAPP, subject + "\n" + body);
  }
}

function sendWhatsApp(to, text) {
  try {
    var num = String(to).replace(/\D/g, "");
    if (num.length === 10) num = "977" + num; // Nepal default
    UrlFetchApp.fetch("https://graph.facebook.com/v21.0/" + WHATSAPP_PHONE_ID + "/messages", {
      method: "post", contentType: "application/json",
      headers: { Authorization: "Bearer " + WHATSAPP_TOKEN },
      payload: JSON.stringify({ messaging_product: "whatsapp", to: num, type: "text", text: { body: text.slice(0,1000) } }),
      muteHttpExceptions: true
    });
  } catch (e) {}
}

function getTab(sheet, name, headers) {
  var tab = sheet.getSheetByName(name);
  if (!tab) { tab = sheet.insertSheet(name); tab.appendRow(headers); }
  return tab;
}
function appendRow(tab, row) {
  tab.appendRow(row);
  try {
    tab.getRange(tab.getLastRow(), 1, 1, row.length).setBackground(tab.getLastRow() % 2 ? "#FFFFFF" : "#F3F6FD");
  } catch (e) {}
}
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- Phase 3: voice call logs ---------- */
function logVoiceCall(call) {
  // Called from handleEvent when type is voice/call. Kept separate so call history is queryable.
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID);
    var tab = getTab(sheet, "CallLogs", ["id","created","from","duration","summary","recording","page"]);
    appendRow(tab, [call.id||"", call.createdAt||new Date().toISOString(), call.phone||call.from||"",
      call.duration||"", (call.summary||"").toString().slice(0,800), call.recording||"", call.page||"voice"]);
  } catch (e) {}
}

/* ---------- Phase 3: daily digest (time-trigger 18:35 NPT daily) ----------
   Setup: Apps Script → Triggers → Add → sendDailyDigest → Day timer → 6pm-7pm.
   Sends one email: today's counts + Urgent opens + tomorrow's bookings. */
function sendDailyDigest() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID);
    var today = Utilities.formatDate(new Date(), "Asia/Kathmandu", "yyyy-MM-dd");
    var parts = ["Prixna autopilot — daily digest " + today + "\n"];
    ["Leads", "Tickets", "Bookings", "BulkQuotes", "Quotes", "Stock", "CallLogs"].forEach(function (name) {
      var tab = sheet.getSheetByName(name);
      if (!tab) { parts.push(name + ": 0"); return; }
      var vals = tab.getDataRange().getValues();
      var rows = vals.slice(1).filter(function (r) { return String(r[1]||"").indexOf(today) > -1; });
      parts.push(name + " today: " + rows.length);
      rows.slice(0, 12).forEach(function (r) { parts.push("  • " + r.slice(0, 5).join(" | ")); });
    });
    // Urgent open tickets (all time, capped)
    var ttab = sheet.getSheetByName("Tickets");
    if (ttab) {
      var all = ttab.getDataRange().getValues().slice(1);
      var urg = all.filter(function (r) { return /urgent/i.test(String(r[5]||"")) && !/closed/i.test(String(r[6]||"")); }).slice(0, 10);
      if (urg.length) { parts.push("\n🚨 URGENT OPEN:"); urg.forEach(function (r) { parts.push("  • " + r.slice(0,5).join(" | ")); }); }
    }
    // Feedback avg today + low ratings needing recovery
    var ftab = sheet.getSheetByName("Feedback");
    if (ftab && ftab.getLastRow() > 1) {
      var frows = ftab.getDataRange().getValues().slice(1).filter(function (r) { return String(r[1]||"").indexOf(today) > -1 && +r[3] > 0; });
      if (frows.length) {
        var sum = 0; frows.forEach(function (r) { sum += (+r[3] || 0); });
        parts.push("\n⭐ Feedback today: " + (sum / frows.length).toFixed(1) + "/5 across " + frows.length);
        frows.filter(function (r) { return +r[3] <= 3; }).slice(0, 8).forEach(function (r) { parts.push("  ⚠️ " + r.slice(0, 6).join(" | ")); });
      }
    }
    parts.push("\nSheet: https://docs.google.com/spreadsheets/d/" + SHEET_ID);
    MailApp.sendEmail(STAFF_EMAIL, "📊 Prixna daily digest " + today, parts.join("\n").slice(0, 8000));
    if (WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) sendWhatsApp(STAFF_WHATSAPP, parts.join("\n").slice(0, 900));
  } catch (e) {}
}

/* ---------- Phase 4: reminder sweeper (hourly trigger) + missed-call log ----------
   Setup: Triggers → checkReminders → Hour timer.
   Voice-webhook bookings store ISO start in the page/note col ("starts: ...");
   widget bookings store free text and are skipped (customer still gets manual confirm). */
function checkReminders() {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID);
    var tab = sheet.getSheetByName("Bookings");
    if (!tab) return;
    var vals = tab.getDataRange().getValues();
    if (vals.length < 2) return;
    if (String(vals[0][9] || "") !== "Reminded") tab.getRange(1, 10).setValue("Reminded");
    var now = new Date().getTime();
    for (var i = 1; i < vals.length; i++) {
      var row = vals[i];
      var done = String(row[9] || "");
      var m = String(row[8] || "").match(/starts: (\S+)/);
      if (!m || done.indexOf("2h") > -1) continue;
      var hrs = (new Date(m[1]).getTime() - now) / 3600000;
      var phone = String(row[3] || "").replace(/\D/g, "");
      var id = String(row[0] || "");
      var slot = "";
      if (hrs >= 22 && hrs <= 26 && done.indexOf("24h") === -1) slot = "24h";
      else if (hrs >= 1.5 && hrs <= 2.5) slot = "2h";
      if (!slot || !phone) continue;
      var text = "Namaste 🙏 Reminder: Prixna visit (" + id + ") for " + row[4] + " is on " + row[5] + " " + row[6] + ". Reply YES to confirm or call +977 9813714582.";
      try { MailApp.sendEmail(STAFF_EMAIL, "⏰ Reminder " + slot + " " + id, text + "\nCustomer: " + phone); } catch (e) {}
      if (WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) sendWhatsApp(phone, text);
      tab.getRange(i + 1, 10).setValue((done ? done + "," : "") + slot);
    }
  } catch (e) {}
}

function logMissedCall(from, note) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID);
    var tab = getTab(sheet, "MissedCalls", ["id", "created", "from", "note", "called_back"]);
    var id = "M-" + new Date().getTime().toString(36).toUpperCase();
    appendRow(tab, [id, new Date().toISOString(), from, note || "", ""]);
    notify("📵 Missed call " + id, "From: " + from + "\n" + (note || ""), { phone: from }, false);
  } catch (e) {}
}
