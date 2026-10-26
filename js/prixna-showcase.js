/* Prixna — NEW unified Showcase (hardware + software), independent of old shop list.
   Seed: data/showcase.json. Live overrides: localStorage prixna_showcase_v1.
   Admin adds/edits items from dashboard.html / admin.html. AI + showcase.html read via this lib. */
(function () {
  "use strict";
  var LS_KEY = "prixna_showcase_v1";
  var SEED_URL = "data/showcase.json";
  var cache = null;

  function loadLocal() {
    try { var v = JSON.parse(localStorage.getItem(LS_KEY) || "null"); return v && Array.isArray(v.items) ? v : null; }
    catch (e) { return null; }
  }
  function saveLocal(obj) { try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); } catch (e) {} }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function npr(n) {
    try { return "Rs. " + Math.round(+n || 0).toLocaleString("en-IN"); }
    catch (e) { return "Rs. " + n; }
  }
  function priceLabel(it) {
    if (it.priceNPR && +it.priceNPR > 0) return npr(it.priceNPR);
    return it.priceNote || "Price on request";
  }
  function fetchSeed() {
    return fetch(SEED_URL + "?_t=" + Date.now()).then(function (r) {
      if (!r.ok) throw 0;
      return r.json();
    }).then(function (j) {
      if (j && Array.isArray(j.items)) return j;
      throw 0;
    });
  }
  function init() {
    var local = loadLocal();
    if (local) { cache = local; renderMounts(); return Promise.resolve(cache); }
    return fetchSeed().then(function (seed) {
      cache = seed; saveLocal(seed); renderMounts(); return cache;
    }).catch(function () { cache = { items: [] }; renderMounts(); return cache; });
  }
  function data() {
    if (cache) return cache;
    var local = loadLocal();
    if (local) { cache = local; return cache; }
    return { items: [] };
  }
  function items() { return (data().items || []).filter(function (x) { return x.active !== false; }); }
  function byType(t) { return items().filter(function (x) { return (x.type || "") === t; }); }
  function featured() { return items().filter(function (x) { return x.featured; }); }
  function get(id) {
    var all = items();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function findByText(text) {
    var t = (text || "").toLowerCase();
    var words = t.replace(/[^\w\u0900-\u097F\s]/g, " ").split(/\s+/).filter(function (w) { return w.length > 2; });
    if (!words.length) return [];
    var scored = [];
    items().forEach(function (it) {
      var hay = ((it.name || "") + " " + (it.tagline || "") + " " + (it.category || "") + " " + (it.type || "")).toLowerCase();
      var s = 0;
      words.forEach(function (w) { if (hay.indexOf(w) > -1) s += 2; });
      if (s > 0) scored.push({ it: it, s: s });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, 4).map(function (x) { return x.it; });
  }

  function detailLink(it) {
    if (it.type === "software" && it.demoId) return "demo.html?product=" + encodeURIComponent(it.demoId);
    return "showcase.html?item=" + encodeURIComponent(it.id);
  }
  function orderLink(it) {
    return "checkout.html?funnel=" + encodeURIComponent(it.type === "software" ? "software" : it.type === "service" ? "service" : "hardware") + "&product=" + encodeURIComponent(it.name);
  }

  function cardHTML(it) {
    var badge = it.type === "software" ? "💼 SOFTWARE" : it.type === "service" ? "🛠️ SERVICE" : "📦 HARDWARE";
    var img = it.image
      ? '<img src="' + esc(it.image) + '" alt="' + esc(it.name) + '" loading="lazy" style="border-radius:10px;border:1px solid var(--line);width:100%;max-height:170px;object-fit:cover">'
      : '<div style="font-size:2.4rem">' + esc(it.icon || "📦") + "</div>";
    var cta = it.type === "software" && it.demoId
      ? '<a class="btn btn-primary btn-sm" href="demo.html?product=' + esc(it.demoId) + '" data-track="show_demo_' + esc(it.id) + '">🎬 Watch Demo</a>'
      : '<a class="btn btn-primary btn-sm" href="' + orderLink(it) + '" data-track="show_order_' + esc(it.id) + '">🛒 Order / Enquire</a>';
    return '<article class="card prod-card" style="display:flex;flex-direction:column">' +
      '<span class="chip" style="align-self:flex-start">' + badge + "</span>" +
      '<div style="margin:10px 0">' + img + "</div>" +
      "<h3>" + esc(it.name) + "</h3>" +
      '<p class="small muted">' + esc(it.tagline || "") + "</p>" +
      '<p><b>' + esc(priceLabel(it)) + "</b> <span class='small muted'>· " + esc(it.stock || "") + "</span></p>" +
      '<div class="btn-row" style="margin-top:auto">' + cta +
      '<a class="btn btn-outline btn-sm" href="showcase.html?item=' + esc(it.id) + '" data-track="show_view_' + esc(it.id) + '">Details</a></div></article>';
  }

  function renderMounts() {
    document.querySelectorAll("[data-showcase-mount]").forEach(function (mount) {
      var type = mount.getAttribute("data-type") || "all";
      var limit = parseInt(mount.getAttribute("data-limit") || "0", 10);
      var list = type === "all" ? items() : byType(type);
      if (mount.getAttribute("data-featured") === "1") list = list.filter(function (x) { return x.featured; });
      if (limit > 0) list = list.slice(0, limit);
      mount.dataset.rendered = "1";
      if (!list.length) {
        mount.innerHTML = '<div class="placeholder">New items coming soon — <a href="quote.html">ask us directly</a>.</div>';
        return;
      }
      mount.innerHTML = list.map(cardHTML).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", function () { init(); });
  window.addEventListener("storage", function (e) {
    if (e.key === LS_KEY) { try { cache = JSON.parse(e.newValue || "null"); } catch (x) { cache = null; } renderMounts(); }
  });

  window.PRIXNA_SHOWCASE = {
    LS_KEY: LS_KEY, init: init, data: data, items: items, byType: byType,
    featured: featured, get: get, findByText: findByText,
    priceLabel: priceLabel, detailLink: detailLink, orderLink: orderLink,
    esc: esc, renderMounts: renderMounts,
    saveAll: function (obj) { cache = obj; saveLocal(obj); renderMounts(); }
  };
})();
