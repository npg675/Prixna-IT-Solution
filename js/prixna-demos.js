/* Prixna — Software Demo library (local-first, admin-editable).
   Seed: data/software-demos.json. Live overrides: localStorage prixna_demos_v1.
   Admin edits from dashboard.html / admin.html. AI + demo.html read from here. */
(function () {
  "use strict";
  var LS_KEY = "prixna_demos_v1";
  var SEED_URL = "data/software-demos.json";
  var cache = null;

  function loadLocal() {
    try { var v = JSON.parse(localStorage.getItem(LS_KEY) || "null"); return Array.isArray(v) ? v : null; }
    catch (e) { return null; }
  }
  function saveLocal(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function youtubeId(url) {
    if (!url) return "";
    var m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    m = String(url).match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : "";
  }
  function embedUrl(d) {
    var id = youtubeId(d.youtubeUrl || "");
    if (id) return "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&modestbranding=1";
    if (d.videoFile) return d.videoFile;
    return "";
  }
  function thumbUrl(d) {
    var id = youtubeId(d.youtubeUrl || "");
    if (id) return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
    return "";
  }
  function demoLink(d) {
    return "demo.html?product=" + encodeURIComponent(d.id);
  }
  function consultLink(d) {
    return "quote.html?service=" + encodeURIComponent(d.consultService || "Business Software / SaaS Demo") + "&product=" + encodeURIComponent(d.id);
  }
  function waLink(d) {
    var num = (window.PRIXNA || {}).whatsappNumber || "9779813714582";
    var txt = "Hello Prixna IT Solution! I watched the demo for " + d.name + " (" + demoLink(d) + ") and I am interested. Please arrange a free consultation.";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(txt);
  }

  function fetchSeed() {
    return fetch(SEED_URL + "?_t=" + Date.now()).then(function (r) {
      if (!r.ok) throw 0;
      return r.json();
    }).then(function (j) {
      if (j && Array.isArray(j.demos)) return j.demos;
      throw 0;
    });
  }

  function listSync() {
    if (cache) return cache;
    var local = loadLocal();
    if (local) { cache = local; return cache; }
    return [];
  }

  function init(cb) {
    var local = loadLocal();
    if (local) { cache = local; if (cb) cb(cache); renderMounts(); return Promise.resolve(cache); }
    return fetchSeed().then(function (seed) {
      cache = seed;
      saveLocal(seed);
      if (cb) cb(cache);
      renderMounts();
      return cache;
    }).catch(function () {
      cache = [];
      if (cb) cb(cache);
      renderMounts();
      return cache;
    });
  }

  function get(id) {
    var all = cache || loadLocal() || [];
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function activeOnly() {
    return listSync().filter(function (d) { return d.active !== false; });
  }

  /* ---------- storefront card grid: <div data-demos-mount></div> ---------- */
  function cardHTML(d) {
    var hasVideo = !!(youtubeId(d.youtubeUrl || "") || d.videoFile);
    var th = thumbUrl(d);
    return '<article class="card prod-card rv vis" style="display:flex;flex-direction:column">' +
      '<div style="font-size:2rem">' + esc(d.icon || "💼") + '</div>' +
      '<h3 style="margin:8px 0 4px">' + esc(d.name) + '</h3>' +
      '<p class="small muted" style="margin:0 0 8px">' + esc(d.tagline || "") + '</p>' +
      (th ? '<a href="' + demoLink(d) + '" data-track="demo_thumb_' + esc(d.id) + '"><img src="' + th + '" alt="' + esc(d.name) + ' demo thumbnail" loading="lazy" style="border-radius:10px;border:1px solid var(--line);width:100%"></a>' : "") +
      '<p class="small" style="margin:10px 0">' +
      (hasVideo ? "▶️ " + esc(d.duration || "Video demo") : "🎬 <b>Demo video coming soon</b> — request a live demo instead") +
      ' · 👥 ' + esc(d.audience || "") + '</p>' +
      '<div class="btn-row" style="margin-top:auto">' +
      '<a class="btn btn-primary btn-sm" href="' + demoLink(d) + '" data-track="demo_watch_' + esc(d.id) + '">🎬 Watch Demo</a>' +
      '<a class="btn btn-outline btn-sm" href="' + consultLink(d) + '" data-track="demo_consult_' + esc(d.id) + '">Free Consultation</a>' +
      '</div></article>';
  }

  function renderMounts() {
    document.querySelectorAll("[data-demos-mount]").forEach(function (mount) {
      if (mount.dataset.rendered === "1" && mount.dataset.count === String(listSync().length)) return;
      var all = activeOnly();
      var limit = parseInt(mount.getAttribute("data-limit") || "0", 10);
      var items = limit > 0 ? all.slice(0, limit) : all;
      mount.dataset.rendered = "1";
      mount.dataset.count = String(listSync().length);
      if (!items.length) {
        mount.innerHTML = '<div class="placeholder">Demo videos are being prepared — <a href="quote.html?service=Business%20Software%20%2F%20SaaS%20Demo">request a live demo</a> instead.</div>';
        return;
      }
      mount.innerHTML = items.map(cardHTML).join("");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); });
  } else {
    init();
  }
  window.addEventListener("storage", function (e) {
    if (e.key === LS_KEY) { cache = loadLocal() || []; renderMounts(); }
  });

  window.PRIXNA_DEMOS = {
    LS_KEY: LS_KEY, init: init, list: listSync, listAsync: init,
    get: get, active: activeOnly,
    saveAll: function (arr) { cache = arr; saveLocal(arr); renderMounts(); },
    youtubeId: youtubeId, embedUrl: embedUrl, thumbUrl: thumbUrl,
    demoLink: demoLink, consultLink: consultLink, waLink: waLink, esc: esc,
    renderMounts: renderMounts
  };
})();
