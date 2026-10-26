/* Prixna — NEW Showcase manager for staff (dashboard.html + admin.html).
   Mount: <div data-showcase-admin-mount></div>. Key: prixna_showcase_v1.
   Add hardware/software items with price, stock, demo link, plans — no code changes. */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return "show-" + Date.now().toString(36) + Math.floor(Math.random() * 99); }
  function list() {
    try {
      if (window.PRIXNA_SHOWCASE) return window.PRIXNA_SHOWCASE.data().items || [];
    } catch (e) {}
    try { return (JSON.parse(localStorage.getItem("prixna_showcase_v1") || "{}") || {}).items || []; }
    catch (x) { return []; }
  }
  function save(items) {
    if (window.PRIXNA_SHOWCASE) window.PRIXNA_SHOWCASE.saveAll({ updatedAt: new Date().toISOString(), items: items });
    else { try { localStorage.setItem("prixna_showcase_v1", JSON.stringify({ items: items })); } catch (e) {} }
  }
  function download(name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function rowHTML(x) {
    return '<div class="lead-row" data-show="' + esc(x.id) + '">' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>' + esc(x.icon || "📦") + " " + esc(x.name) + "</b>" +
      '<span class="pill ' + (x.active === false ? "st-lost" : "st-won") + '">' + esc(x.type || "hardware") + (x.active === false ? " · hidden" : "") + "</span>" +
      '<span class="small muted">' + esc(x.id) + "</span></div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:10px">' +
      '<select class="inp js-f js-type" aria-label="Type"><option value="hardware"' + (x.type === "hardware" ? " selected" : "") + '>📦 Hardware</option><option value="software"' + (x.type === "software" ? " selected" : "") + '>💼 Software</option><option value="service"' + (x.type === "service" ? " selected" : "") + '>🛠️ Service</option></select>' +
      '<input class="inp js-f js-name" value="' + esc(x.name) + '" aria-label="Name" placeholder="Item name">' +
      '<input class="inp js-f js-icon" value="' + esc(x.icon || "") + '" aria-label="Icon" placeholder="Icon emoji">' +
      "</div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">' +
      '<input class="inp js-f js-tag" value="' + esc(x.tagline || "") + '" aria-label="Tagline" placeholder="Tagline">' +
      '<input class="inp js-f js-cat" value="' + esc(x.category || "") + '" aria-label="Category" placeholder="Category">' +
      "</div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:8px">' +
      '<input class="inp js-f js-price" type="number" min="0" value="' + esc(x.priceNPR || 0) + '" aria-label="Price NPR (0 = quote)" placeholder="Price NPR (0 = quote)">' +
      '<input class="inp js-f js-pnote" value="' + esc(x.priceNote || "") + '" aria-label="Price note" placeholder="Price note if 0">' +
      '<input class="inp js-f js-stock" value="' + esc(x.stock || "") + '" aria-label="Stock" placeholder="in / out / quote / demo">' +
      "</div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">' +
      '<input class="inp js-f js-feat" value="' + esc((x.features || []).join(" | ")) + '" aria-label="Features" placeholder="Features separated by |">' +
      '<input class="inp js-f js-demo" value="' + esc(x.demoId || "") + '" aria-label="Demo id" placeholder="Demo id (e.g. jigri-erp) — software only">' +
      "</div>" +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">' +
      '<label class="small"><input type="checkbox" class="js-f js-active" ' + (x.active === false ? "" : "checked") + '> Visible</label>' +
      '<label class="small"><input type="checkbox" class="js-f js-feat2" ' + (x.featured ? "checked" : "") + '> Featured</label>' +
      '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="showcase.html?item=' + esc(x.id) + '">🔗 Preview</a>' +
      '<button class="btn btn-outline btn-sm js-copy" type="button">📋 Copy link</button>' +
      '<button class="btn btn-outline btn-sm js-del" type="button" style="color:var(--red-600)">Delete</button>' +
      '<span class="small muted js-saved"></span>' +
      "</div></div>";
  }
  function collect(row) {
    function v(sel) { var el = row.querySelector(sel); return el ? el.value : ""; }
    return {
      id: row.getAttribute("data-show"),
      type: (function () { var el = row.querySelector(".js-type"); return el ? el.value : "hardware"; })(),
      name: v(".js-name"), icon: v(".js-icon") || "📦",
      tagline: v(".js-tag"), category: v(".js-cat"),
      image: "",
      priceNPR: Math.max(0, +v(".js-price") || 0),
      priceNote: v(".js-pnote"),
      stock: v(".js-stock") || "in",
      features: v(".js-feat").split("|").map(function (s) { return s.trim(); }).filter(Boolean),
      demoId: v(".js-demo").trim(),
      planIds: keepPlans(row.getAttribute("data-show")),
      active: !!row.querySelector(".js-active").checked,
      featured: !!row.querySelector(".js-feat2").checked
    };
  }
  function keepPlans(id) {
    var all = list();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i].planIds || [];
    return [];
  }
  function render() {
    document.querySelectorAll("[data-showcase-admin-mount]").forEach(function (mount) {
      var items = list();
      mount.innerHTML =
        '<div class="card" style="border-color:#BBF7D0;background:#F0FDF4">' +
        "<b>✨ New showcase — add hardware & software here (replaces old shop list).</b><br>" +
        '<span class="small">Add items with price (0 = quote), stock, demo link + featured flag. Shows on <b>showcase.html</b> + AI recommendations instantly. Export JSON for backup.</span>' +
        '<div class="btn-row" style="margin-top:10px">' +
        '<button class="btn btn-primary btn-sm" data-act="add-hw" type="button">＋ Add hardware</button>' +
        '<button class="btn btn-primary btn-sm" data-act="add-sw" type="button">＋ Add software</button>' +
        '<button class="btn btn-outline btn-sm" data-act="export" type="button">⬇ Export JSON</button>' +
        '<button class="btn btn-outline btn-sm" data-act="reset" type="button">↺ Reload seed</button>' +
        "</div></div>" +
        '<div style="margin-top:12px;display:flex;flex-direction:column;gap:10px">' +
        (items.length ? items.map(rowHTML).join("") : '<div class="placeholder">No items yet — click “Add hardware / software”.</div>') +
        "</div>";
      bind(mount);
    });
  }
  function bind(mount) {
    mount.querySelectorAll("[data-act]").forEach(function (b) {
      b.onclick = function () {
        var act = b.getAttribute("data-act"), items = list();
        if (act === "add-hw" || act === "add-sw") {
          var isSw = act === "add-sw";
          items.unshift({ id: uid(), type: isSw ? "software" : "hardware", name: isSw ? "New Software" : "New Hardware", icon: isSw ? "💼" : "📦", tagline: "", category: "", image: "", priceNPR: 0, priceNote: "Price on request", stock: isSw ? "demo" : "in", features: [], demoId: "", planIds: [], active: true, featured: false });
          save(items); render();
        } else if (act === "export") {
          download("prixna-showcase.json", JSON.stringify({ updatedAt: new Date().toISOString(), items: items }, null, 2));
        } else if (act === "reset") {
          if (!confirm("Reload showcase seed? Your edits will be replaced.")) return;
          fetch("data/showcase.json?_t=" + Date.now()).then(function (r) { return r.json(); }).then(function (j) {
            if (j && j.items) { save(j.items); render(); }
          }).catch(function () { alert("Could not load seed file."); });
        }
      };
    });
    var timers = {};
    mount.querySelectorAll(".lead-row[data-show]").forEach(function (row) {
      var id = row.getAttribute("data-show");
      row.querySelectorAll(".js-f").forEach(function (inp) {
        inp.addEventListener(inp.type === "checkbox" || inp.tagName === "SELECT" ? "change" : "input", function () {
          clearTimeout(timers[id]);
          timers[id] = setTimeout(function () {
            var items = list(), idx = -1;
            for (var i = 0; i < items.length; i++) if (items[i].id === id) idx = i;
            if (idx < 0) return;
            items[idx] = Object.assign({}, items[idx], collect(row));
            save(items);
            var s = row.querySelector(".js-saved");
            if (s) s.textContent = "✓ saved";
            try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("showcase_admin_save", id); } catch (e) {}
          }, 600);
        });
      });
      var del = row.querySelector(".js-del");
      if (del) del.onclick = function () {
        if (!confirm("Delete this showcase item?")) return;
        save(list().filter(function (x) { return x.id !== id; }));
        render();
      };
      var cp = row.querySelector(".js-copy");
      if (cp) cp.onclick = function () {
        var link = location.origin + location.pathname.replace(/[^/]*$/, "") + "showcase.html?item=" + encodeURIComponent(id);
        try {
          if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { cp.textContent = "✓ Copied!"; setTimeout(function () { cp.textContent = "📋 Copy link"; }, 1500); });
          else prompt("Copy showcase link:", link);
        } catch (e) { prompt("Copy showcase link:", link); }
      };
    });
  }
  function boot() {
    function go() {
      try {
        if (window.PRIXNA_SHOWCASE) {
          if ((window.PRIXNA_SHOWCASE.data().items || []).length) render();
          else window.PRIXNA_SHOWCASE.init().then(render);
        } else render();
      } catch (e) { render(); }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    window.addEventListener("storage", function (e) { if (e.key === "prixna_showcase_v1") render(); });
  }
  boot();
})();
