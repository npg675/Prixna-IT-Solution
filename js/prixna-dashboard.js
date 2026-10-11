/* Prixna Control Center — live dashboard logic (local-first).
   Pure builders exposed on window.PRIXNA_DASH for Node testing. */
(function () {
"use strict";
function load(k, fb){ try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? fb : v; } catch (e) { return fb; } }
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function fmt(iso){ try { return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (e) { return iso || ""; } }
function npr(n){ try { return "Rs. " + Math.round(+n || 0).toLocaleString("en-IN"); } catch (e) { return "Rs. " + n; } }
function telLink(p){ return "tel:" + String(p || "").replace(/\s/g, ""); }
function ktmNow(){ try { return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })); } catch (e) { return new Date(); } }
function isOpen(){
  var n = ktmNow();
  if (n.getDay() === 6) return false;
  var m = n.getHours() * 60 + n.getMinutes();
  return m >= 570 && m <= 1110;
}

function snapshot(){
  return {
    leads: load("prixna_leads_v1", []),
    tickets: load("prixna_tickets_v1", []),
    bookings: load("prixna_bookings_v1", []),
    quotes: load("prixna_quotes_v1", []),
    feedback: load("prixna_feedback_v1", []),
    outbox: load("prixna_outbox_v1", []),
    stock: (window.PRIXNA_STOCK ? window.PRIXNA_STOCK.getStock() : [])
  };
}

/** Ordered action items, most urgent first. Pure. */
function attentionQueue(s){
  var q = [];
  s.tickets.filter(function (t) { return t.priority === "Urgent" && t.status !== "closed"; }).forEach(function (t) {
    q.push({ sev: 0, icon: "🚨", title: "Urgent ticket " + t.id, sub: (t.device || "") + " — " + (t.problem || ""), phone: t.phone });
  });
  s.bookings.slice(0, 8).forEach(function (b) {
    q.push({ sev: 1, icon: "📅", title: "Booking " + b.id + " · " + (b.day || "") + " " + (b.time || ""), sub: (b.name || "") + " · " + (b.service || ""), phone: b.phone });
  });
  s.leads.filter(function (l) { return l.status === "new"; }).slice(0, 8).forEach(function (l) {
    q.push({ sev: 2, icon: "✨", title: "New lead " + (l.name || l.id), sub: (l.service || "") + " · " + fmt(l.createdAt), phone: l.phone, leadId: l.id });
  });
  s.quotes.filter(function (x) { return x.status === "sent"; }).slice(0, 6).forEach(function (x) {
    q.push({ sev: 3, icon: "🧾", title: "Quote " + x.id + " awaiting advance", sub: npr(x.total) + " · " + (x.customer || ""), phone: x.phone });
  });
  s.stock.filter(function (p) { return p.low; }).forEach(function (p) {
    q.push({ sev: 4, icon: "📦", title: "Low stock: " + p.name, sub: p.qty + " left (reorder at " + p.lowAt + ")" });
  });
  s.feedback.filter(function (f) { return +f.rating <= 3; }).slice(0, 4).forEach(function (f) {
    q.push({ sev: 2, icon: "⚠️", title: "Recovery: " + (f.rating || "?") + "/5 " + (f.ref || ""), sub: f.comment || f.name || "" });
  });
  return q.sort(function (a, b) { return a.sev - b.sev; }).slice(0, 12);
}

function kpis(s){
  var newLeads = s.leads.filter(function (l) { return l.status === "new"; }).length;
  var urgent = s.tickets.filter(function (t) { return t.priority === "Urgent" && t.status !== "closed"; }).length;
  var sent = s.quotes.filter(function (x) { return x.status === "sent"; });
  var paid = s.quotes.filter(function (x) { return x.status === "paid"; });
  var pipeVal = sent.reduce(function (a, x) { return a + (+x.total || 0); }, 0);
  var paidVal = paid.reduce(function (a, x) { return a + (+x.advance || 0); }, 0);
  var ratings = s.feedback.map(function (f) { return +f.rating || 0; }).filter(function (r) { return r > 0; });
  return [
    { label: "New leads", v: newLeads },
    { label: "Urgent tickets", v: urgent },
    { label: "Bookings", v: s.bookings.length },
    { label: "Quote pipeline", v: npr(pipeVal) },
    { label: "Advance in", v: npr(paidVal) },
    { label: "Rating", v: ratings.length ? (ratings.reduce(function (a, b) { return a + b; }, 0) / ratings.length).toFixed(1) + "/5" : "—" },
    { label: "Low stock", v: s.stock.filter(function (p) { return p.low; }).length },
    { label: "Outbox queued", v: s.outbox.length }
  ];
}

