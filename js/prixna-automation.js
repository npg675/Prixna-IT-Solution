/* Prixna — Consent-based marketing automation queue (no auto-sending).
   Key: prixna_automation_v1.
   Schedules (all require consent flag on the source lead/order):
   - demo_reminder: demo_view event with no consultation lead within 48h
   - abandoned_checkout: order status checkout_abandoned, consented
   - welcome: order just paid_verified (once)
   - renewal: paid_verified subscription older than settings renewalDays
   - retention: won lead with no activity in 60 days (light nudge)
   Staff sends via generated wa.me links in dashboard. All sends logged to prixna_events. */
(function () {
  "use strict";
  var LS_KEY = "prixna_automation_v1";

  function load(k, fb) {
    try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? fb : v; }
    catch (e) { return fb; }
  }
  function saveQueue(q) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(q.slice(0, 200))); } catch (e) {}
  }
  function loadQueue() { return load(LS_KEY, []); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function hasConsentFor(phone) {
    if (!phone) return false;
    var digits = String(phone).replace(/\D/g, "");
    var leads = load("prixna_leads_v1", []);
    for (var i = 0; i < leads.length; i++) {
      if (String(leads[i].phone || "").replace(/\D/g, "") === digits) return true; // lead exists only via consent checkbox
    }
    var orders = load("prixna_orders_v1", []);
    for (var j = 0; j < orders.length; j++) {
      if (String(orders[j].phone || "").replace(/\D/g, "") === digits && orders[j].consent) return true;
    }
    return false;
  }
  function alreadyQueued(kind, ref) {
    var q = loadQueue();
    for (var i = 0; i < q.length; i++) if (q[i].kind === kind && q[i].ref === ref) return true;
    return false;
  }
  function enqueue(item) {
    if (!item || !item.kind || !item.ref) return null;
    if (alreadyQueued(item.kind, item.ref)) return null;
    if (!hasConsentFor(item.phone)) return null;
    item.id = "A-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 1296).toString(36).toUpperCase();
    item.createdAt = new Date().toISOString();
    item.status = "pending";
    var q = loadQueue(); q.unshift(item); saveQueue(q);
    try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("automation_queued", item.kind + "/" + item.ref); } catch (e) {}
    return item;
  }
  function waSendLink(phone, text) {
    return "https://wa.me/" + String(phone || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
  }

  function sweep() {
    try {
      var settings = window.PRIXNA_SETTINGS ? window.PRIXNA_SETTINGS.getAll() : { aiSales: { renewalDays: 30 } };
      var renewalDays = (settings.aiSales && +settings.aiSales.renewalDays) || 30;
      var events = load("prixna_events", []);
      var leads = load("prixna_leads_v1", []);
      var orders = load("prixna_orders_v1", []);
      var now = Date.now();

      // 1. demo reminders: demo_view without consultation lead in 48h
      events.filter(function (e) { return e.event === "demo_view"; }).slice(0, 30).forEach(function (e) {
        var demoId = String(e.detail || "");
        var recentConsult = leads.some(function (l) {
          return /demo|consult/i.test(l.service || "") && (now - new Date(l.createdAt).getTime()) < 48 * 3600e3;
        });
        if (!recentConsult && !alreadyQueued("demo_reminder", demoId + ":" + (e.ts || "").slice(0, 10))) {
          var prof = currentProfile();
          if (prof.phone) enqueue({
            kind: "demo_reminder", ref: demoId + ":" + (e.ts || "").slice(0, 10),
            phone: prof.phone, name: prof.name,
            message: "Namaste " + (prof.name.split(" ")[0] || "") + " 🙏 Did the software demo help? Reply DEMO for the video link again, or YES for a free consultation this week — Prixna IT Solution.",
            demo: demoId
          });
        }
      });

      // 2. abandoned checkout → follow-up (consented orders only)
      orders.filter(function (o) { return o.status === "checkout_abandoned"; }).slice(0, 20).forEach(function (o) {
        enqueue({
          kind: "abandoned_checkout", ref: o.id, phone: o.phone, name: o.name,
          message: "Namaste " + ((o.name || "").split(" ")[0] || "") + " 🙏 Your order " + o.id + " (" + (o.product || o.planId || "items") + ") is still reserved. Complete payment when ready, or reply HELP — Prixna IT Solution.",
          order: o.id
        });
      });

      // 3. welcome on verified sale (once per order)
      orders.filter(function (o) { return o.status === "paid_verified" || o.status === "confirmed" || o.status === "onboarded"; }).slice(0, 20).forEach(function (o) {
        enqueue({
          kind: "welcome", ref: o.id, phone: o.phone, name: o.name,
          message: "Welcome " + ((o.name || "").split(" ")[0] || "") + "! 🎉 Payment verified for " + o.id + ". Onboarding: " + (o.funnel === "software" ? "setup + training call within 1 working day." : o.funnel === "hardware" ? "delivery/pickup confirmation shortly." : "our engineer will contact you for next steps.") + " — Prixna IT Solution.",
          order: o.id
        });
      });

      // 4. renewal reminders for software subs
      orders.filter(function (o) {
        return o.funnel === "software" && o.verified && (now - new Date(o.verified.at).getTime()) > renewalDays * 864e3;
      }).slice(0, 20).forEach(function (o) {
        enqueue({
          kind: "renewal", ref: o.id, phone: o.phone, name: o.name,
          message: "Namaste " + ((o.name || "").split(" ")[0] || "") + " 🙏 Your plan for " + o.id + " renews soon. Reply RENEW for the current NPR plan, or YES for a quick review call — Prixna IT Solution.",
          order: o.id
        });
      });

      // 5. retention: won leads quiet 60 days
      leads.filter(function (l) { return l.status === "won" && (now - new Date(l.createdAt).getTime()) > 60 * 864e5; }).slice(0, 10).forEach(function (l) {
        enqueue({
          kind: "retention", ref: l.id, phone: l.phone, name: l.name,
          message: "Namaste " + ((l.name || "").split(" ")[0] || "") + " 🙏 Checking in — everything running well? Reply SUPPORT anytime, or REVIEW our Google page ⭐ — Prixna IT Solution.",
          lead: l.id
        });
      });
    } catch (e) {}
  }

  function currentProfile() {
    var name = "", phone = "";
    try {
      name = localStorage.getItem("prixna_customer_name") || "";
      phone = localStorage.getItem("prixna_customer_phone") || "";
    } catch (e) {}
    if (!phone) {
      var leads = load("prixna_leads_v1", []);
      if (leads.length) { name = name || leads[0].name || ""; phone = leads[0].phone || ""; }
    }
    return { name: name, phone: phone };
  }

  function markSent(id) {
    var q = loadQueue();
    for (var i = 0; i < q.length; i++) {
      if (q[i].id === id) {
        q[i].status = "sent";
        q[i].sentAt = new Date().toISOString();
        try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("automation_sent", q[i].kind + "/" + q[i].ref); } catch (e) {}
      }
    }
    saveQueue(q);
  }

  document.addEventListener("DOMContentLoaded", function () { setTimeout(sweep, 3000); });
  window.addEventListener("storage", function (e) {
    if (e.key === "prixna_orders_v1" || e.key === "prixna_events") setTimeout(sweep, 1500);
  });

  window.PRIXNA_AUTOMATION = {
    LS_KEY: LS_KEY, queue: loadQueue, enqueue: enqueue,
    sweep: sweep, markSent: markSent, waSendLink: waSendLink, esc: esc
  };
})();
