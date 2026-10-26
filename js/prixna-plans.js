/* Prixna — Subscription plans library (admin-editable, no hardcoded prices).
   Seed: data/software-plans.json. Live overrides: localStorage prixna_plans_v1.
   Always read prices/features via this lib — never hardcode in pages or AI. */
(function () {
  "use strict";
  var LS_KEY = "prixna_plans_v1";
  var SEED_URL = "data/software-plans.json";
  var cache = null;

  function loadLocal() {
    try { var v = JSON.parse(localStorage.getItem(LS_KEY) || "null"); return v && Array.isArray(v.plans) ? v : null; }
    catch (e) { return null; }
  }
  function saveLocal(obj) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function npr(n) {
    try { return "Rs. " + Math.round(+n || 0).toLocaleString("en-IN"); }
    catch (e) { return "Rs. " + n; }
  }
  function priceLabel(p) {
    if (p.priceNPR && +p.priceNPR > 0) return npr(p.priceNPR) + (p.billing ? " / " + p.billing : "");
    return p.priceNote || "Quoted in NPR after free consultation";
  }
  function fetchSeed() {
    return fetch(SEED_URL + "?_t=" + Date.now()).then(function (r) {
      if (!r.ok) throw 0;
      return r.json();
    }).then(function (j) {
      if (j && Array.isArray(j.plans)) return j;
      throw 0;
    });
  }
  function init() {
    var local = loadLocal();
    if (local) { cache = local; return Promise.resolve(cache); }
    return fetchSeed().then(function (seed) {
      cache = seed; saveLocal(seed); return cache;
    }).catch(function () { cache = { plans: [], trial: { enabled: false } }; return cache; });
  }
  function data() {
    if (cache) return cache;
    var local = loadLocal();
    if (local) { cache = local; return cache; }
    return { plans: [], trial: { enabled: false } };
  }
  function plans() { return (data().plans || []).filter(function (p) { return p.active !== false; }); }
  function forProduct(productId) {
    return plans().filter(function (p) { return (p.product || "") === productId; });
  }
  function get(id) {
    var all = plans();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function trial() { return data().trial || { enabled: false }; }

  function checkoutLink(plan) {
    return "checkout.html?plan=" + encodeURIComponent(plan.id) + "&product=" + encodeURIComponent(plan.product || "");
  }

  document.addEventListener("DOMContentLoaded", function () { init(); });
  window.addEventListener("storage", function (e) {
    if (e.key === LS_KEY) { try { cache = JSON.parse(e.newValue || "null"); } catch (x) { cache = null; } }
  });

  window.PRIXNA_PLANS = {
    LS_KEY: LS_KEY, init: init, data: data, plans: plans,
    forProduct: forProduct, get: get, trial: trial,
    priceLabel: priceLabel, checkoutLink: checkoutLink, esc: esc,
    saveAll: function (obj) { cache = obj; saveLocal(obj); }
  };
})();
