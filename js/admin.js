/* Prixna IT Solution — staff lead inbox (device-local CRM-lite).
   Data lives in this browser only (localStorage). Export regularly.
   Do NOT use on shared computers without a server-backed system. */
(function () {
  "use strict";
  var L = window.PRIXNA_LEADS;
  var STATUSES = ["new", "contacted", "qualified", "won", "lost"];
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
  function csv(leads) {
    var rows = [["id", "created", "name", "phone", "email", "company", "location", "service", "status", "followUp", "assignee", "message"]];
    leads.forEach(function (l) {
      rows.push([l.id, l.createdAt, l.name, l.phone, l.email, l.company, l.location, l.service, l.status, l.followUp, l.assignee, (l.message || "").replace(/\n/g, " | ")]);
    });
    return rows.map(function (r) { return r.map(function (c) { return '"' + String(c || "").replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
  }
  function render() {
    var leads = L.load();
    var fStatus = document.getElementById("f-status").value;
    var fSvc = document.getElementById("f-service").value;
    var q = (document.getElementById("f-q").value || "").toLowerCase();
    var list = leads.filter(function (l) {
      return (!fStatus || l.status === fStatus) &&
        (!fSvc || (l.service || "").indexOf(fSvc) > -1) &&
        (!q || ((l.name || "") + " " + (l.phone || "") + " " + (l.company || "") + " " + (l.message || "")).toLowerCase().indexOf(q) > -1);
    });
    var now = new Date(); var week = new Date(now - 7 * 864e5);
    document.getElementById("k-total").textContent = leads.length;
    document.getElementById("k-week").textContent = leads.filter(function (l) { return new Date(l.createdAt) >= week; }).length;
    document.getElementById("k-new").textContent = leads.filter(function (l) { return l.status === "new"; }).length;
    document.getElementById("k-won").textContent = leads.filter(function (l) { return l.status === "won"; }).length;
    var wrap = document.getElementById("lead-list");
    document.getElementById("lead-count").textContent = list.length + " shown";
    if (!list.length) {
      wrap.innerHTML = '<div class="placeholder">No leads match. New enquiries from any site form appear here automatically.<br><br><a class="btn btn-outline btn-sm" href="quote.html">Open the consultation form</a> <a class="btn btn-outline btn-sm" href="index.html">Back to homepage</a></div>';
      return;
    }
    wrap.innerHTML = list.map(function (l) {
      var wa = window.PRIXNA_WA("Hello " + (l.name || "") + ", this is Prixna IT Solution following up on your enquiry (" + l.id + ") regarding " + (l.service || "your requirement") + ".");
      var hist = (l.history || []).map(function (h) { return "<li class='small'>" + L.esc(h.ts ? fmtDate(h.ts) : "") + " — " + L.esc(h.note) + "</li>"; }).join("");
      return '<div class="lead-row" data-id="' + L.esc(l.id) + '">' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>' + L.esc(l.name || "—") + "</b>" +
        '<span class="pill st-' + L.esc(l.status || "new") + '">' + L.esc(l.status || "new") + "</span>" +
        '<span class="small muted">' + L.esc(l.id) + " · " + L.esc(fmtDate(l.createdAt)) + "</span></div>" +
        '<p class="small" style="margin:8px 0">📞 <a href="tel:' + L.esc((l.phone || "").replace(/\s/g, "")) + '">' + L.esc(l.phone || "—") + "</a>" +
        (l.email ? ' · ✉️ <a href="mailto:' + L.esc(l.email) + '">' + L.esc(l.email) + "</a>" : "") +
        (l.company ? " · 🏢 " + L.esc(l.company) : "") + (l.location ? " · 📍 " + L.esc(l.location) : "") + "<br>🧰 " + L.esc(l.service || "—") +
        (l.message ? "<br>💬 " + L.esc(l.message) : "") + "</p>" +
        (hist ? "<ul style='margin:0 0 10px;padding-left:20px;color:var(--muted)'>" + hist + "</ul>" : "") +
        '<div class="f-grid" style="grid-template-columns:1fr 1fr 1fr">' +
        '<select class="inp js-status" aria-label="Status">' + STATUSES.map(function (s) { return '<option value="' + s + '"' + (l.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select>" +
        '<input class="inp js-follow" type="date" value="' + L.esc(l.followUp || "") + '" aria-label="Follow-up date">' +
        '<input class="inp js-assign" placeholder="Assignee" value="' + L.esc(l.assignee || "") + '" aria-label="Assignee">' +
        "</div>" +
        '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
        '<input class="inp js-note" placeholder="Add follow-up note…" style="flex:1;min-width:200px" aria-label="Add note">' +
        '<button class="btn btn-outline btn-sm js-add-note">Add note</button>' +
        '<a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="' + wa + '">WhatsApp lead</a>' +
        '<button class="btn btn-outline btn-sm js-del">Delete</button>' +
        "</div></div>";
    }).join("");
    wrap.querySelectorAll(".lead-row").forEach(bindRow);
  }
  function mutate(id, fn) {
    var leads = L.load();
    var l = leads.find(function (x) { return x.id === id; });
    if (!l) return;
    fn(l);
    L.saveAll(leads);
    render();
  }
  function bindRow(row) {
    var id = row.getAttribute("data-id");
    row.querySelector(".js-status").addEventListener("change", function (e) {
      mutate(id, function (l) { l.status = e.target.value; (l.history = l.history || []).push({ ts: new Date().toISOString(), note: "Status → " + e.target.value }); });
    });
    row.querySelector(".js-follow").addEventListener("change", function (e) {
      mutate(id, function (l) { l.followUp = e.target.value; });
    });
    row.querySelector(".js-assign").addEventListener("change", function (e) {
      mutate(id, function (l) { l.assignee = e.target.value; });
    });
    row.querySelector(".js-add-note").addEventListener("click", function () {
      var inp = row.querySelector(".js-note");
      if (!inp.value.trim()) return;
      var note = inp.value.trim();
      mutate(id, function (l) { (l.history = l.history || []).push({ ts: new Date().toISOString(), note: note }); });
    });
    row.querySelector(".js-del").addEventListener("click", function () {
      if (!confirm("Delete this lead permanently?")) return;
      var leads = L.load().filter(function (x) { return x.id !== id; });
      L.saveAll(leads);
      render();
    });
  }
  function renderEvents() {
    var ev = [];
    try { ev = JSON.parse(localStorage.getItem("prixna_events") || "[]"); } catch (e) {}
    var counts = {};
    ev.forEach(function (x) { counts[x.event] = (counts[x.event] || 0) + 1; });
    var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 14);
    document.getElementById("event-stats").innerHTML = keys.length
      ? keys.map(function (k) { return "<tr><td>" + L.esc(k) + "</td><td><b>" + counts[k] + "</b></td></tr>"; }).join("")
      : '<tr><td colspan="2" class="muted">No tracked events yet — clicks on call/WhatsApp buttons and form activity appear here.</td></tr>';
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("lead-list")) return;
    ["f-status", "f-service", "f-q"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", render);
    });
    document.getElementById("exp-csv").addEventListener("click", function () {
      download("prixna-leads.csv", csv(L.load()), "text/csv");
    });
    document.getElementById("exp-json").addEventListener("click", function () {
      download("prixna-leads.json", JSON.stringify(L.load(), null, 2), "application/json");
    });
    document.getElementById("imp-json").addEventListener("change", function (e) {
      var f = e.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var arr = JSON.parse(r.result);
          if (!Array.isArray(arr)) throw 0;
          var cur = L.load();
          var ids = new Set(cur.map(function (x) { return x.id; }));
          arr.forEach(function (x) { if (x && x.id && !ids.has(x.id)) cur.unshift(x); });
          L.saveAll(cur);
          render();
          alert("Imported " + arr.length + " record(s).");
        } catch (err) { alert("That file is not a valid leads export."); }
      };
      r.readAsText(f);
      e.target.value = "";
    });
    document.getElementById("wipe").addEventListener("click", function () {
      if (confirm("Export first! This erases ALL leads on this device. Continue?") && confirm("Really erase everything?")) {
        localStorage.removeItem("prixna_leads_v1");
        render();
      }
    });
    render();
    renderEvents();
  });
})();
