/* Prixna AI inbox for staff admin page — shows AI tickets, bookings + autopilot outbox.
   Auto-injected by main.js on admin.html. Local-first; mirrors Google Sheet when online. */
(function () {
"use strict";
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function load(k){ try{ return JSON.parse(localStorage.getItem(k)||"[]"); }catch(e){ return []; } }
function fmt(iso){ try{ return new Date(iso).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }catch(e){ return iso||""; } }
function wa(text){ return (window.PRIXNA_WA?window.PRIXNA_WA(text):"https://wa.me/9779813714582?text="+encodeURIComponent(text)); }

function render(){
  var host = document.getElementById("prixna-ai-inbox");
  if(!host) {
    // inject section above Backup heading if admin.html wasn't edited yet
    var anchor = document.getElementById("lead-list");
    if(!anchor) return;
    host = document.createElement("div");
    host.id = "prixna-ai-inbox";
    anchor.parentElement.insertBefore(host, anchor.nextSibling);
  }
  var tickets = load("prixna_tickets_v1");
  var bookings = load("prixna_bookings_v1");
  var feedback = load("prixna_feedback_v1");
  var leadsAll = load("prixna_leads_v1");
  var bulk = leadsAll.filter(function(l){ return /bulk|dealer/i.test(l.service||""); });
  var outbox = load("prixna_outbox_v1");
  var pending = outbox.length;
  var ep = (window.PRIXNA||{}).sheetsEndpoint;
  host.innerHTML =
    '<h2 style="margin-top:44px">🤖 Prixna AI — tickets & bookings (autopilot)</h2>'
    + '<div class="card" style="border-color:'+(ep?"#BBF7D0":"#F0DDB8")+';background:'+(ep?"#F0FDF4":"#FFFDF6")+'">'
    + (ep
      ? '<b>✅ Cloud sync ON.</b> <span class="small">Every lead/ticket/booking posts to Google Sheets + staff email/WhatsApp. Outbox pending: <b>'+pending+'</b>.</span>'
      : '<b>⚠️ Cloud sync OFF.</b> <span class="small">Autopilot is saving on this device only. Deploy <b>api/prixna-autopilot.gs</b> (10 min, free) and set <b>js/config.js → sheetsEndpoint</b>. Outbox queued: <b>'+pending+'</b> — will auto-send once connected.</span>')
    + '<div class="btn-row" style="margin-top:10px">'
    + '<button class="btn btn-outline btn-sm" id="prixna-flush">🔄 Retry sync now</button>'
    + (pending?'<button class="btn btn-outline btn-sm" id="prixna-staff-alert">💬 Staff WhatsApp alert for latest</button>':"")
    + '</div></div>'
    + '<h3 style="margin-top:22px">📅 Bookings ('+bookings.length+')</h3>'
    + (bookings.length? bookings.slice(0,20).map(function(b){
        var fbUrl = "feedback.html?ref="+encodeURIComponent(b.id||"");
        return '<div class="lead-row"><b>'+esc(b.id)+'</b> · '+esc(b.name||"—")+' · <a href="tel:'+esc((b.phone||"").replace(/\s/g,""))+'">'+esc(b.phone||"")+'</a>'
        + (b.email ? ' · ✉️ <a href="mailto:'+esc(b.email)+'">'+esc(b.email)+'</a>' : '')
        + '<br><span class="small">🧰 '+esc(b.service||"")+' · 🕒 '+esc((b.day||"")+" "+(b.time||""))+' · '+esc(fmt(b.createdAt))+'</span>'
        + '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="'+wa("Hello "+(b.name||"")+", Prixna confirming your booking "+b.id+" for "+(b.service||"")+" at "+(b.day||"")+" "+(b.time||"")+".")+'">Confirm customer</a>'
        + '<a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="https://wa.me/'+esc((b.phone||"").replace(/\D/g,""))+'?text='+encodeURIComponent("Namaste "+(b.name||"").split(" ")[0]+" 🙏 Hamro sewa kasto lagyo? 1-5 star dinus: "+location.origin+location.pathname.replace(/admin\.html.*/,"")+fbUrl)+'">⭐ Ask feedback</a></div></div>';
      }).join("") : '<div class="placeholder small">No bookings yet — test the AI widget → type “book”.</div>')
    + '<h3 style="margin-top:22px">⭐ Feedback ('+feedback.length+')</h3>'
    + (feedback.length? feedback.slice(0,12).map(function(f){
        var r=+f.rating||0;
        return '<div class="lead-row"><b>'+("⭐".repeat(Math.min(r,5))||"—")+'</b> '+esc(f.ref||"")+' · '+esc(f.name||"")+' · '+esc(fmt(f.ts||""))
        + (f.comment?'<br><span class="small">💬 '+esc(f.comment)+'</span>':"")
        + (f.mood?'<br><span class="small muted">→ '+(f.mood==="happy"?"Google review asked ✅":"recovery ticket ⚠️")+'</span>':"")+'</div>';
      }).join("") : '<div class="placeholder small">No ratings yet — share <b>feedback.html?ref=B-XXX</b> after visits.</div>')
    + '<h3 style="margin-top:22px">📦 Bulk / dealer quotes ('+bulk.length+')</h3>'
    + (bulk.length? bulk.slice(0,12).map(function(l){
        return '<div class="lead-row"><b>'+esc(l.id)+'</b> · '+esc(l.name||"—")+' · <a href="tel:'+esc((l.phone||"").replace(/\s/g,""))+'">'+esc(l.phone||"")+'</a>'
        + (l.company?' · 🏢 '+esc(l.company):"")
        + '<br><span class="small">📋 '+esc((l.message||"").slice(0,220))+' · '+esc(fmt(l.createdAt))+'</span>'
        + '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="quote-pdf.html?id='+esc(l.id)+'">🧾 Quote PDF</a></div></div>';
      }).join("") : '<div class="placeholder small">No bulk enquiries yet — share <b>bulk-quote.html</b> with dealers.</div>')
    + '<h3 style="margin-top:22px">🧾 Quotations (<span id="prixna-qcount">0</span>)</h3><div id="prixna-qlist"></div>'
    + '<h3 style="margin-top:22px">📦 Stock (tracked catalog)</h3><div id="prixna-stock"></div>'
    + '<h3 style="margin-top:22px">🎫 Support tickets ('+tickets.length+')</h3>'
    + (tickets.length? tickets.slice(0,20).map(function(t){
        return '<div class="lead-row"><b>'+esc(t.id)+'</b> <span class="pill '+(t.priority==="Urgent"?"st-lost":"st-new")+'">'+esc(t.priority||"")+'</span> · <a href="tel:'+esc((t.phone||"").replace(/\s/g,""))+'">'+esc(t.phone||"")+'</a>'
        + '<br><span class="small">🧰 '+esc(t.device||"")+' — '+esc(t.problem||"")+' · '+esc(fmt(t.createdAt))+'</span></div>';
      }).join("") : '<div class="placeholder small">No tickets yet — test the AI widget → type “repair”.</div>');
  var f = document.getElementById("prixna-flush");
  if(f) f.onclick = function(){ if(window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.flush().then(function(){ setTimeout(render,1200); }); render(); };
  var sa = document.getElementById("prixna-staff-alert");
  if(sa) sa.onclick = function(){
    var latest = bookings[0]||tickets[0]; if(!latest) return;
    var link = window.PRIXNA_NOTIFY?window.PRIXNA_NOTIFY.staffLink(latest.id.indexOf("B-")===0?"booking":"ticket",latest):wa("New autopilot item");
    window.open(link,"_blank");
  };
  renderQuotes();
  renderStock();
}
function npr(n){ try{ return "Rs. "+Math.round(+n||0).toLocaleString("en-IN"); }catch(e){ return "Rs. "+n; } }
function renderQuotes(){
  var box = document.getElementById("prixna-qlist");
  var cnt = document.getElementById("prixna-qcount");
  if(!box) return;
  var qs = load("prixna_quotes_v1");
  if(cnt) cnt.textContent = qs.length;
  if(!qs.length){ box.innerHTML = '<div class="placeholder small">No quotations yet — open a bulk lead → 🧾 Quote PDF.</div>'; return; }
  box.innerHTML = qs.slice(0,15).map(function(q,idx){
    return '<div class="lead-row"><b>'+esc(q.id)+'</b> <span class="pill '+(q.status==="paid"?"st-won":"st-new")+'">'+esc(q.status||"sent")+'</span> · '+esc(q.customer||"—")
    + '<br><span class="small">Total <b>'+npr(q.total)+'</b> · Advance '+npr(q.advance)+' · '+esc(fmt(q.createdAt))+'</span>'
    + '<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="quote-pdf.html?qid='+esc(q.id)+'">Open</a>'
    + (q.status!=="paid"?'<button class="btn btn-outline btn-sm" data-paid="'+idx+'">✅ Mark advance paid</button>':"")
    + '</div></div>';
  }).join("");
  box.querySelectorAll("[data-paid]").forEach(function(b){
    b.onclick = function(){
      var all = load("prixna_quotes_v1");
      var q = all[+b.dataset.paid]; if(!q) return;
      q.status = "paid";
      try{ localStorage.setItem("prixna_quotes_v1", JSON.stringify(all)); }catch(e){}
      try{ if(window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("quote-paid",{id:q.id,name:q.customer,phone:q.phone,total:q.total,advance:q.advance,status:"paid"}); }catch(e2){}
      // stock decrement on confirmed payment
      try{
        if(window.PRIXNA_STOCK){
          var res = window.PRIXNA_STOCK.decrementFromQuote(q);
          res.lows.forEach(function(l){
            if(window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("stock",{id:l.id,name:l.name,left:l.left,lowAt:l.lowAt,ref:q.id,low:true});
          });
          if(res.moved.length) renderStock();
        }
      }catch(e3){}
      renderQuotes();
    };
  });
}
function renderStock(){
  var box = document.getElementById("prixna-stock");
  if(!box || !window.PRIXNA_STOCK) { if(box) box.innerHTML = '<div class="placeholder small">Stock lib not loaded.</div>'; return; }
  var items = window.PRIXNA_STOCK.getStock();
  box.innerHTML = items.map(function(p){
    return '<div class="lead-row" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1;min-width:180px">'+esc(p.name)+'</b>'
    + (p.tracked
      ? '<button class="pill '+(p.low?"st-lost":"st-won")+'" data-set="'+esc(p.id)+'" title="Click to set exact count" style="cursor:pointer;border:0">'+p.qty+' left'+(p.low?" · LOW":"")+'</button>'
      : '<button class="pill st-new" data-set="'+esc(p.id)+'" title="Click to set starting count" style="cursor:pointer;border:0">untracked · set</button>')
    + '<span style="display:flex;gap:4px">'
    + '<button class="btn btn-outline btn-sm" data-adj="-1|'+esc(p.id)+'">−</button>'
    + '<button class="btn btn-outline btn-sm" data-adj="1|'+esc(p.id)+'">+</button>'
    + '</span></div>';
  }).join("")
  + '<p class="small muted">Tip: click a pill to set the exact count (saved on this device). Paid quotes auto-decrement matched items; lows alert staff. Seed counts in js/data.js → qty.</p>';
  box.querySelectorAll("[data-set]").forEach(function(b){
    b.onclick = function(){
      var v = prompt("Set stock count:", "");
      if(v === null) return;
      v = Math.max(0, Math.round(+v || 0));
      window.PRIXNA_STOCK.setQty(b.dataset.set, v);
      renderStock();
    };
  });
  box.querySelectorAll("[data-adj]").forEach(function(b){
    b.onclick = function(){
      var parts = b.dataset.adj.split("|");
      window.PRIXNA_STOCK.adjust(parts[1], +parts[0]);
      renderStock();
    };
  });
}
document.addEventListener("DOMContentLoaded", function(){
  setTimeout(render, 800);
  window.addEventListener("storage", render);
});
})();
