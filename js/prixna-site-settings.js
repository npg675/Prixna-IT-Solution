/* Prixna — Site settings override layer (admin-editable, no code changes).
   Key: prixna_site_settings_v1. Every getter falls back to window.PRIXNA (js/config.js).
   Pages + AI must read contacts/offers/links/AI-sales-settings via this lib — never hardcode. */
(function () {
  "use strict";
  var LS_KEY = "prixna_site_settings_v1";

  function overrides() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function cfg() { return window.PRIXNA || {}; }
  function pick(key, fb) {
    var o = overrides();
    if (o[key] != null && String(o[key]).trim() !== "") return o[key];
    var c = cfg();
    if (c[key] != null && String(c[key]).trim() !== "") return c[key];
    return fb;
  }

  function getAll() {
    var c = cfg(), o = overrides();
    return {
      phoneDisplay: pick("phoneDisplay", c.phoneDisplay || "+977 9813714582"),
      phoneHref: pick("phoneHref", c.phoneHref || "tel:+9779813714582"),
      whatsappNumber: pick("whatsappNumber", c.whatsappNumber || "9779813714582"),
      email: pick("email", c.email || "info@prixnaitsolution.com.np"),
      address: pick("address", c.address || "Koteshwor-32, Kathmandu, Nepal"),
      hours: pick("hours", c.hours || "Sun–Fri, 9:30 AM – 6:30 PM (Sat: closed)"),
      mapsUrl: pick("mapsUrl", c.mapsUrl || ""),
      reviewUrl: pick("reviewUrl", c.reviewUrl || ""),
      facebook: pick("facebook", c.facebook || ""),
      staffWhatsApp: pick("staffWhatsApp", c.staffWhatsApp || c.whatsappNumber || "9779813714582"),
      staffEmail: pick("staffEmail", c.staffEmail || c.email || "info@prixnaitsolution.com.np"),
      bookingLink: o.bookingLink || "quote.html",
      offerTitle: o.offerTitle || "",
      offerText: o.offerText || "",
      offerActive: !!o.offerActive,
      landingHeadline: o.landingHeadline || "",
      landingSub: o.landingSub || "",
      aiSales: Object.assign(
        { enabled: true, recommendEnabled: true, demoNudge: true, abandonNudgeHrs: 24, renewalDays: 30, handoffOnUncertain: true },
        o.aiSales || {}
      ),
      payment: Object.assign({}, c.payment || {}, o.payment || {})
    };
  }
  function waLink(text) {
    var s = getAll();
    return "https://wa.me/" + String(s.whatsappNumber).replace(/\D/g, "") + "?text=" + encodeURIComponent(text || "Hello Prixna IT Solution!");
  }
  function paymentMethods() {
    // Only methods the admin actually configured. Never invent gateways.
    var s = getAll(), p = s.payment || {}, out = [];
    if (p.esewaId) out.push({ id: "esewa", label: "eSewa (" + p.esewaId + ")" });
    if (p.bankAccount) out.push({ id: "bank", label: "Bank transfer — " + (p.bankName || "Bank") + " A/C " + p.bankAccount });
    out.push({ id: "qr", label: "Fonepay QR / mobile banking (ask staff for current QR)" });
    out.push({ id: "cash", label: "Cash on visit / delivery (Valley)" });
    return out;
  }

  function save(patch) {
    var o = overrides();
    Object.keys(patch || {}).forEach(function (k) { o[k] = patch[k]; });
    try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch (e) {}
    return getAll();
  }

  window.PRIXNA_SETTINGS = {
    LS_KEY: LS_KEY, getAll: getAll, get: pick, save: save,
    waLink: waLink, paymentMethods: paymentMethods
  };
})();
