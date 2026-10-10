/* Prixna IT Solution — full website admin panel (device-local CMS).
   Tabs: dashboard, leads, products, testimonials, homepage content,
   site settings, backup & publish. Changes apply instantly in this
   browser; use Backup → downloads + hosting upload to publish them.
   Do NOT use on shared computers for customer data. */
(function () {
  "use strict";
  var L = window.PRIXNA_LEADS;
  var CMS = window.PRIXNA_CMS;
  var D = window.PRIXNA_DATA;
  var C = window.PRIXNA;
  var STATUSES = ["new", "contacted", "qualified", "won", "lost"];
  var STOCKS = [["in", "✅ In stock"], ["low", "⚠️ Low stock"], ["out", "❌ Out of stock"], ["quote", "💬 Price on request"]];
  var TM_SOURCES = ["Google review", "Facebook review", "Direct feedback", "Other"];

  function $(id) { return document.getElementById(id); }
  function esc(s) { return L.esc(s); }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return iso; }
  }
  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function slugify(s) {
    return String(s || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "item";
  }
  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  }

  /* ================= PIN gate + tabs ================= */
  function initShell() {
    var pin = null;
    try { pin = localStorage.getItem("prixna_admin_pin") || ""; } catch (e) {}
    var ok = false;
    try { ok = sessionStorage.getItem("prixna_admin_ok") === "1"; } catch (e) {}
    if (pin && !ok) {
      $("pin-gate").hidden = false;
      var go = function () {
        if ($("pin-input").value === pin) {
          try { sessionStorage.setItem("prixna_admin_ok", "1"); } catch (e) {}
          $("pin-gate").hidden = true; $("admin-body").hidden = false;
        } else { $("pin-err").style.display = "block"; }
      };
      $("pin-go").addEventListener("click", go);
      $("pin-input").addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
      $("pin-input").focus();
    } else { $("admin-body").hidden = false; }
    var btns = Array.prototype.slice.call(document.querySelectorAll(".tab-btn"));
    function activate(name) {
      btns.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === name); });
      document.querySelectorAll(".tab-panel").forEach(function (p) {
        p.classList.toggle("on", p.id === "tab-" + name);
      });
      try { history.replaceState(null, "", "#" + name); } catch (e) {}
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { activate(b.getAttribute("data-tab")); }); });
    document.querySelectorAll("[data-goto]").forEach(function (a) {
      a.addEventListener("click", function () { activate(a.getAttribute("data-goto")); });
    });
    var h = (location.hash || "").replace("#", "");
    if (h && $("tab-" + h)) activate(h);
  }

  /* ================= Dashboard + Leads (ported, IDs unchanged) ================= */
  function csv(leads) {
    var rows = [["id", "created", "name", "phone", "email", "company", "location", "service", "status", "followUp", "assignee", "message"]];
    leads.forEach(function (l) {
      rows.push([l.id, l.createdAt, l.name, l.phone, l.email, l.company, l.location, l.service, l.status, l.followUp, l.assignee, (l.message || "").replace(/\n/g, " | ")]);
    });
    return rows.map(function (r) { return r.map(function (c) { return '"' + String(c || "").replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
  }
  function renderLeads() {
    var leads = L.load();
    var now = new Date(); var week = new Date(now - 7 * 864e5);
    $("k-total").textContent = leads.length;
    $("k-week").textContent = leads.filter(function (l) { return new Date(l.createdAt) >= week; }).length;
    $("k-new").textContent = leads.filter(function (l) { return l.status === "new"; }).length;
    $("k-won").textContent = leads.filter(function (l) { return l.status === "won"; }).length;
    var fStatus = $("f-status").value;
    var fSvc = $("f-service").value;
    var q = ($("f-q").value || "").toLowerCase();
    var list = leads.filter(function (l) {
      return (!fStatus || l.status === fStatus) &&
        (!fSvc || (l.service || "").indexOf(fSvc) > -1) &&
        (!q || ((l.name || "") + " " + (l.phone || "") + " " + (l.company || "") + " " + (l.message || "")).toLowerCase().indexOf(q) > -1);
    });
    var wrap = $("lead-list");
    $("lead-count").textContent = list.length + " shown";
    if (!list.length) {
      wrap.innerHTML = '<div class="placeholder">No leads match. New enquiries from any site form appear here automatically.<br><br><a class="btn btn-outline btn-sm" href="quote.html">Open the consultation form</a></div>';
      return;
    }
    wrap.innerHTML = list.map(function (l) {
      var wa = window.PRIXNA_WA("Hello " + (l.name || "") + ", this is Prixna IT Solution following up on your enquiry (" + l.id + ") regarding " + (l.service || "your requirement") + ".");
      var hist = (l.history || []).map(function (h) { return "<li class='small'>" + esc(h.ts ? fmtDate(h.ts) : "") + " — " + esc(h.note) + "</li>"; }).join("");
      return '<div class="lead-row" data-id="' + esc(l.id) + '">' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>' + esc(l.name || "—") + "</b>" +
        '<span class="pill st-' + esc(l.status || "new") + '">' + esc(l.status || "new") + "</span>" +
        '<span class="small muted">' + esc(l.id) + " · " + esc(fmtDate(l.createdAt)) + "</span></div>" +
        '<p class="small" style="margin:8px 0">📞 <a href="tel:' + esc((l.phone || "").replace(/\s/g, "")) + '">' + esc(l.phone || "—") + "</a>" +
        (l.email ? ' · ✉️ <a href="mailto:' + esc(l.email) + '">' + esc(l.email) + "</a>" : "") +
        (l.company ? " · 🏢 " + esc(l.company) : "") + (l.location ? " · 📍 " + esc(l.location) : "") + "<br>🧰 " + esc(l.service || "—") +
        (l.message ? "<br>💬 " + esc(l.message) : "") + "</p>" +
        (hist ? "<ul style='margin:0 0 10px;padding-left:20px;color:var(--muted)'>" + hist + "</ul>" : "") +
        '<div class="f-grid" style="grid-template-columns:1fr 1fr 1fr">' +
        '<select class="inp js-status" aria-label="Status">' + STATUSES.map(function (s) { return '<option value="' + s + '"' + (l.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select>" +
        '<input class="inp js-follow" type="date" value="' + esc(l.followUp || "") + '" aria-label="Follow-up date">' +
        '<input class="inp js-assign" placeholder="Assignee" value="' + esc(l.assignee || "") + '" aria-label="Assignee">' +
        "</div>" +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
        '<input class="inp js-note" placeholder="Add follow-up note…" style="flex:1;min-width:200px" aria-label="Add note">' +
        '<button class="btn btn-outline btn-sm js-add-note">Add note</button>' +
        '<a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="' + wa + '">WhatsApp lead</a>' +
        '<button class="btn btn-outline btn-sm js-del">Delete</button>' +
        "</div></div>";
    }).join("");
    wrap.querySelectorAll(".lead-row").forEach(function (row) {
      var id = row.getAttribute("data-id");
      function mutate(fn) {
        var arr = L.load();
        var it = arr.find(function (x) { return x.id === id; });
        if (!it) return;
        fn(it); L.saveAll(arr); renderLeads();
      }
      row.querySelector(".js-status").addEventListener("change", function (e) {
        mutate(function (l) { l.status = e.target.value; (l.history = l.history || []).push({ ts: new Date().toISOString(), note: "Status → " + e.target.value }); });
      });
      row.querySelector(".js-follow").addEventListener("change", function (e) { mutate(function (l) { l.followUp = e.target.value; }); });
      row.querySelector(".js-assign").addEventListener("change", function (e) { mutate(function (l) { l.assignee = e.target.value; }); });
      row.querySelector(".js-add-note").addEventListener("click", function () {
        var v = row.querySelector(".js-note").value.trim();
        if (v) mutate(function (l) { (l.history = l.history || []).push({ ts: new Date().toISOString(), note: v }); });
      });
      row.querySelector(".js-del").addEventListener("click", function () {
        if (confirm("Delete this lead permanently?")) { L.saveAll(L.load().filter(function (x) { return x.id !== id; })); renderLeads(); }
      });
    });
  }
  function renderEvents() {
    var ev = [];
    try { ev = JSON.parse(localStorage.getItem("prixna_events") || "[]"); } catch (e) {}
    var counts = {};
    ev.forEach(function (x) { counts[x.event] = (counts[x.event] || 0) + 1; });
    var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 14);
    $("event-stats").innerHTML = keys.length
      ? keys.map(function (k) { return "<tr><td>" + esc(k) + "</td><td><b>" + counts[k] + "</b></td></tr>"; }).join("")
      : '<tr><td colspan="2" class="muted">No tracked events yet.</td></tr>';
  }
  function wipeLeads() {
    if (confirm("Export first! Erase ALL leads on this device?") && confirm("Really erase everything?")) {
      localStorage.removeItem("prixna_leads_v1"); renderLeads();
    }
  }

  /* ================= Products ================= */
  function persistProducts() {
    var ov = CMS.load(); ov.products = D.products; CMS.save(ov);
    renderDashBits();
  }
  function renderProducts() {
    var wrap = $("product-list");
    var cats = [];
    D.products.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
    $("prod-count").textContent = D.products.length + " products";
    wrap.innerHTML = D.products.map(function (p) {
      return '<div class="adm-row" data-id="' + esc(p.id) + '">' +
        '<input class="inp adm-ico jp-icon" value="' + esc(p.icon || "📦") + '" maxlength="4" aria-label="Icon" title="Icon emoji">' +
        '<div><input class="inp jp-name" value="' + esc(p.name) + '" aria-label="Product name" style="font-weight:700;margin-bottom:6px">' +
        '<input class="inp jp-desc" value="' + esc(p.desc || "") + '" aria-label="Description" placeholder="Short description"></div>' +
        '<div><input class="inp jp-cat hide-t" list="catlist" value="' + esc(p.category || "") + '" aria-label="Category" style="margin-bottom:6px">' +
        '<input class="inp jp-warranty" value="' + esc(p.warranty || "") + '" aria-label="Warranty note"></div>' +
        '<div><input class="inp jp-price" type="number" min="0" step="1" value="' + (p.price || 0) + '" aria-label="Price NPR" title="Price NPR (0 = on request)" style="margin-bottom:6px">' +
        '<input class="inp jp-mrp hide-t" type="number" min="0" step="1" value="' + (p.mrp || 0) + '" aria-label="MRP NPR" title="MRP NPR"></div>' +
        '<select class="inp jp-stock" aria-label="Stock status">' + STOCKS.map(function (s) { return '<option value="' + s[0] + '"' + (p.stock === s[0] ? " selected" : "") + ">" + s[1] + "</option>"; }).join("") + "</select>" +
        '<input class="inp jp-id hide-t" value="' + esc(p.id) + '" aria-label="Product ID (slug)" title="Unique ID">' +
        '<button class="btn btn-outline btn-sm jp-del" style="color:var(--red-600)" aria-label="Delete product">🗑</button>' +
        "</div>";
    }).join("") + '<datalist id="catlist">' + cats.map(function (c) { return "<option value=\"" + esc(c) + "\">"; }).join("") + "</datalist>";
    wrap.querySelectorAll(".adm-row").forEach(function (row) {
      var id = row.getAttribute("data-id");
      function prod() { return D.products.find(function (x) { return x.id === id; }); }
      row.querySelector(".jp-icon").addEventListener("change", function (e) { prod().icon = e.target.value.trim() || "📦"; persistProducts(); });
      row.querySelector(".jp-name").addEventListener("change", function (e) {
        var v = e.target.value.trim();
        if (!v) { e.target.value = prod().name; return; }
        prod().name = v; persistProducts();
      });
      row.querySelector(".jp-desc").addEventListener("change", function (e) { prod().desc = e.target.value.trim(); persistProducts(); });
      row.querySelector(".jp-cat").addEventListener("change", function (e) { prod().category = e.target.value.trim() || "General"; persistProducts(); renderProducts(); });
      row.querySelector(".jp-warranty").addEventListener("change", function (e) { prod().warranty = e.target.value.trim(); persistProducts(); });
      row.querySelector(".jp-price").addEventListener("change", function (e) { prod().price = Math.max(0, Math.round(Number(e.target.value) || 0)); e.target.value = prod().price; persistProducts(); });
      row.querySelector(".jp-mrp").addEventListener("change", function (e) { prod().mrp = Math.max(0, Math.round(Number(e.target.value) || 0)); e.target.value = prod().mrp; persistProducts(); });
      row.querySelector(".jp-stock").addEventListener("change", function (e) { prod().stock = e.target.value; persistProducts(); });
      row.querySelector(".jp-id").addEventListener("change", function (e) {
        var v = slugify(e.target.value);
        if (v !== id && D.products.some(function (x) { return x.id === v; })) { alert("That product ID is already used — pick another."); e.target.value = id; return; }
        prod().id = v; row.setAttribute("data-id", v); persistProducts();
      });
      row.querySelector(".jp-del").addEventListener("click", function () {
        if (confirm("Delete “" + prod().name + "” from the catalog?")) {
          D.products = D.products.filter(function (x) { return x.id !== id; });
          persistProducts(); renderProducts();
        }
      });
    });
  }
  function renderDashBits() {
    var inS = D.products.filter(function (p) { return p.stock === "in" || p.stock === "low"; }).length;
    var req = D.products.filter(function (p) { return !p.price; }).length;
    $("dash-products").textContent = D.products.length + " products · " + inS + " in stock · " + req + " price-on-request.";
    var tm = (D.testimonials || []).filter(function (t) { return t && t.approved; }).length;
    $("dash-tm").textContent = tm + " approved testimonials live on the homepage.";
  }

  /* ================= Testimonials ================= */
  function persistTM() {
    var ov = CMS.load(); ov.testimonials = D.testimonials; CMS.save(ov);
    renderDashBits();
  }
  function renderTM() {
    var wrap = $("tm-list");
    var arr = D.testimonials || (D.testimonials = []);
    var approved = arr.filter(function (t) { return t.approved; }).length;
    $("tm-count").textContent = approved + " approved of " + arr.length;
    if (!arr.length) {
      wrap.innerHTML = '<div class="placeholder">No testimonials yet. Add only real, client-approved reviews — they appear on the homepage automatically once approved.</div>';
      return;
    }
    wrap.innerHTML = arr.map(function (t) {
      return '<div class="lead-row" data-id="' + esc(t.id) + '">' +
        '<div class="f-grid" style="grid-template-columns:110px 1fr 1fr">' +
        '<select class="inp jt-stars" aria-label="Stars">' + [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '"' + (t.stars === n ? " selected" : "") + ">" + n + " stars</option>"; }).join("") + "</select>" +
        '<input class="inp jt-author" value="' + esc(t.author || "") + '" placeholder="Customer / business name" aria-label="Author">' +
        '<select class="inp jt-source" aria-label="Source">' + TM_SOURCES.map(function (s) { return '<option' + (t.source === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select>" +
        "</div>" +
        '<textarea class="inp jt-text" rows="2" style="margin-top:10px" placeholder="The customer\'s genuine words…" aria-label="Review text">' + esc(t.text || "") + "</textarea>" +
        '<div style="display:flex;gap:10px;margin-top:10px;align-items:center;flex-wrap:wrap">' +
        '<label class="small"><input type="checkbox" class="jt-ok"' + (t.approved ? " checked" : "") + ' style="width:18px;height:18px;accent-color:var(--green-600)"> ✅ Approved — show on homepage</label>' +
        '<button class="btn btn-outline btn-sm jt-del" style="margin-left:auto;color:var(--red-600)">Delete</button>' +
        "</div></div>";
    }).join("");
    wrap.querySelectorAll(".lead-row").forEach(function (row) {
      var id = row.getAttribute("data-id");
      function tm() { return D.testimonials.find(function (x) { return x.id === id; }); }
      row.querySelector(".jt-stars").addEventListener("change", function (e) { tm().stars = Number(e.target.value); persistTM(); renderTM(); });
      row.querySelector(".jt-author").addEventListener("change", function (e) { tm().author = e.target.value.trim(); persistTM(); });
      row.querySelector(".jt-source").addEventListener("change", function (e) { tm().source = e.target.value; persistTM(); });
      row.querySelector(".jt-text").addEventListener("change", function (e) { tm().text = e.target.value.trim(); persistTM(); });
      row.querySelector(".jt-ok").addEventListener("change", function (e) {
        if (e.target.checked && !(tm().text && tm().author)) {
          alert("Add the review text and customer name before approving.");
          e.target.checked = false; return;
        }
        tm().approved = e.target.checked; persistTM(); renderTM();
      });
      row.querySelector(".jt-del").addEventListener("click", function () {
        if (confirm("Delete this testimonial?")) {
          D.testimonials = D.testimonials.filter(function (x) { return x.id !== id; });
          persistTM(); renderTM();
        }
      });
    });
  }

  /* ================= Homepage content ================= */
  var CONTENT_FIELDS = [
    ["heroTitleA", "Hero headline (part 1)", "text"], ["heroTitleB", "Hero headline (part 2, blue)", "text"],
    ["heroSub", "Hero supporting text", "area"], ["ctaPrimary", "Primary button label", "text"],
    ["ctaSecondary", "Secondary button label", "text"], ["finalTitle", "Final CTA headline", "text"],
    ["finalSub", "Final CTA supporting text", "area"]
  ];
  function renderContentForm() {
    var c = D.content || {};
    $("content-form").innerHTML = CONTENT_FIELDS.map(function (f) {
      var inner = f[2] === "area"
        ? '<textarea class="inp" rows="2" data-k="' + f[0] + '">' + esc(c[f[0]] || "") + "</textarea>"
        : '<input class="inp" data-k="' + f[0] + '" value="' + esc(c[f[0]] || "") + '">';
      return '<div class="f-item' + (f[2] === "area" ? " f-full" : "") + '"><label class="flab">' + f[1] + "</label>" + inner + "</div>";
    }).join("") + ((D.trustFacts || []).map(function (t, i) {
      return '<div class="f-item"><label class="flab">Trust badge ' + (i + 1) + ' — icon</label><input class="inp" data-trust="' + i + '" data-f="icon" value="' + esc(t.icon || "") + '" maxlength="4"></div>' +
        '<div class="f-item"><label class="flab">Badge ' + (i + 1) + ' — title</label><input class="inp" data-trust="' + i + '" data-f="title" value="' + esc(t.title || "") + '"></div>' +
        '<div class="f-item f-full"><label class="flab">Badge ' + (i + 1) + ' — text</label><input class="inp" data-trust="' + i + '" data-f="text" value="' + esc(t.text || "") + '"></div>';
    }).join(""));
  }

  /* ================= Settings ================= */
  var SETTING_LABELS = { name: "Company legal name", shortName: "Short name", tagline: "Tagline", phoneDisplay: "Phone (display)", phoneHref: "Phone link (tel:…)", whatsappNumber: "WhatsApp number (977…)", email: "Email", address: "Address", hours: "Business hours", mapsUrl: "Google Maps URL", reviewUrl: "Google review URL", facebook: "Facebook URL", jigriToolsUrl: "JigriTools URL", logoUrl: "Logo image URL", formEndpoint: "Form endpoint POST URL (optional)", analyticsId: "Google Analytics ID (optional)", leadInboxNote: "Lead inbox note" };
  function renderSettings() {
    $("settings-form").innerHTML = CMS.fields.map(function (k) {
      var v = C[k] == null ? "" : C[k];
      var ph = (k === "formEndpoint" || k === "analyticsId") ? "Leave empty if not configured" : "";
      return '<div class="f-item"><label class="flab">' + (SETTING_LABELS[k] || k) + "</label>" +
        '<input class="inp" data-sk="' + k + '" value="' + esc(v) + '" placeholder="' + esc(ph) + '"></div>';
    }).join("");
  }

  /* ================= boot ================= */
  document.addEventListener("DOMContentLoaded", function () {
    if (!$("lead-list")) return;
    initShell();
    /* leads + dashboard */
    ["f-status", "f-service", "f-q"].forEach(function (id) { $(id).addEventListener("input", renderLeads); });
    renderLeads(); renderEvents();
    $("exp-csv").addEventListener("click", function () { download("prixna-leads.csv", csv(L.load()), "text/csv"); });
    $("exp-json").addEventListener("click", function () { download("prixna-leads.json", JSON.stringify(L.load(), null, 2), "application/json"); });
    $("imp-json").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var arr = JSON.parse(r.result);
          if (!Array.isArray(arr)) throw 0;
          var cur = L.load(); var ids = {};
          cur.forEach(function (x) { ids[x.id] = 1; });
          arr.forEach(function (x) { if (x && x.id && !ids[x.id]) cur.unshift(x); });
          L.saveAll(cur); renderLeads(); alert("Imported " + arr.length + " record(s).");
        } catch (err) { alert("That file is not a valid leads export."); }
      };
      r.readAsText(f); e.target.value = "";
    });
    $("wipe").addEventListener("click", wipeLeads);
    $("wipe2").addEventListener("click", wipeLeads);
    /* products */
    renderProducts(); renderDashBits();
    $("prod-add").addEventListener("click", function () {
      var base = "new-product", id = base, n = 2;
      while (D.products.some(function (x) { return x.id === id; })) { id = base + "-" + (n++); }
      D.products.unshift({ id: id, name: "New product — edit me", category: "Accessories", price: 0, mrp: 0, stock: "in", icon: "📦", desc: "Short description…", warranty: "Shop warranty as agreed at purchase." });
      persistProducts(); renderProducts();
    });
    $("prod-reset").addEventListener("click", function () {
      if (confirm("Discard ALL product edits and restore the file defaults?")) {
        var ov = CMS.load(); delete ov.products; CMS.save(ov); location.reload();
      }
    });
    /* testimonials */
    renderTM();
    $("tm-add").addEventListener("click", function () {
      (D.testimonials = D.testimonials || []).unshift({ id: uid("tm"), stars: 5, text: "", author: "", source: "Google review", approved: false });
      persistTM(); renderTM();
    });
    /* content */
    renderContentForm();
    $("content-save").addEventListener("click", function () {
      var ov = CMS.load(); ov.content = ov.content || {};
      document.querySelectorAll("#content-form [data-k]").forEach(function (inp) {
        var v = inp.value.trim();
        if (v) ov.content[inp.getAttribute("data-k")] = v;
      });
      ov.trustFacts = (D.trustFacts || []).map(function (t) { return { icon: t.icon, title: t.title, text: t.text }; });
      document.querySelectorAll("#content-form [data-trust]").forEach(function (inp) {
        var i = Number(inp.getAttribute("data-trust"));
        if (ov.trustFacts[i]) ov.trustFacts[i][inp.getAttribute("data-f")] = inp.value.trim();
      });
      CMS.save(ov);
      for (var k in ov.content) { if (D.content) D.content[k] = ov.content[k]; }
      D.trustFacts = ov.trustFacts;
      var ok = $("content-ok"); ok.classList.add("show");
      setTimeout(function () { ok.classList.remove("show"); }, 6000);
    });
    $("content-reset").addEventListener("click", function () {
      if (confirm("Discard content + trust-badge edits?")) {
        var ov = CMS.load(); delete ov.content; delete ov.trustFacts; CMS.save(ov); location.reload();
      }
    });
    /* settings */
    renderSettings();
    $("settings-save").addEventListener("click", function () {
      var vals = {};
      document.querySelectorAll("#settings-form [data-sk]").forEach(function (inp) { vals[inp.getAttribute("data-sk")] = inp.value.trim(); });
      for (var i = 0; i < ["phoneDisplay", "phoneHref", "whatsappNumber", "email", "address"].length; i++) {
        var k = ["phoneDisplay", "phoneHref", "whatsappNumber", "email", "address"][i];
        if (!vals[k]) { alert("“" + (SETTING_LABELS[k] || k) + "” is required."); return; }
      }
      ["formEndpoint", "analyticsId"].forEach(function (k) { if (!vals[k]) vals[k] = null; });
      var ov = CMS.load(); ov.config = vals; CMS.save(ov);
      var ok = $("settings-ok"); ok.classList.add("show");
      setTimeout(function () { location.reload(); }, 900);
    });
    $("settings-dl").addEventListener("click", function () { download("config.js", CMS.genConfigJS(), "application/javascript"); });
    /* backup */
    $("dl-data").addEventListener("click", function () { download("data.js", CMS.genDataJS(), "application/javascript"); });
    $("dl-config").addEventListener("click", function () { download("config.js", CMS.genConfigJS(), "application/javascript"); });
    $("cms-export").addEventListener("click", function () {
      download("prixna-cms-backup.json", JSON.stringify({ exportedAt: new Date().toISOString(), cms: CMS.load(), leads: L.load() }, null, 2), "application/json");
    });
    $("cms-import").addEventListener("change", function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var obj = JSON.parse(r.result);
          if (!obj || typeof obj.cms !== "object") throw 0;
          CMS.save(obj.cms);
          if (Array.isArray(obj.leads)) {
            var cur = L.load(); var ids = {};
            cur.forEach(function (x) { ids[x.id] = 1; });
            obj.leads.forEach(function (x) { if (x && x.id && !ids[x.id]) cur.unshift(x); });
            L.saveAll(cur);
          }
          alert("Backup imported. Reloading…"); location.reload();
        } catch (err) { alert("That file is not a valid CMS backup."); }
      };
      r.readAsText(f); e.target.value = "";
    });
    $("cms-reset").addEventListener("click", function () {
      if (confirm("Discard ALL CMS edits (products, reviews, content, settings) and revert to the website files?") && confirm("Really discard everything?")) {
        try { localStorage.removeItem(CMS.key); } catch (e) {}
        location.reload();
      }
    });
    $("pin-save").addEventListener("click", function () {
      var v = $("pin-set").value.trim();
      try {
        if (v) localStorage.setItem("prixna_admin_pin", v);
        else localStorage.removeItem("prixna_admin_pin");
        alert(v ? "Staff PIN set for this browser." : "Staff PIN removed.");
        $("pin-set").value = "";
      } catch (e) { alert("Browser storage is blocked — PIN cannot be saved."); }
    });
  });
})();