function feed(s){
  var items = [];
  s.leads.slice(0, 10).forEach(function (l) { items.push({ ts: l.createdAt, icon: "✨", text: "Lead " + l.id + " · " + (l.name || "") + " · " + (l.service || "") }); });
  s.tickets.slice(0, 10).forEach(function (t) { items.push({ ts: t.createdAt, icon: "🎫", text: "Ticket " + t.id + " (" + (t.priority || "") + ") · " + (t.device || "") }); });
  s.bookings.slice(0, 10).forEach(function (b) { items.push({ ts: b.createdAt, icon: "📅", text: "Booking " + b.id + " · " + (b.service || "") + " " + (b.day || "") }); });
  s.quotes.slice(0, 10).forEach(function (x) { items.push({ ts: x.createdAt, icon: "🧾", text: "Quote " + x.id + " " + npr(x.total) + " [" + (x.status || "") + "]" }); });
  s.feedback.slice(0, 6).forEach(function (f) { items.push({ ts: f.ts, icon: "⭐", text: (f.rating || "?") + "/5 " + (f.ref || "") + " " + (f.comment || "") }); });
  return items.filter(function (i) { return i.ts; }).sort(function (a, b) { return new Date(b.ts) - new Date(a.ts); }).slice(0, 20);
}

var NEXT = { new: "contacted", contacted: "qualified", qualified: "won" };
function advanceLead(id){
  try {
    var arr = load("prixna_leads_v1", []);
    var l = arr.filter(function (x) { return x.id === id; })[0];
    if (!l || !NEXT[l.status]) return false;
    l.status = NEXT[l.status];
    l.history = l.history || [];
    l.history.push({ ts: new Date().toISOString(), note: "Dashboard advance → " + l.status });
    localStorage.setItem("prixna_leads_v1", JSON.stringify(arr));
    return true;
  } catch (e) { return false; }
}

