/* Prixna — Orders (hardware + subscriptions + services) with verify-before-activate.
   Key: prixna_orders_v1.
   SECURITY RULES (do not weaken):
   - Creating an order NEVER activates anything. Status starts at "draft".
   - Only a staff verification (verify() with verifier note) may set "paid_verified".
   - Pages/AI must gate activation text on isVerified(order), never on payment_claimed.
   - Idempotency: same key twice returns the SAME order (no duplicate charge/order).
   - Payment methods shown to customers must come from PRIXNA_SETTINGS.paymentMethods().
   All events also queue to PRIXNA_NOTIFY (Sheets backend) like leads/bookings. */
(function () {
  "use strict";
  var LS_KEY = "prixna_orders_v1";
  var STATUSES = ["draft", "checkout_abandoned", "payment_claimed", "verifying", "paid_verified", "confirmed", "onboarded", "cancelled"];

  function load() {
    try { var v = JSON.parse(localStorage.getItem(LS_KEY) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, 300))); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid(p) {
    return (p || "O-") + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 1296).toString(36).toUpperCase();
  }
  function notify(type, payload) {
    try { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push(type, payload); } catch (e) {}
    try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("order_" + type, (payload && payload.id) || ""); } catch (e2) {}
  }

  function findByKey(key) {
    if (!key) return null;
    var all = load();
    for (var i = 0; i < all.length; i++) if (all[i].idemKey === key) return all[i];
    return null;
  }
  function get(id) {
    var all = load();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  /* Create (or return existing for same idempotency key). Never activates. */
  function create(o) {
    o = o || {};
    if (o.idemKey) {
      var dup = findByKey(o.idemKey);
      if (dup) return { order: dup, duplicate: true };
    }
    var order = {
      id: uid("O-"),
      idemKey: o.idemKey || uid("K-"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      funnel: o.funnel || "hardware", // hardware | software | service
      items: o.items || [],
      planId: o.planId || "",
      product: o.product || "",
      amount: Math.max(0, +o.amount || 0),
      name: o.name || "", phone: o.phone || "", email: o.email || "",
      location: o.location || "", note: o.note || "",
      source: o.source || "",
      recommendation: o.recommendation || "",
      consent: !!o.consent,
      status: "draft",
      payment: null, // {method, txnRef, amount, claimedAt}
      verified: null, // {by, at, note} — ONLY set by verify()
      history: [{ ts: new Date().toISOString(), note: "Order created (" + (o.funnel || "hardware") + "). Awaiting checkout." }]
    };
    var all = load(); all.unshift(order); save(all);
    notify("order", { id: order.id, name: order.name, phone: order.phone, funnel: order.funnel, product: order.product, planId: order.planId, amount: order.amount, status: order.status, source: order.source });
    try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("funnel_stage", order.funnel + ":checkout_started/" + order.id); } catch (e) {}
    return { order: order, duplicate: false };
  }

  function touch(id, fn) {
    var all = load();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) {
        fn(all[i]);
        all[i].updatedAt = new Date().toISOString();
        save(all);
        return all[i];
      }
    }
    return null;
  }

  function markAbandoned(id) {
    return touch(id, function (o) {
      if (o.status === "draft") {
        o.status = "checkout_abandoned";
        o.history.push({ ts: new Date().toISOString(), note: "Checkout abandoned (no payment claim yet)." });
        notify("order-abandoned", { id: o.id, name: o.name, phone: o.phone, funnel: o.funnel, amount: o.amount });
        try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("funnel_stage", o.funnel + ":checkout_abandoned/" + o.id); } catch (e) {}
      }
    });
  }

  /* Customer claims they paid. Does NOT verify. Method must be admin-configured. */
  function claimPayment(id, claim) {
    claim = claim || {};
    var allowed = [];
    try { allowed = window.PRIXNA_SETTINGS ? window.PRIXNA_SETTINGS.paymentMethods().map(function (m) { return m.id; }) : ["esewa", "bank", "qr", "cash"]; }
    catch (e) { allowed = ["esewa", "bank", "qr", "cash"]; }
    if (allowed.indexOf(claim.method) === -1) return { error: "Payment method not available. Please contact staff." };
    if (!String(claim.txnRef || "").trim()) return { error: "Please enter your transaction reference / remarks." };
    var Stellar = null;
    var updated = touch(id, function (o) {
      if (o.status === "paid_verified" || o.status === "confirmed" || o.status === "onboarded") return;
      o.payment = { method: claim.method, txnRef: String(claim.txnRef).trim().slice(0, 120), amount: Math.max(0, +claim.amount || o.amount || 0), claimedAt: new Date().toISOString() };
      o.status = "payment_claimed";
      o.history.push({ ts: new Date().toISOString(), note: "Payment claimed via " + claim.method + " ref " + o.payment.txnRef + ". Awaiting STAFF verification — not activated." });
      Stellar = o;
    });
    if (updated && Stellar) {
      notify("payment-claim", { id: updated.id, name: updated.name, phone: updated.phone, method: claim.method, txnRef: claim.txnRef, amount: updated.payment.amount, status: "payment_claimed" });
      try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("funnel_stage", updated.funnel + ":payment_claimed/" + updated.id); } catch (e) {}
      return { order: updated };
    }
    return { error: "Order not found or already completed." };
  }

  /* STAFF ONLY: verify a claimed payment. Requires verifier note. Idempotent. */
  function verify(id, verifierNote) {
    if (!String(verifierNote || "").trim()) return { error: "Verifier note required (who confirmed, where)." };
    var out = null;
    var updated = touch(id, function (o) {
      if (o.status === "paid_verified" || o.status === "confirmed" || o.status === "onboarded") { out = { order: o, duplicate: true }; return; }
      if (!o.payment) return;
      o.status = "paid_verified";
      o.verified = { by: "staff", at: new Date().toISOString(), note: String(verifierNote).trim().slice(0, 300) };
      o.history.push({ ts: new Date().toISOString(), note: "Payment VERIFIED by staff: " + o.verified.note });
      out = { order: o };
    });
    if (out) {
      if (!out.duplicate) {
        notify("sale-verified", { id: out.order.id, name: out.order.name, phone: out.order.phone, funnel: out.order.funnel, amount: out.order.payment ? out.order.payment.amount : out.order.amount, status: "paid_verified" });
        try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("funnel_stage", out.order.funnel + ":sale_verified/" + out.order.id); } catch (e) {}
      }
      return out;
    }
    return { error: "Order has no payment claim to verify." };
  }

  function setStatus(id, status, note) {
    if (STATUSES.indexOf(status) === -1) return null;
    if ((status === "paid_verified" || status === "confirmed" || status === "onboarded")) return null; // must go through verify()/confirm flow
    return touch(id, function (o) {
      o.status = status;
      o.history.push({ ts: new Date().toISOString(), note: note || ("Status → " + status) });
    });
  }

  /* After verification, staff confirms + starts onboarding. */
  function confirm(id, note) {
    return touch(id, function (o) {
      if (!o.verified) return;
      if (o.status === "paid_verified") {
        o.status = "confirmed";
        o.history.push({ ts: new Date().toISOString(), note: note || "Order confirmed. Onboarding started." });
        notify("order-confirmed", { id: o.id, name: o.name, phone: o.phone, funnel: o.funnel, status: "confirmed" });
      }
    });
  }

  function isVerified(o) { return !!(o && o.verified && o.status !== "cancelled"); }

  document.addEventListener("DOMContentLoaded", function () {
    // Abandoned-checkout sweep: drafts older than N hrs (default 24, admin-tunable) → abandoned once.
    try {
      var hrs = 24;
      try {
        var s = window.PRIXNA_SETTINGS ? window.PRIXNA_SETTINGS.getAll() : null;
        if (s && s.aiSales && +s.aiSales.abandonNudgeHrs > 0) hrs = +s.aiSales.abandonNudgeHrs;
      } catch (e) {}
      var cutoff = Date.now() - hrs * 3600e3;
      var all = load(), changed = false;
      all.forEach(function (o) {
        if (o.status === "draft" && new Date(o.createdAt).getTime() < cutoff) {
          o.status = "checkout_abandoned";
          o.history.push({ ts: new Date().toISOString(), note: "Auto-marked abandoned after " + hrs + "h without payment claim." });
          changed = true;
        }
      });
      if (changed) save(all);
    } catch (e) {}
  });

  window.PRIXNA_ORDERS = {
    LS_KEY: LS_KEY, STATUSES: STATUSES,
    load: load, get: get, create: create, findByKey: findByKey,
    markAbandoned: markAbandoned, claimPayment: claimPayment,
    verify: verify, confirm: confirm, setStatus: setStatus, isVerified: isVerified, esc: esc
  };
})();
