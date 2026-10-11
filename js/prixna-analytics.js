/* Prixna Analytics — conversion funnel + trends for admin.html (local-first, zero deps).
   Reads prixna_events + leads/tickets/bookings/feedback from localStorage.
   Pure compute() exposed for testing via window.PRIXNA_ANALYTICS. */
(function () {
"use strict";
function load(k){ try{ return JSON.parse(localStorage.getItem(k)||"[]"); }catch(e){ return []; } }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

function countEv(events, prefix){
  return events.filter(function(e){ return (e.event||"").indexOf(prefix)===0; }).length;
}

function compute(events, leads, tickets, bookings, feedback){
  var aiOpens = countEv(events, "ai_open");
  var formStarts = countEv(events, "form_start");
  var waClicks = countEv(events, "click:") ; // all tracked clicks proxy for engagement
  var aiMsgs = events.filter(function(e){ return e.event==="ai_msg"; }).length;
  var won = leads.filter(function(l){ return l.status==="won"; }).length;
  var aiLeads = leads.filter(function(l){ return l.form==="prixna-ai"; }).length;
  // service breakdown top 6
  var svc = {};
  leads.forEach(function(l){ var s=(l.service||"Unknown").slice(0,44); svc[s]=(svc[s]||0)+1; });
  var topSvc = Object.keys(svc).map(function(k){ return {name:k, n:svc[k]}; })
    .sort(function(a,b){ return b.n-a.n; }).slice(0,6);
  // weekly trend last 6 weeks (leads + bookings)
  var weeks = [];
  var now = new Date();
  for(var i=5;i>=0;i--){
    var s = new Date(now.getTime()-(i+1)*7*864e5), e = new Date(now.getTime()-i*7*864e5);
    var n = leads.filter(function(l){ var t=new Date(l.createdAt).getTime(); return t>=s.getTime()&&t<e.getTime(); }).length
      + bookings.filter(function(b){ var t=new Date(b.createdAt).getTime(); return t>=s.getTime()&&t<e.getTime(); }).length;
    weeks.push({ label: (s.getDate())+"/"+(s.getMonth()+1), n: n });
  }
  var maxW = Math.max(1, weeks.reduce(function(m,w){ return Math.max(m,w.n); },0));
  // feedback avg
  var ratings = feedback.map(function(f){ return +f.rating||0; }).filter(function(r){ return r>0; });
  var avg = ratings.length ? (ratings.reduce(function(a,b){return a+b;},0)/ratings.length) : 0;
  var funnel = [
    { label: "AI chats opened", n: aiOpens },
    { label: "AI messages", n: aiMsgs },
    { label: "Form starts", n: formStarts },
    { label: "Leads captured", n: leads.length },
    { label: "Bookings + tickets", n: bookings.length + tickets.length },
    { label: "Won", n: won }
  ];
  var maxF = Math.max(1, funnel.reduce(function(m,f){ return Math.max(m,f.n); },0));
  return { aiOpens:aiOpens, formStarts:formStarts, waClicks:waClicks, aiMsgs:aiMsgs, won:won,
    aiLeads:aiLeads, topSvc:topSvc, weeks:weeks, maxW:maxW, avg:avg, ratings:ratings.length, funnel:funnel, maxF:maxF };
}

function bar(pct){ return '<span style="display:inline-block;height:10px;border-radius:99px;background:linear-gradient(90deg,#1D6FF2,#0A1A38);width:'+Math.max(2,Math.round(pct))+'%"></span>'; }

function render(){
  var anchor = document.getElementById("lead-list");
  if(!anchor || document.getElementById("prixna-analytics")) return;
  var d = compute(load("prixna_events"), load("prixna_leads_v1"), load("prixna_tickets_v1"), load("prixna_bookings_v1"), load("prixna_feedback_v1"));
  var host = document.createElement("div");
  host.id = "prixna-analytics";
  host.innerHTML =
    '<h2 style="margin-top:34px">📊 Conversion funnel (this browser)</h2>'
    + '<div class="card" style="background:#FFFDF6">'
    + d.funnel.map(function(f){
        return '<div style="display:grid;grid-template-columns:150px 1fr 52px;gap:10px;align-items:center;margin:7px 0">'
        + '<span class="small">'+esc(f.label)+'</span>'+bar(f.n/d.maxF*100)+'<b style="text-align:right">'+f.n+'</b></div>';
      }).join("")
    + '<p class="small muted" style="margin:10px 0 0">🤖 '+d.aiLeads+' leads came from Prixna AI chat · ⭐ '+d.ratings+' ratings'+(d.ratings?' (avg '+d.avg.toFixed(1)+'/5)':"")+' · 👆 '+d.waClicks+' tracked button clicks</p></div>'
    + '<div class="grid g2" style="margin-top:16px">'
    + '<div class="card"><b>Top services</b>'
    + (d.topSvc.length? d.topSvc.map(function(s){ return '<div style="display:grid;grid-template-columns:1fr 40px;gap:8px;margin:6px 0"><span class="small">'+esc(s.name)+'</span><b style="text-align:right">'+s.n+'</b></div>'; }).join("") : '<p class="small muted">No leads yet.</p>')
    + '</div><div class="card"><b>Last 6 weeks (leads + bookings)</b>'
    + d.weeks.map(function(w){ return '<div style="display:grid;grid-template-columns:52px 1fr 36px;gap:8px;align-items:center;margin:6px 0"><span class="small muted">'+esc(w.label)+'</span>'+bar(w.n/d.maxW*100)+'<b style="text-align:right">'+w.n+'</b></div>'; }).join("")
    + '</div></div>';
  anchor.parentElement.insertBefore(host, anchor);
}

document.addEventListener("DOMContentLoaded", function(){ setTimeout(render, 600); });
window.PRIXNA_ANALYTICS = { compute: compute, render: render };
})();