function render(){
  if (!document.getElementById("dash-kpis")) return;
  var s = snapshot();
  // clock + status
  document.getElementById("dash-clock").textContent = ktmNow().toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" }) + " NPT";
  document.getElementById("dash-open").textContent = isOpen() ? "Open now" : "Closed";
  var ep = (window.PRIXNA || {}).sheetsEndpoint;
  document.getElementById("dash-sync").innerHTML = ep
    ? "✅ Cloud sync ON · outbox pending: <b>" + s.outbox.length + "</b>"
    : "⚠️ Local-only mode · outbox queued: <b>" + s.outbox.length + "</b> (set sheetsEndpoint to sync)";
  // kpis
  document.getElementById("dash-kpis").innerHTML = kpis(s).map(function (k) {
    return '<div class="kpi"><b>' + esc(String(k.v)) + "</b><span>" + esc(k.label) + "</span></div>";
  }).join("");
  // attention
  var q = attentionQueue(s);
  document.getElementById("dash-attn-n").textContent = q.length;
  document.getElementById("dash-attn").innerHTML = q.length ? q.map(function (a) {
    return '<div class="attn"><span style="font-size:20px">' + a.icon + "</span><div class='grow'><b>" + esc(a.title) + "</b><br><span class='small muted'>" + esc(a.sub || "") + "</span></div>"
      + (a.phone ? "<a class='btn btn-outline btn-sm' href='" + telLink(a.phone) + "'>📞</a><a class='btn btn-whatsapp btn-sm' target='_blank' rel='noopener' href='https://wa.me/" + esc(String(a.phone).replace(/\D/g, "")) + "'>💬</a>" : "")
      + "</div>";
  }).join("") : '<p class="small muted">All clear 🎉 Nothing waiting.</p>';
  // upcoming
  document.getElementById("dash-upcoming").innerHTML = s.bookings.length
    ? s.bookings.slice(0, 6).map(function (b) {
        return "<p class='small' style='margin:8px 0'><b>" + esc(b.id) + "</b> · " + esc((b.day || "") + " " + (b.time || "")) + "<br><span class='muted'>" + esc((b.name || "") + " · " + (b.service || "")) + "</span> " + (b.phone ? "<a href='" + telLink(b.phone) + "'>📞</a>" : "") + "</p>";
      }).join("") : '<p class="small muted">No bookings yet.</p>';
  // side: feedback + stock
  var lows = s.stock.filter(function (p) { return p.low; });
  var pos = s.feedback.filter(function (f) { return +f.rating >= 4; }).length;
  document.getElementById("dash-side").innerHTML =
    "<p class='small'>⭐ " + pos + " happy / " + s.feedback.length + " ratings · <a href='admin.html'>details</a></p>"
    + (lows.length ? lows.slice(0, 5).map(function (p) { return "<p class='small' style='margin:6px 0'>📦 <b>" + esc(p.name) + "</b> — " + p.qty + " left</p>"; }).join("") : "<p class='small muted'>📦 Stock healthy.</p>");
  // pipeline
  var stages = ["new", "contacted", "qualified", "won", "lost"];
  document.getElementById("dash-pipe").innerHTML = stages.map(function (st) {
    var ls = s.leads.filter(function (l) { return (l.status || "new") === st; }).slice(0, 6);
    return "<div class='pipe-col'><h4>" + st + " (" + s.leads.filter(function (l) { return (l.status || "new") === st; }).length + ")</h4>"
      + (ls.length ? ls.map(function (l) {
          return "<div class='small' style='margin:6px 0'><b>" + esc(l.name || l.id) + "</b><br><span class='muted'>" + esc(l.service || "") + "</span><br>"
            + (NEXT[st] ? "<button class='btn btn-outline btn-sm' data-adv='" + esc(l.id) + "'>→ " + NEXT[st] + "</button> " : "")
            + (l.phone ? "<a href='" + telLink(l.phone) + "'>📞</a>" : "") + "</div>";
        }).join("") : "<span class='small muted'>—</span>") + "</div>";
  }).join("");
  document.querySelectorAll("[data-adv]").forEach(function (b) {
    b.onclick = function () { if (advanceLead(b.dataset.adv)) render(); };
  });
  // quotes
  var sent = s.quotes.filter(function (x) { return x.status === "sent"; });
  var paid = s.quotes.filter(function (x) { return x.status === "paid"; });
  document.getElementById("dash-quotes").innerHTML =
    "<p class='small'>📤 Sent: <b>" + sent.length + "</b> (" + npr(sent.reduce(function (a, x) { return a + (+x.total || 0); }, 0)) + ") · ✅ Paid: <b>" + paid.length + "</b> (" + npr(paid.reduce(function (a, x) { return a + (+x.advance || 0); }, 0)) + " advance)</p>"
    + (s.quotes.length ? s.quotes.slice(0, 5).map(function (x) { return "<p class='small' style='margin:6px 0'><b>" + esc(x.id) + "</b> " + npr(x.total) + " [" + esc(x.status || "") + "] · " + esc(x.customer || "") + " <a href='quote-pdf.html?qid=" + esc(x.id) + "'>Open</a></p>"; }).join("") : "<p class='small muted'>No quotes yet.</p>");
  // feed
  var f = feed(s);
  document.getElementById("dash-feed").innerHTML = f.length
    ? f.map(function (i) { return "<div class='small'>" + i.icon + " " + esc(i.text) + " <span class='muted'>· " + esc(fmt(i.ts)) + "</span></div>"; }).join("")
    : '<p class="small muted">No activity yet.</p>';
}

function exportAll(){
  var s = snapshot();
  var blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...s }, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "prixna-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("dash-kpis")) return;
  render();
  setInterval(render, 30000);
  window.addEventListener("storage", render);
  document.getElementById("dash-flush").onclick = function () { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.flush().then(function () { setTimeout(render, 1200); }); };
  document.getElementById("dash-export").onclick = exportAll;
});
window.PRIXNA_DASH = { snapshot: snapshot, attentionQueue: attentionQueue, kpis: kpis, feed: feed, advanceLead: advanceLead, render: render };
})();
