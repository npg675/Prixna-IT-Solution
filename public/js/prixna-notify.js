/* Prixna Notify Bridge — Phase 2 autopilot.
   Sends every lead/ticket/booking/callback to Google Sheets backend (Apps Script),
   queues offline in localStorage outbox, retries automatically.
   Works with zero config (local-only) and lights up when PRIXNA.sheetsEndpoint is set. */
(function () {
"use strict";
if (window.__PRIXNA_NOTIFY_LOADED) return;
window.__PRIXNA_NOTIFY_LOADED = true;
var OUTBOX = "prixna_outbox_v1";
function cfg(){ return window.PRIXNA || {}; }
function loadBox(){ try{ return JSON.parse(localStorage.getItem(OUTBOX)||"[]"); }catch(e){ return []; } }
function saveBox(a){ try{ localStorage.setItem(OUTBOX, JSON.stringify(a.slice(0,200))); }catch(e){} }
function endpoint(){ var c=cfg(); return c.sheetsEndpoint || c.aiBackend || c.formEndpoint || null; }

function staffAlertLink(type, p){
  var c = cfg();
  var staff = (c.staffWhatsApp || c.whatsappNumber || "9779813714582");
  var msg = "🚨 New " + type.toUpperCase() + " — Prixna autopilot\n"
    + "ID: " + (p.id||"-") + "\nName: " + (p.name||"-") + "\nPhone: " + (p.phone||"-") + "\n"
    + "Detail: " + ((p.service||p.device||"") + " " + (p.message||p.problem||p.slot||"")).slice(0,300)
    + "\nPage: " + (location.pathname||"");
  return "https://wa.me/" + staff + "?text=" + encodeURIComponent(msg);
}

function push(type, payload){
  var item = { type:type, payload:payload||{}, ts:new Date().toISOString(), tries:0, page:location.pathname };
  // 1. always queue locally (autopilot never loses a lead)
  var box = loadBox(); box.unshift(item); saveBox(box);
  if(window.PRIXNA_LOG) window.PRIXNA_LOG("autopilot_queue", type+" / "+(payload.id||""));
  // 2. try instant POST
  flush();
  // 3. return staff 1-tap alert link so UI can offer it instantly (works even before backend setup)
  return staffAlertLink(type, payload);
}

function flush(){
  var url = endpoint();
  if(!url) return Promise.resolve({queued:true, reason:"no-endpoint"});
  var box = loadBox();
  if(!box.length) return Promise.resolve({empty:true});
  // send oldest-first, one batch to keep Apps Script simple
  var batch = box.slice(-20);
  return fetch(url, {
    method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify({source:"prixna-autopilot", events:batch})
  }).then(function(r){ return r.text().then(function(t){
      var ok = r.ok;
      if(ok){ // drop sent batch
        var ids = batch.map(function(b){return b.ts;});
        saveBox(loadBox().filter(function(b){return ids.indexOf(b.ts)===-1;}));
        if(window.PRIXNA_LOG) window.PRIXNA_LOG("autopilot_sent", batch.length+" events");
      }
      return {ok:ok, response:t.slice(0,200)};
    });}).catch(function(err){
      // network fail → keep queue, retry on next push / online event
      return {ok:false, error:String(err&&err.message||err)};
    });
}

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(flush, 2500);
  window.addEventListener("online", flush);
});
window.PRIXNA_NOTIFY = { push:push, flush:flush, outbox:loadBox, staffLink:staffAlertLink };
})();
