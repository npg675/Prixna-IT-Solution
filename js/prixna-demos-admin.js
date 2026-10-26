/* Prixna — Demo Videos manager for staff (dashboard.html + admin.html).
   Mount: <div data-demos-admin-mount></div> — auto-rendered.
   Stores to localStorage prixna_demos_v1 (same key demo.html + AI read).
   Fields editable: name, tagline, youtubeUrl / videoFile, duration, audience, features, consultService, planHint, active, featured. */
(function () {
  "use strict";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return "demo-" + Date.now().toString(36) + Math.floor(Math.random() * 99); }

  function getDemos() {
    try {
      if (window.PRIXNA_DEMOS) return window.PRIXNA_DEMOS.list();
    } catch (e) {}
    try { return JSON.parse(localStorage.getItem("prixna_demos_v1") || "[]"); } catch (e) { return []; }
  }
  function saveDemos(arr) {
    if (window.PRIXNA_DEMOS) window.PRIXNA_DEMOS.saveAll(arr);
    else { try { localStorage.setItem("prixna_demos_v1", JSON.stringify(arr)); } catch (e) {} }
  }
  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function rowHTML(d) {
    var hasVideo = !!((d.youtubeUrl || "").trim() || (d.videoFile || "").trim());
    return '<div class="lead-row" data-demo="' + esc(d.id) + '">' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>' + esc(d.icon || "💼") + " " + esc(d.name) + "</b>" +
      '<span class="pill ' + (d.active === false ? "st-lost" : hasVideo ? "st-won" : "st-new") + '">' +
      (d.active === false ? "hidden" : hasVideo ? "live ▶️" : "no video yet") + "</span>" +
      '<span class="small muted">' + esc(d.id) + " · " + esc(d.category || "") + "</span></div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr;margin-top:10px">' +
      '<input class="inp js-f js-name" value="' + esc(d.name) + '" aria-label="Product name" placeholder="Product name">' +
      '<input class="inp js-f js-icon" value="' + esc(d.icon || "") + '" aria-label="Icon emoji" placeholder="Icon emoji">' +
      "</div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">' +
      '<input class="inp js-f js-yt" value="' + esc(d.youtubeUrl || "") + '" aria-label="YouTube link" placeholder="🎬 YouTube link — paste here (e.g. https://youtu.be/XXXX)">' +
      '<input class="inp js-f js-file" value="' + esc(d.videoFile || "") + '" aria-label="MP4 file" placeholder="Or direct mp4 URL / file path (optional)">' +
      "</div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:8px">' +
      '<input class="inp js-f js-tag" value="' + esc(d.tagline || "") + '" aria-label="Tagline" placeholder="Tagline">' +
      '<input class="inp js-f js-dur" value="' + esc(d.duration || "") + '" aria-label="Duration" placeholder="Duration (e.g. 3 min demo)">' +
      '<input class="inp js-f js-aud" value="' + esc(d.audience || "") + '" aria-label="Audience" placeholder="Audience">' +
      "</div>" +
      '<div class="f-grid" style="grid-template-columns:1fr 1fr;margin-top:8px">' +
      '<input class="inp js-f js-feat" value="' + esc((d.features || []).join(" | ")) + '" aria-label="Features" placeholder="Features separated by | ">' +
      '<input class="inp js-f js-plan" value="' + esc(d.planHint || "") + '" aria-label="Plan hint" placeholder="Subscription hint (NPR…)">' +
      "</div>" +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">' +
      '<label class="small"><input type="checkbox" class="js-f js-active" ' + (d.active === false ? "" : "checked") + '> Visible on site</label>' +
      '<label class="small"><input type="checkbox" class="js-f js-feat2" ' + (d.featured ? "checked" : "") + '> Featured</label>' +
      '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="demo.html?product=' + esc(d.id) + '">🔗 Preview demo page</a>' +
      '<button class="btn btn-outline btn-sm js-copy" type="button">📋 Copy share link</button>' +
      '<button class="btn btn-outline btn-sm js-del" type="button" style="color:var(--red-600)">Delete</button>' +
      '<span class="small muted js-saved"></span>' +
      "</div></div>";
  }

  function render() {
    document.querySelectorAll("[data-demos-admin-mount]").forEach(function (mount) {
      var demos = getDemos();
      mount.innerHTML =
        '<div class="card" style="border-color:#BBF7D0;background:#F0FDF4">' +
        "<b>🎬 Demo Videos — edit YouTube links here, site + AI update instantly.</b><br>" +
        '<span class="small">Paste a YouTube link per product → customers get a beautiful demo page (<b>demo.html?product=…</b>) with video → free consultation → subscription. Use <b>Copy share link</b> to send on WhatsApp/Facebook. Changes save on this device; export JSON for backup.</span>' +
        '<div class="btn-row" style="margin-top:10px">' +
        '<button class="btn btn-primary btn-sm" data-act="add" type="button">＋ Add product</button>' +
        '<button class="btn btn-outline btn-sm" data-act="export" type="button">⬇ Export JSON</button>' +
        '<label class="btn btn-outline btn-sm" style="cursor:pointer">⬆ Import JSON<input type="file" data-act-file hidden accept=".json"></label>' +
        '<button class="btn btn-outline btn-sm" data-act="reset" type="button">↺ Reload seed</button>' +
        "</div></div>" +
        '<div style="margin-top:12px;display:flex;flex-direction:column;gap:10px">' +
        (demos.length ? demos.map(rowHTML).join("") : '<div class="placeholder">No demos yet — click “Add product”.</div>') +
        "</div>";
      bind(mount);
    });
  }

  function collectRow(row) {
    function v(sel) { var el = row.querySelector(sel); return el ? el.value : ""; }
    return {
      id: row.getAttribute("data-demo"),
      name: v(".js-name"),
      icon: v(".js-icon") || "💼",
      youtubeUrl: v(".js-yt").trim(),
      videoFile: v(".js-file").trim(),
      tagline: v(".js-tag"),
      duration: v(".js-dur"),
      audience: v(".js-aud"),
      features: v(".js-feat").split("|").map(function (s) { return s.trim(); }).filter(Boolean),
      planHint: v(".js-plan"),
      consultService: (function () {
        var cur = null;
        try {
          var all = getDemos();
          for (var i = 0; i < all.length; i++) if (all[i].id === row.getAttribute("data-demo")) cur = all[i].consultService;
        } catch (e) {}
        return cur || "Business Software / SaaS Demo";
      })(),
      category: (function () {
        try {
          var all2 = getDemos();
          for (var j = 0; j < all2.length; j++) if (all2[j].id === row.getAttribute("data-demo")) return all2[j].category || "Software";
        } catch (e) {}
        return "Software";
      })(),
      active: !!row.querySelector(".js-active").checked,
      featured: !!row.querySelector(".js-feat2").checked
    };
  }

  function bind(mount) {
    mount.querySelectorAll("[data-act]").forEach(function (b) {
      b.onclick = function () {
        var act = b.getAttribute("data-act");
        var demos = getDemos();
        if (act === "add") {
          demos.push({ id: uid(), name: "New Software Product", icon: "💼", tagline: "", category: "Software", youtubeUrl: "", videoFile: "", duration: "3 min demo", features: [], audience: "", consultService: "Business Software / SaaS Demo", planHint: "", active: true, featured: false });
          saveDemos(demos); render();
        } else if (act === "export") {
          download("prixna-demos.json", JSON.stringify({ updatedAt: new Date().toISOString(), demos: demos }, null, 2), "application/json");
        } else if (act === "reset") {
          if (!confirm("Reload seed demos from data/software-demos.json? Your edits will be replaced.")) return;
          fetch("data/software-demos.json?_t=" + Date.now()).then(function (r) { return r.json(); }).then(function (j) {
            if (j && j.demos) { saveDemos(j.demos); render(); }
          }).catch(function () { alert("Could not load seed file."); });
        }
      };
    });
    var fileInp = mount.querySelector("[data-act-file]");
    if (fileInp) fileInp.onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var j = JSON.parse(r.result);
          var arr = Array.isArray(j) ? j : j.demos;
          if (!Array.isArray(arr)) throw 0;
          saveDemos(arr); render();
        } catch (err) { alert("Not a valid demos export."); }
      };
      r.readAsText(f); e.target.value = "";
    };
    // autosave on edit (debounced per row)
    var timers = {};
    mount.querySelectorAll(".lead-row[data-demo]").forEach(function (row) {
      var id = row.getAttribute("data-demo");
      row.querySelectorAll(".js-f").forEach(function (inp) {
        inp.addEventListener(inp.type === "checkbox" ? "change" : "input", function () {
          clearTimeout(timers[id]);
          timers[id] = setTimeout(function () {
            var demos = getDemos();
            var idx = -1;
            for (var i = 0; i < demos.length; i++) if (demos[i].id === id) idx = i;
            if (idx < 0) return;
            demos[idx] = Object.assign({}, demos[idx], collectRow(row));
            saveDemos(demos);
            var s = row.querySelector(".js-saved");
            if (s) {
              s.textContent = "✓ saved " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
              // refresh pill without full rerender
              setTimeout(render, 900);
            }
            try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("demo_admin_save", id); } catch (e) {}
          }, 600);
        });
      });
      var del = row.querySelector(".js-del");
      if (del) del.onclick = function () {
        if (!confirm("Delete this demo product?")) return;
        saveDemos(getDemos().filter(function (d) { return d.id !== id; }));
        render();
      };
      var cp = row.querySelector(".js-copy");
      if (cp) cp.onclick = function () {
        var link = location.origin + location.pathname.replace(/[^/]*$/, "") + "demo.html?product=" + encodeURIComponent(id);
        try {
          if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { cp.textContent = "✓ Copied!"; setTimeout(function () { cp.textContent = "📋 Copy share link"; }, 1500); });
          else { prompt("Copy this demo link:", link); }
        } catch (e) { prompt("Copy this demo link:", link); }
        try { if (window.PRIXNA_LOG) window.PRIXNA_LOG("demo_link_copy", id); } catch (e2) {}
      };
    });
  }

  function boot() {
    if (!document.querySelector("[data-demos-admin-mount]")) {
      // auto-inject into dashboard + admin if script included but mount missing
      var dashPipe = document.getElementById("dash-pipe");
      if (dashPipe && !document.querySelector("[data-demos-admin-mount]")) {
        var card = document.createElement("div");
        card.className = "card";
        card.innerHTML = "<b>🎬 Demo Videos</b><p class='small muted'>YouTube links editable here — site, demo page & AI update instantly.</p><div data-demos-admin-mount></div>";
        dashPipe.closest(".card").after(card);
      }
      var leadList = document.getElementById("lead-list");
      if (leadList && !document.querySelector("[data-demos-admin-mount]")) {
        var wrap = document.createElement("div");
        wrap.innerHTML = "<h2 style='margin-top:44px'>🎬 Demo Videos (software)</h2><div data-demos-admin-mount></div>";
        leadList.after(wrap);
      }
    }
    function ensureDemosThenRender() {
      try {
        if (window.PRIXNA_DEMOS) {
          if (window.PRIXNA_DEMOS.list().length) render();
          else window.PRIXNA_DEMOS.init().then(render);
        } else {
          render();
          setTimeout(function () { if (window.PRIXNA_DEMOS) window.PRIXNA_DEMOS.init().then(render); }, 800);
        }
      } catch (e) { render(); }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensureDemosThenRender);
    else ensureDemosThenRender();
    window.addEventListener("storage", function (e) { if (e.key === "prixna_demos_v1") render(); });
  }
  boot();
})();
