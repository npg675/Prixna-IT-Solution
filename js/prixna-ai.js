/* Prixna AI — 24/7 Call & Support Center autopilot (local-first, backend-ready).
   Works with zero API key. If window.PRIXNA.aiBackend is set, forwards to it.
   Saves leads/tickets/bookings to localStorage so admin.html staff sees them.
   Chat + Voice (Web Speech), EN + NE, booking, ticketing, callback, human handoff. */
(function () {
"use strict";
if (window.__PRIXNA_AI_LOADED) return; // second copy (Fast Refresh / double inject) must never boot
window.__PRIXNA_AI_LOADED = true;
var C = window.PRIXNA || {};
var PHONE_DISP = C.phoneDisplay || "+977 9813714582";
var PHONE_HREF = C.phoneHref || "tel:+9779813714582";
var WA_NUM = C.whatsappNumber || "9779813714582";
var EMAIL = C.email || "info@prixnaitsolution.com.np";
var HOURS = C.hours || "Sun–Fri, 9:30 AM – 6:30 PM (Sat: closed)";
var BACKEND = C.aiBackend || null; // e.g. "https://your-api.com/prixna-ai"

var LS_MSGS = "prixna_ai_msgs_v1";
var LS_TICKETS = "prixna_tickets_v1";
var LS_BOOKINGS = "prixna_bookings_v1";
var LS_SEEN = "prixna_ai_seen_v1";

function $(s, r){ return (r||document).querySelector(s); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function uid(p){ return (p||"T-")+Date.now().toString(36).toUpperCase()+"-"+Math.floor(Math.random()*1296).toString(36).toUpperCase(); }
function waLink(text){ return "https://wa.me/"+WA_NUM+"?text="+encodeURIComponent(text||"Hello Prixna IT Solution!"); }
function log(ev,detail){ try{ if(window.PRIXNA_LOG) window.PRIXNA_LOG(ev,detail); }catch(e){} }
function loadJSON(k,fb){ try{ var v=JSON.parse(localStorage.getItem(k)||"null"); return v==null?fb:v; }catch(e){ return fb; } }
function saveJSON(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

/* ---------- business hours (Asia/Kathmandu) ---------- */
function ktmNow(){
  try{ return new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Kathmandu"})); }
  catch(e){ return new Date(); }
}
function isOpen(){
  var n = ktmNow(); var day = n.getDay(); // 0 Sun..6 Sat
  if(day===6) return false; // Sat closed
  var mins = n.getHours()*60+n.getMinutes();
  return mins>=570 && mins<=1110; // 9:30-18:30
}
function openNote(){
  return isOpen()
    ? "✅ We're open now ("+HOURS+"). A technician can help you right away."
    : "🌙 We're currently closed ("+HOURS+"). I've noted everything — you'll get a priority callback next working morning. For urgent breakdowns, WhatsApp us and we try our best.";
}

/* ---------- knowledge base ---------- */
function productKB(){
  var d = window.PRIXNA_DATA || {products:[],services:[]};
  var lines = [];
  (d.services||[]).forEach(function(s){ lines.push("• "+s.name+" — "+s.blurb); });
  lines.push("• JigriTools (FREE, live at jigritools.com): 30+ free tools, BS↔AD, EMI, Tax FY 2082/83, Unicode, CV maker, QR, PDF. No signup.");
  lines.push("• Jigri ERP (demo on request): billing+inventory+reports for retail/wholesale. Setup+migration+training included.");
  lines.push("• Jigri CRM + eHajiri (early access): leads/follow-ups + digital attendance, works with our biometric devices.");
  var inStock = (d.products||[]).filter(function(p){return p.stock==="in";}).slice(0,6)
    .map(function(p){return p.name+" (Rs."+p.price+")";});
  if(inStock.length) lines.push("In-stock now: "+inStock.join(" | ")+" — see /shop.html for live pricing.");
  lines.push("CCTV 4ch kit & biometric with setup = price after FREE site visit in Valley.");
  return lines.join("\n");
}

/* ---------- Excel catalog knowledge base ---------- */
var LS_EXCEL_CATALOG = "prixna_excel_catalog_v2";
var excelCatalog = loadJSON(LS_EXCEL_CATALOG, null);

function fetchExcelCatalog(){
  try {
    var primaryUrl = "/data/ai-catalog.json?_t=" + Date.now();
    fetch(primaryUrl)
      .then(function(r){
        if(r.ok) return r.json();
        return fetch("data/ai-catalog.json?_t=" + Date.now()).then(function(r2){ return r2.ok ? r2.json() : null; });
      })
      .then(function(data){
        if(data && data.items && Array.isArray(data.items)){
          excelCatalog = data;
          saveJSON(LS_EXCEL_CATALOG, data);
        }
      }).catch(function(){});
  } catch(e){}
}
fetchExcelCatalog();

function searchExcelProducts(query){
  var STOP_WORDS = /^(the|and|for|with|price|cost|rate|kati|parcha|ko|cha|ma|chahiyo|hajur|nepali|aaja|chha|ho|ke|k|euta|dinus|what|is|of|in|to|it|at|on|by|do|an|as|or|be|if|my|me|we|us|so|up|no|go|where|when|which|who|how|can|you|have|tell|give|need|want|show|help|please|about|this|that|there|any|some|good|bata|lai|le|pani|ra|ani|bhanda|garnus|dinu|kun|kasto|bhandinu|bhanidinu|thaha|pauna|milcha)$/i;
  if(!excelCatalog || !excelCatalog.items || !excelCatalog.items.length){
    excelCatalog = loadJSON(LS_EXCEL_CATALOG, null);
  }
  if(!excelCatalog || !excelCatalog.items || !excelCatalog.items.length) return [];
  var clean = (query || "").toLowerCase()
    .replace(/[^\w\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter(function(w){
      return w.length > 1 && !STOP_WORDS.test(w);
    });
  if(!clean.length) return [];

  var matches = [];
  excelCatalog.items.forEach(function(it){
    var name = (it.name || "").toLowerCase();
    var cat = (it.category || "").toLowerCase();
    var specs = (it.specs || "").toLowerCase();
    var score = 0;
    clean.forEach(function(w){
      if(w.length <= 3){
        var re = new RegExp("(?:^|[^a-zA-Z0-9])" + w + "(?:$|[^a-zA-Z0-9])", "i");
        if(re.test(name)) score += 8;
        else if(re.test(cat)) score += 4;
        else if(re.test(specs)) score += 2;
      } else {
        if(name.indexOf(w) > -1) score += 6;
        else if(cat.indexOf(w) > -1) score += 3;
        else if(specs.indexOf(w) > -1) score += 1;
      }
    });
    if(score > 0){
      matches.push({ item: it, score: score });
    }
  });

  matches.sort(function(a, b){ return b.score - a.score; });
  return matches.slice(0, 3).map(function(m){ return m.item; });
}
function formatExcelResults(items, ne, isFullSpecs){
  if(!items || !items.length) return null;
  var top = items[0];
  try { if(typeof state !== "undefined" && state) state.lastProduct = top; } catch(e){} // Cache last referenced product for quick follow-up

  // If customer explicitly asks for full specs/details
  if(isFullSpecs){
    if(ne){
      var detail = "📋 <b>" + esc(top.name) + " — विस्तृत विवरण (Full Specs):</b>\n"
        + "• 💰 <b>मूल्य:</b> " + esc(top.price) + "\n"
        + "• 📦 <b>स्टक स्थिति:</b> " + esc(top.stock) + "\n"
        + (top.warranty ? "• 🛡️ <b>वारेन्टी:</b> " + esc(top.warranty) + "\n" : "")
        + (top.specs ? "• ⚙️ <b>स्पेसिफिकेसन:</b> " + esc(top.specs) + "\n" : "")
        + (top.notes ? "• 🎁 <b>विशेष नोट:</b> " + esc(top.notes) + "\n" : "");
      return detail + "\nअर्डर वा बुकिङ गर्न <b>book</b> लेख्नुहोस् वा सिधै फोन गर्नुहोस्: <a href='" + PHONE_HREF + "'>📞 " + esc(PHONE_DISP) + "</a>";
    } else {
      var detailEn = "📋 <b>" + esc(top.name) + " — Full Technical Specifications:</b>\n"
        + "• 💰 <b>Price:</b> " + esc(top.price) + "\n"
        + "• 📦 <b>Stock:</b> " + esc(top.stock) + "\n"
        + (top.warranty ? "• 🛡️ <b>Warranty:</b> " + esc(top.warranty) + "\n" : "")
        + (top.specs ? "• ⚙️ <b>Specs:</b> " + esc(top.specs) + "\n" : "")
        + (top.notes ? "• 🎁 <b>Note:</b> " + esc(top.notes) + "\n" : "");
      return detailEn + "\nTo order or reserve, reply <b>book</b> or call us: <a href='" + PHONE_HREF + "'>📞 " + esc(PHONE_DISP) + "</a>.";
    }
  }

  // FOCUSED ANSWER FIRST (Saves customer reading time & LLM tokens)
  // 1. Direct main-point answer for the queried item
  // 2. Recommend 1-2 alternatives in the same category or related options with short details
  var alternatives = items.slice(1, 3);
  if(!alternatives.length && excelCatalog && excelCatalog.items && top.category){
    alternatives = excelCatalog.items.filter(function(it){
      return it.name !== top.name && (it.category || "").toLowerCase() === (top.category || "").toLowerCase();
    }).slice(0, 2);
  }

  if(ne){
    var out = "🎯 <b>" + esc(top.name) + "</b>\n"
      + "💰 <b>मूल्य:</b> <b>" + esc(top.price) + "</b>"
      + " | 📦 " + esc(top.stock)
      + (top.warranty ? " | 🛡️ " + esc(top.warranty) : "");

    if(alternatives.length){
      out += "\n\n💡 <b>यही श्रेणीका अन्य विकल्पहरू (Similar Options):</b>\n";
      out += alternatives.map(function(alt){
        return "• <b>" + esc(alt.name) + "</b>: 💰 " + esc(alt.price) + " (" + esc(alt.stock || "Available") + ")";
      }).join("\n");
    }

    out += "\n\n👉 विस्तृत फिचर्स हेर्न <b>specs</b> लेख्नुहोस् वा अर्डर गर्न <b>book</b> भन्नुहोस्।";
    return out;
  } else {
    var outEn = "🎯 <b>" + esc(top.name) + "</b>\n"
      + "💰 <b>Price:</b> <b>" + esc(top.price) + "</b>"
      + " | 📦 Status: " + esc(top.stock)
      + (top.warranty ? " | 🛡️ " + esc(top.warranty) : "");

    if(alternatives.length){
      outEn += "\n\n💡 <b>Other options in this category:</b>\n";
      outEn += alternatives.map(function(alt){
        return "• <b>" + esc(alt.name) + "</b>: 💰 " + esc(alt.price) + " (" + esc(alt.stock || "Available") + ")";
      }).join("\n");
    }

    outEn += "\n\n👉 Reply <b>specs</b> for full technical details, or <b>book</b> to reserve.";
    return outEn;
  }
}

/* ---------- keyword matching engine ---------- */
function matchAny(t, words){
  t = (t || "").toLowerCase();
  for(var i=0; i<words.length; i++){
    var w = (words[i] || "").toLowerCase();
    if(/[\u0900-\u097F]/.test(w) || w.indexOf(" ") > -1){
      if(t.indexOf(w) > -1) return true;
    } else {
      var re = new RegExp("(?:^|[^a-zA-Z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:$|[^a-zA-Z0-9])", "i");
      if(re.test(t)) return true;
    }
  }
  return false;
}

/* ---------- intent engine ---------- */
function detectIntent(t){
  t = (t||"").toLowerCase();
  var has = function(){ return matchAny(t, Array.prototype.slice.call(arguments)); };
  if(has("talk to human","speak with human","talk to person","human agent","human support","technician sanga","staff sanga","representative","प्रतिनिधि","मान्छेसँग कुरा","फोन गर्नुस्","call me back","call me")) return "human";
  if(has("book","schedule","appointment","visit","site visit","installation book","amc","booking","समय","अपोइन्ट","समय मिलाउन","बुक","बुकिङ","अर्डर","रिजर्भ")) return "booking";
  if(has("callback","call back","phone garnu","phone garnus","फोन","फर्क","फोन गर")) return "callback";
  if(has("showcase","new items","new products","latest items","hardware showcase","software showcase","शोकेस","नयाँ सामान")) return "showcase";
  if(has("enquiry","inquiry","services","service","products","product","catalog","catalogue","items","item","list","options","what do you sell","what do you have","what do you do","sewa","सामान","सेवा","के के छ","के पाइन्छ","सुविधा")) return "catalog_browse";
  if(has("price","rate","cost","kati","kati par","quotation","quote","मूल्य","पैसा","कति","दाम","शुल्क")) return "price";
  if(has("cctv","camera","dvr","सिसि","क्यामरा")) return "cctv";
  if(has("biometric","attendance","hajiri","e-hajiri","ehajiri","leave","payroll","हाजिरी","हाजिर")) return "attendance";
  if(has("laptop","computer","desktop","printer","scanner","mouse","ups","router","माउस","ल्यापटप","कम्प्युटर","प्रिन्टर")) return "hardware";
  if(has("wifi","network","lan","server","internet","वाईफाई","नेट","इन्टरनेट")) return "network";
  if(has("demo","demonstration","trial video","watch video","video link","youtube","watch demo","live demo","डेमो","भिडियो","भिडियो हेर्न","डेमो हेर्न","ट्रायल")) return "demo";
  if(has("watched demo","saw demo","saw video","demo herisake","demo heren","demo watched","interested after demo","subscribe software","software subscription","सब्सक्रिप्सन","डेमो हेरिसकें","मन पर्यो")) return "demo";
  if(has("erp","billing","inventory","stock","crm","software","website","app","jigri","saas","accounting","restaurant","kot","pos","ehajiri","बिलिङ","सफ्टवेयर","बिल")) return "software";
  if(has("repair","bigo","bigryo","maintenance","problem","issue","error","not working","support","baneko","bend","बिग्र","समस्या","बनेन","चल","बिग्रियो","मर्मत")) return "support";
  if(has("marketing","digital","ai automation","automation","facebook","tiktok","ads")) return "marketing";
  if(has("namaste","hello","hi ","hey","नमस्ते","सलाम","hajur","हजुर")) return "greet";
  if(has("hour","open","closed","location","address","where","kaha","kaha cha","map","कहाँ","खुल","ठेगाना","पसल")) return "info";
  if(has("track","status","ticket","order","मेरो")) return "status";
  if(has("thank","dhanyabad","धन्यवाद","ramro","mitho")) return "thanks";
  if(has("review","rating","star","feedback","समीक्षा","तारा")) return "feedback";
  if(has("bulk","dealer","wholesale","distributor","reseller","resell","thok","margin","carton","quantity order","थोक","डिलर")) return "bulk";
  return "general";
}
var NE_REGEX = /\b(hajur|namaste|namaskar|dhanyabad|dhanyavad|sanchai|sanchhai|kura|bolna|bolnu|bolnus|bhannu|bhannus|bhandinus|bhandinu|sodheko|sodhnu|sodhnus|nepali|nepalima|nepalese|bhasa|bhasha|garnu|garnus|garne|garna|gareko|garidinus|dinu|dinus|dina|parcha|parchha|parne|paryo|paryaa|lagcha|lagchha|lagne|milcha|milchha|milla|huncha|hunchha|hudaina|bhayo|bhaeko|bhayeko|cha|chha|chaina|chhaina|ho|haina|chahiyo|chahiyeko|chahincha|chahine|khojeko|khojne|bujhe|bujhina|banauna|banaucha|banauchha|banidine|bigriyo|bigreko|bigryo|rakhna|jadan|jodan|chalcha|chaldaina|aaucha|aauncha|kati|kasto|kun|kahile|kaha|kata|kina|kin|kasari|k|ke|ma|malai|mero|hamro|tapai|tapaiko|tapailai|timi|timro|uhako|manche|pasal|marmat|sewa|kharcha|paisa|darret|sasto|mahango|ramro|naramro|thik|aaja|bholi|parsi|bata|samma|dekhi|ko|lai|le|ra|ani|pani|haru|dai|bhai|didi|shubha|subha|bihani|euta|sunau|sunidinu|chutkila)\b/i;
function isNepali(t){
  return /[\u0900-\u097F]/.test(t||"") || NE_REGEX.test(t||"");
}

/* ---------- state ---------- */
var LS_LANG = "prixna_ai_lang_v1";
var initialLang = "ne";
try { var savedLang = localStorage.getItem(LS_LANG); if(savedLang==="en"||savedLang==="ne") initialLang=savedLang; } catch(e){}
var state = { mode:"idle", step:0, data:{}, lang: initialLang };
var greeted = false;

function saveLead(o){
  try{
    var k="prixna_leads_v1";
    var arr=loadJSON(k,[]);
    var lead={ id:uid("L-"), createdAt:new Date().toISOString(), form:"prixna-ai",
      name:o.name||"", phone:o.phone||"", email:o.email||"", company:o.company||"",
      location:o.location||"", service:o.service||"AI Chat Enquiry", message:o.message||"",
      source:{landing:location.pathname}, status:"new", followUp:"", assignee:"",
      history:[{ts:new Date().toISOString(),note:"Prixna AI autopilot: "+(o.note||"chat enquiry")}] };
    arr.unshift(lead); saveJSON(k,arr);
    try{
      if(o.name) localStorage.setItem("prixna_customer_name", o.name);
      if(o.phone) localStorage.setItem("prixna_customer_phone", o.phone);
      if(o.email) localStorage.setItem("prixna_customer_email", o.email);
    }catch(e){}
    // Phase 2 autopilot: instant Sheet log + staff alert (queued offline-safe)
    try { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("lead", lead); } catch (e) {}
    // optional backend forward
    if(C.formEndpoint){ try{ fetch(C.formEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(lead)}).catch(function(){}); }catch(e){} }
    if(BACKEND){ try{ fetch(BACKEND+"/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(lead)}).catch(function(){}); }catch(e){} }
    return lead;
  }catch(e){ return {id:"L-LOCAL"}; }
}
function saveTicket(o){
  var arr=loadJSON(LS_TICKETS,[]);
  var t={id:uid("T-"),createdAt:new Date().toISOString(),name:o.name||"",phone:o.phone||"",email:o.email||"",
    device:o.device||"",problem:o.problem||"",priority:o.priority||"Medium",status:"open",transcript:o.transcript||""};
  arr.unshift(t); saveJSON(LS_TICKETS,arr);
  try{
    if(o.name) localStorage.setItem("prixna_customer_name", o.name);
    if(o.phone) localStorage.setItem("prixna_customer_phone", o.phone);
    if(o.email) localStorage.setItem("prixna_customer_email", o.email);
  }catch(e){}
  try { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("ticket", t); } catch (e) {}
  return t;
}
function saveBooking(o){
  var arr=loadJSON(LS_BOOKINGS,[]);
  var b={id:uid("B-"),createdAt:new Date().toISOString(),name:o.name||"",phone:o.phone||"",email:o.email||"",
    service:o.service||"",day:o.day||"",time:o.time||"",location:o.location||"",status:"confirmed"};
  arr.unshift(b); saveJSON(LS_BOOKINGS,arr);
  try{
    if(o.name) localStorage.setItem("prixna_customer_name", o.name);
    if(o.phone) localStorage.setItem("prixna_customer_phone", o.phone);
    if(o.email) localStorage.setItem("prixna_customer_email", o.email);
  }catch(e){}
  try { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("booking", b); } catch (e) {}
  return b;
}
function getCustomerProfile(){
  var name = (state && state.data && state.data.name) || "";
  var phone = (state && state.data && state.data.phone) || "";
  var email = (state && state.data && state.data.email) || "";
  try{
    if(!name) name = localStorage.getItem("prixna_customer_name") || "";
    if(!phone) phone = localStorage.getItem("prixna_customer_phone") || "";
    if(!email) email = localStorage.getItem("prixna_customer_email") || "";
  }catch(e){}
  var bookings = loadJSON(LS_BOOKINGS, []);
  var latestBooking = null;
  if(bookings && bookings.length){
    latestBooking = bookings[0];
    if(!name && latestBooking.name) name = latestBooking.name;
    if(!phone && latestBooking.phone) phone = latestBooking.phone;
    if(!email && latestBooking.email) email = latestBooking.email;
  }
  if(!name || !phone){
    var leads = loadJSON("prixna_leads_v1", []);
    if(leads && leads.length){
      for(var i=0; i<leads.length; i++){
        if(!name && leads[i].name) name = leads[i].name;
        if(!phone && leads[i].phone) phone = leads[i].phone;
        if(!email && leads[i].email) email = leads[i].email;
        if(name && phone) break;
      }
    }
  }
  var age = "";
  try{ age = localStorage.getItem("prixna_customer_age") || ""; }catch(e){}
  return { name: name.trim(), phone: phone.trim(), email: email.trim(), age: age.trim(), latestBooking: latestBooking };
}
function parseAgeNumber(str){
  if(!str) return 0;
  var devMap = {"०":"0","१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9"};
  var normalized = String(str).replace(/[०-९]/g, function(d){ return devMap[d] || d; });
  var m = normalized.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}
function validPhone(p){ var d=String(p||"").replace(/\D/g,""); return d.length>=10&&d.length<=14?d:null; }

/* ---------- calendar invite (local, offline-safe) ---------- */
function nextDateForDay(dayLabel, timeLabel){
  try{
    var days={sun:0,sunday:0,mon:1,monday:1,tue:2,tuesday:2,wed:3,wednesday:3,thu:4,thursday:4,fri:5,friday:5};
    var key=Object.keys(days).find(function(k){ return new RegExp(k,"i").test(dayLabel||""); });
    if(!key) return null;
    var now=new Date(); var d=new Date(now);
    var delta=(days[key]-d.getDay()+7)%7;
    d.setDate(d.getDate()+delta);
    var m=String(timeLabel||"").match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    var hh=m?parseInt(m[1],10):11, mm=m&&m[2]?parseInt(m[2],10):0, ap=m&&m[3]?m[3].toLowerCase():null;
    if(ap==="pm"&&hh<12)hh+=12; if(ap==="am"&&hh===12)hh=0; if(!ap&&hh<9)hh+=12;
    d.setHours(Math.min(Math.max(hh,9),18),mm,0,0);
    if(d.getTime()<=now.getTime())d.setDate(d.getDate()+7);
    if(d.getDay()===6)d.setDate(d.getDate()+1);
    return d;
  }catch(e){ return null; }
}
function gcalLink(title, start, end, loc){
  function f(d){ function p(n){return String(n).padStart(2,"0");} return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+"T"+p(d.getHours())+p(d.getMinutes())+"00"; }
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(title)
    +"&dates="+f(start)+"/"+f(end)+"&location="+encodeURIComponent(loc||"Koteshwor-32, Kathmandu");
}
function icsDownloadLink(title, start, end, loc, desc){
  function f(d){ var u=new Date(d.getTime()-(5*60+45)*60000); function p(n){return String(n).padStart(2,"0");}
    return u.getUTCFullYear()+p(u.getUTCMonth()+1)+p(u.getUTCDate())+"T"+p(u.getUTCHours())+p(u.getUTCMinutes())+"00Z"; }
  var ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Prixna//Booking//EN","BEGIN:VEVENT","UID:"+Date.now()+"@prixna","DTSTAMP:"+f(new Date()),"DTSTART:"+f(start),"DTEND:"+f(end),"SUMMARY:"+title,"DESCRIPTION:"+desc,"LOCATION:"+(loc||"Koteshwor-32, Kathmandu"),"END:VEVENT","END:VCALENDAR"].join("\r\n");
  return "data:text/calendar;charset=utf-8,"+encodeURIComponent(ics);
}

/* ---------- contextual intelligence & answers ---------- */
function getLink(key){
  var isNext = (typeof window !== "undefined" && (
    (window.PRIXNA && window.PRIXNA.isNextApp) ||
    (window.location && typeof window.location.pathname === "string" && !/\.html$/i.test(window.location.pathname) && window.location.protocol !== "file:")
  ));
  var nextLinks = {
    shop: "/solutions/hardware-infrastructure",
    quote: "/contact",
    repair: "/solutions/it-support-maintenance",
    contact: "/contact",
    demo: "/demo",
    cctv: "/solutions/cctv-security",
    biometric: "/solutions/biometric-access",
    networking: "/solutions/networking-servers",
    marketing: "/solutions/digital-marketing-ai",
    bulk: "/contact?service=Bulk%20%2F%20Dealer%20Enquiry",
    feedback: "/contact",
    jigri: "https://jigritools.com/"
  };
  var staticLinks = {
    shop: "shop.html",
    quote: "quote.html",
    repair: "repair-maintenance.html",
    contact: "contact.html",
    demo: "demo.html",
    cctv: "cctv-security.html",
    biometric: "biometric-access.html",
    networking: "networking-servers.html",
    marketing: "digital-marketing-ai.html",
    bulk: "bulk-quote.html",
    feedback: "feedback.html",
    jigri: "https://jigritools.com/"
  };
  var table = isNext ? nextLinks : staticLinks;
  return table[key] || staticLinks[key] || "#";
}

var LINKS = {
  get shop() { return getLink("shop"); },
  get quote() { return getLink("quote"); },
  get repair() { return getLink("repair"); },
  get contact() { return getLink("contact"); },
  get demo() { return getLink("demo"); },
  get cctv() { return getLink("cctv"); },
  get biometric() { return getLink("biometric"); },
  get networking() { return getLink("networking"); },
  get marketing() { return getLink("marketing"); },
  get bulk() { return getLink("bulk"); },
  get feedback() { return getLink("feedback"); },
  get jigri() { return getLink("jigri"); }
};

/* ---------- software demo flow (admin-editable via dashboard) ---------- */
var BUILTIN_DEMOS = [
  {
    id: "jigri-erp",
    name: "Jigri ERP — Billing + Inventory",
    tagline: "VAT/PAN billing, stock & day-book for retail, wholesale and marts across Nepal",
    category: "Billing & ERP",
    icon: "🧾",
    duration: "4 min demo",
    features: [
      "VAT/PAN invoice printing in 20 seconds",
      "Real-time stock alerts & purchase tracking",
      "Daily sales & profit/loss summary",
      "Bilingual interface (Nepali & English)"
    ],
    audience: "Retail shops, wholesale, supermarkets, hardware stores",
    consultService: "Business Software / SaaS Demo",
    planHint: "Custom NPR plan with setup, staff training & local support"
  },
  {
    id: "restaurant-pos",
    name: "Restaurant & Hotel POS + KOT",
    tagline: "Table management, kitchen KOT & split billing in one screen",
    category: "Hospitality",
    icon: "🍽️",
    duration: "3 min demo",
    features: [
      "Visual floor plan & live table orders",
      "Instant 1-click KOT printing to kitchen",
      "Split bills, discounts & VAT billing",
      "Daily cash collection & steward reports"
    ],
    audience: "Restaurants, cafes, bakeries, bars, hotels",
    consultService: "Restaurant / Hospitality Solution",
    planHint: "POS subscription + setup quoted in NPR with on-site training"
  },
  {
    id: "jigri-crm",
    name: "Jigri CRM — Leads & Pipeline",
    tagline: "Never lose a customer enquiry or follow-up again",
    category: "CRM",
    icon: "📊",
    duration: "3 min demo",
    features: [
      "Centralized lead inbox across website & calls",
      "Automated WhatsApp & call follow-up reminders",
      "Quotation pipeline & deal stages",
      "Sales executive team performance tracking"
    ],
    audience: "B2B businesses, service agencies, trading & sales teams",
    consultService: "Accounting / ERP / CRM",
    planHint: "Per-user flexible NPR subscription with setup assistance"
  },
  {
    id: "ehajiri-attendance",
    name: "eHajiri + Biometric Attendance",
    tagline: "Fingerprint device integration + mobile attendance & payroll",
    category: "Attendance",
    icon: "👆",
    duration: "3 min demo",
    features: [
      "Biometric fingerprint/face machine integration",
      "Staff mobile attendance & leave tracking",
      "Monthly automated payroll & shift calculation",
      "Valley-wide on-site machine installation"
    ],
    audience: "Offices, schools, colleges, factories, health clinics",
    consultService: "Attendance & Payroll",
    planHint: "Hardware device + cloud subscription bundle with warranty"
  },
  {
    id: "jigritools-suite",
    name: "JigriTools — 30+ Free Nepali Tools",
    tagline: "BS↔AD date converter, EMI, Tax FY 2082/83, Unicode & QR",
    category: "Free Tools",
    icon: "🧰",
    duration: "2 min tour",
    features: [
      "100% Free online tools — no login required",
      "Official Bikram Sambat date converter & Nepali calendar",
      "Salary tax calculator FY 2082/83 & loan EMI calculator",
      "Built & maintained proudly by Prixna IT Solution"
    ],
    audience: "Every business owner, accountant, student & professional",
    consultService: "JigriTools Enquiry",
    planHint: "Free forever — visit jigritools.com"
  }
];

function demosForAI(){
  try{
    if(window.PRIXNA_DEMOS && typeof window.PRIXNA_DEMOS.active === "function"){
      var act = window.PRIXNA_DEMOS.active();
      if(act && act.length) return act;
    }
    var v = JSON.parse(localStorage.getItem("prixna_demos_v1")||"null");
    if(Array.isArray(v) && v.length){
      var filtered = v.filter(function(d){ return d && d.active !== false; });
      if(filtered.length) return filtered;
    }
  }catch(e){}
  return BUILTIN_DEMOS.slice();
}

// Background seed cache
try{
  if(typeof window !== "undefined" && !localStorage.getItem("prixna_demos_v1")){
    fetch("/data/software-demos.json")
      .then(function(r){ return r.json(); })
      .then(function(j){
        if(j && Array.isArray(j.demos)) localStorage.setItem("prixna_demos_v1", JSON.stringify(j.demos));
      }).catch(function(){});
  }
}catch(e){}

function demoPageLink(id){
  var isNext = (typeof window !== "undefined" && (
    (window.PRIXNA && window.PRIXNA.isNextApp) ||
    (window.location && typeof window.location.pathname === "string" && !/\.html$/i.test(window.location.pathname) && window.location.protocol !== "file:")
  ));
  var base = isNext ? "/demo" : "demo.html";
  return id ? (base + "?product=" + encodeURIComponent(id)) : base;
}

function findDemosByText(text){
  var t = (text||"").toLowerCase();
  var all = demosForAI();
  if(!all.length) return [];
  var scored = [];
  all.forEach(function(d){
    var hay = ((d.name||"")+" "+(d.tagline||"")+" "+(d.category||"")+" "+(d.id||"")+" "+(d.audience||"")+" "+((d.features||[]).join(" "))).toLowerCase();
    var score = 0;
    // ERP / Billing
    if(/(erp|billing|inventory|stock|account|बिलिङ|बिल|स्टक|खाता|पसल|मार्ट|wholesale|retail)/i.test(t) && /erp|billing|inventory|account/i.test(hay)) score += 6;
    if(/jigri-erp/.test(d.id) && /(erp|billing|पसल|स्टक|बिल)/i.test(t)) score += 5;
    // Restaurant / POS
    if(/(pos|restaurant|hotel|kot|cafe|food|रेस्टुरेन्ट|होटेल|क्याफे|टेबल|किचेन|table|kitchen)/i.test(t) && /pos|restaurant|hotel|kot/i.test(hay)) score += 6;
    if(/restaurant-pos/.test(d.id) && /(pos|restaurant|होटेल|रेस्टुरेन्ट|kot)/i.test(t)) score += 5;
    // CRM
    if(/(crm|lead|pipeline|follow|ग्राहक|सिआरएम)/i.test(t) && /crm|lead/i.test(hay)) score += 6;
    if(/jigri-crm/.test(d.id) && /(crm|lead|सिआरएम|फलो)/i.test(t)) score += 5;
    // Attendance / eHajiri
    if(/(attend|hajiri|ehajiri|payroll|biometric|school|staff|हाजिरी|बायोमेट्रिक|पेरोल|फिंगर)/i.test(t) && /attend|hajiri|payroll|biometric/i.test(hay)) score += 6;
    if(/ehajiri-attendance/.test(d.id) && /(hajiri|attend|हाजिरी|बायोमेट्रिक|biometric)/i.test(t)) score += 5;
    // Tools
    if(/(jigri\s*tool|free tool|unicode|emi|date convert|टुल)/i.test(t) && /jigri|tool/i.test(hay)) score += 6;
    // Exact ID match
    if(new RegExp("(?:^|[^a-z0-9])" + d.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:$|[^a-z0-9])", "i").test(t)) score += 10;
    // Word overlap
    var words = t.replace(/[^\w\u0900-\u097F\s]/g," ").split(/\s+/).filter(function(w){return w.length>3;});
    words.forEach(function(w){ if(hay.indexOf(w)>-1) score += 2; });
    if(score>0) scored.push({d:d,score:score});
  });
  scored.sort(function(a,b){return b.score-a.score;});
  return scored.map(function(s){return s.d;});
}

/* Smart contextual resolution of which demo product the user wants */
function getSmartDemoContext(text){
  var all = demosForAI();
  if(!all || !all.length) return null;
  var t = (text || "").toLowerCase();

  // 1. Direct query matching in current text (highest confidence)
  var direct = findDemosByText(t);
  if(direct && direct.length){
    // If the text specifically mentions ERP, POS, CRM, attendance, or only 1 match
    if(direct.length === 1 || /(erp|pos|crm|attend|hajiri|billing|restaurant|hotel|kot|biometric|payroll|पसल|रेस्टुरेन्ट)/i.test(t)){
      return direct[0];
    }
  }

  // 2. Explicit ID or URL parameter match
  var idMatch = String(text || "").match(/(?:product|demo)=([a-z0-9\-]+)/i);
  if(idMatch){
    for(var i = 0; i < all.length; i++){
      if(all[i].id === idMatch[1]) return all[i];
    }
  }

  // 3. Last discussed demo in this session
  if(state && state.lastDiscussedDemo){
    for(var j = 0; j < all.length; j++){
      if(all[j].id === state.lastDiscussedDemo) return all[j];
    }
  }

  // 4. Last discussed product / shop item in session
  if(state && state.lastProduct){
    var pName = ((state.lastProduct.name||"") + " " + (state.lastProduct.category||"") + " " + (state.lastProduct.description||"")).toLowerCase();
    var fromP = findDemosByText(pName);
    if(fromP && fromP.length) return fromP[0];
  }

  // 5. Scan recent chat messages in history (last 5 messages from user or bot)
  try {
    if(typeof history !== "undefined" && history && history.length){
      var recentHistory = history.slice(-5).map(function(m){ return stripTags(m.html || ""); }).join(" ").toLowerCase();
      var fromHist = findDemosByText(recentHistory);
      if(fromHist && fromHist.length) return fromHist[0];
    }
  }catch(e){}

  // 6. Active webpage path context (e.g. browsing a specific service page)
  try {
    var path = (typeof window !== "undefined" && window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : "";
    if(/restaurant|hospitality|cafe|food|kot|hotel/i.test(path)){
      for(var k = 0; k < all.length; k++){ if(all[k].id === "restaurant-pos") return all[k]; }
    }
    if(/accounting|billing|erp|stock|inventory/i.test(path)){
      for(var k = 0; k < all.length; k++){ if(all[k].id === "jigri-erp") return all[k]; }
    }
    if(/crm|leads|pipeline/i.test(path)){
      for(var k = 0; k < all.length; k++){ if(all[k].id === "jigri-crm") return all[k]; }
    }
    if(/attendance|biometric|hajiri|payroll/i.test(path)){
      for(var k = 0; k < all.length; k++){ if(all[k].id === "ehajiri-attendance") return all[k]; }
    }
    if(/jigritools|tools/i.test(path)){
      for(var k = 0; k < all.length; k++){ if(all[k].id === "jigritools-suite") return all[k]; }
    }
  }catch(e){}

  return null;
}

function singleDemoSmartAnswer(d, ne){
  state.lastDiscussedDemo = d.id;
  try{ if(window.PRIXNA_LOG) window.PRIXNA_LOG("ai_demo_view", d.id); }catch(e){}

  var link = demoPageLink(d.id);
  var consult = LINKS.quote + "?service=" + encodeURIComponent(d.consultService || d.name) + "&product=" + encodeURIComponent(d.id);
  var num = (window.PRIXNA || {}).whatsappNumber || "9779813714582";
  var wa = "https://wa.me/" + num + "?text=" + encodeURIComponent("Hello Prixna IT Solution! I want to watch/know more about the " + d.name + " demo (" + link + "). Please guide me on free consultation & pricing.");

  var feats = "";
  if(d.features && d.features.length){
    feats = d.features.slice(0, 4).map(function(f){ return "• " + esc(f); }).join("\n");
  }

  var webUrl = d.websiteUrl || d.liveDemoUrl || "";
  var webCtaNe = webUrl ? "👉 <a href='" + esc(webUrl) + "' target='_blank' rel='noopener'>🌐 <b>उत्पादनको वेबसाइट / लाइभ एप खोल्नुहोस् ↗</b></a>\n" : "";
  var webCtaEn = webUrl ? "👉 <a href='" + esc(webUrl) + "' target='_blank' rel='noopener'>🌐 <b>Visit Official Product Website ↗</b></a>\n" : "";

  if(ne){
    return "🎬 <b>" + (d.icon||"💼") + " " + esc(d.name) + " — भिडियो डेमो</b>\n" +
      "<i>" + esc(d.tagline || "") + "</i>\n\n" +
      "हाम्रो <b>डेमो थिएटर</b> मा " + esc(d.duration || "२–४ मिनेट") + " को भिडियो तुरुन्त हेर्नुहोस्:\n" +
      "👉 <a href='" + link + "' class='prixna-ai-demo-cta'><b>🎬 " + esc(d.name) + " डेमो हेर्नुहोस् ↗</b></a>\n" +
      webCtaNe + "\n" +
      (feats ? "✨ <b>यो डेमोमा देख्न पाउनुहुनेछ:</b>\n" + feats + "\n\n" : "") +
      (d.audience ? "👥 <b>उपयुक्त:</b> " + esc(d.audience) + "\n\n" : "") +
      "💡 <b>अर्को कदम:</b> डेमो मन परे <b>निःशुल्क परामर्श</b> लिनुहोस् — हाम्रो टिमले तपाईंको काम बुझेर सेटअप, स्टाफ तालिम र नेपाली दररेट मिलाइदिनेछ:\n" +
      "👉 <a href='" + consult + "'><b>🆓 निःशुल्क परामर्श बुक गर्नुहोस्</b></a>\n" +
      "👉 <a href='" + wa + "' target='_blank' rel='noopener'>💬 WhatsApp मा कुरा गर्नुहोस्</a>\n\n" +
      "👉 <a href='" + demoPageLink("") + "'>🎭 सबै सफ्टवेयर डेमोहरू हेर्नुहोस्</a>";
  }

  return "🎬 <b>" + (d.icon||"💼") + " " + esc(d.name) + " — Video Demo</b>\n" +
    "<i>" + esc(d.tagline || "") + "</i>\n\n" +
    "Watch the complete " + esc(d.duration || "2–4 min") + " walkthrough directly in our <b>Demo Theatre</b>:\n" +
    "👉 <a href='" + link + "' class='prixna-ai-demo-cta'><b>🎬 Watch " + esc(d.name) + " Demo ↗</b></a>\n" +
    webCtaEn + "\n" +
    (feats ? "✨ <b>Highlights in this demo:</b>\n" + feats + "\n\n" : "") +
    (d.audience ? "👥 <b>Best for:</b> " + esc(d.audience) + "\n\n" : "") +
    "💡 <b>Next Step:</b> Liked what you saw? Get a <b>free 1-on-1 consultation & setup quote</b> for your business:\n" +
    "👉 <a href='" + consult + "'><b>🆓 Book Free Consultation</b></a>\n" +
    "👉 <a href='" + wa + "' target='_blank' rel='noopener'>💬 Chat on WhatsApp</a>\n\n" +
    "👉 <a href='" + demoPageLink("") + "'>🎭 Browse All Software Demos</a>";
}

function demoListAnswer(ne, highlight){
  var all = demosForAI();
  if(!all.length){
    return ne
      ? "🎬 <b>सफ्टवेयर डेमो:</b> हाम्रो डेमो थिएटर तयार हुँदैछ। तपाईं कुन सफ्टवेयर हेर्न चाहनुहुन्छ — बिलिङ (ERP), रेस्टुरेन्ट POS, CRM वा हाजिरी? भन्नुहोस्, म तुरुन्त डेमो मिलाइदिन्छु। 👉 <a href='"+LINKS.quote+"?service=Business%20Software%20%2F%20SaaS%20Demo'>निःशुल्क डेमो माग्नुहोस्</a>"
      : "🎬 <b>Software Demos:</b> Our Demo Theatre is live. Which software would you like to watch — Billing (ERP), Restaurant POS, CRM, or Attendance? Reply or request here: 👉 <a href='"+LINKS.quote+"?service=Business%20Software%20%2F%20SaaS%20Demo'>Request free demo</a>";
  }

  // If a single product is highlighted/matched, show single smart demo!
  if(highlight && highlight.length === 1){
    return singleDemoSmartAnswer(highlight[0], ne);
  }

  var items = (highlight && highlight.length ? highlight : all).slice(0, 4);
  function line(d, idx){
    return (idx + 1) + ". " + (d.icon||"💼") + " <b>" + esc(d.name) + "</b> (" + esc(d.duration||"२–४ मिनेट") + ")\n" +
      "   • <i>" + esc(d.tagline||"") + "</i>\n" +
      "   👉 <a href='" + demoPageLink(d.id) + "'><b>🎬 " + (ne ? "यो डेमो हेर्नुहोस्" : "Watch " + esc(d.name) + " Demo") + " ↗</b></a>";
  }

  var theatreLink = demoPageLink("");

  if(ne){
    return "🎬 <b>प्रिक्सना सफ्टवेयर डेमो थिएटर:</b>\n" +
      "हाम्रो डेमो थिएटरमा हाम्रा प्रमुख सफ्टवेयरहरूको २–४ मिनेटको भिडियो हेर्न सकिन्छ! कुन सफ्टवेयर हेर्न चाहनुहुन्छ, सिधै लिंक थिच्नुहोस्:\n\n" +
      items.map(function(d, i){ return line(d, i); }).join("\n\n") +
      "\n\n👉 <a href='" + theatreLink + "' style='font-weight:700;'>🎭 सबै डेमो थिएटरमा हेर्नुहोस् ↗</a>\n\n" +
      "💡 <i>कुनै पनि सफ्टवेयरको नाम भन्नुहोस् (जस्तै: 'ERP डेमो' वा 'POS डेमो') वा तलका बटनहरू थिच्नुहोस्!</i>";
  }

  return "🎬 <b>Prixna Software Demo Theatre:</b>\n" +
    "Watch 2–4 minute video walkthroughs of our key business softwares right inside our Demo Theatre! Select any product to watch:\n\n" +
    items.map(function(d, i){ return line(d, i); }).join("\n\n") +
    "\n\n👉 <a href='" + theatreLink + "' style='font-weight:700;'>🎭 Browse All Demos in Demo Theatre ↗</a>\n\n" +
    "💡 <i>Tap any link above to start watching, or select a product button below!</i>";
}

function demoWatchedAnswer(d, ne){
  try{ if(window.PRIXNA_LOG) window.PRIXNA_LOG("ai_demo_interested", d.id); }catch(e){}
  var cl = LINKS.quote + "?service=" + encodeURIComponent(d.consultService||"Business Software / SaaS Demo") + "&product=" + encodeURIComponent(d.id);
  var wa = "https://wa.me/"+WA_NUM+"?text="+encodeURIComponent("Hello Prixna! I watched the "+d.name+" demo ("+demoPageLink(d.id)+") and I am interested. Please arrange free consultation + subscription details.");
  return ne
    ? "🎉 <b>बधाई छ!</b> तपाईंले <b>" + esc(d.name) + "</b> को डेमो हेर्नुभयो — अब अर्को २ स्टेप बाँकी छ:\n\n<b>2️⃣ निःशुल्क परामर्श:</b> हामी तपाईंको व्यवसायको दैनिक काम (बिलिङ/स्टक/टेबल/KOT/हाजिरी) बुझ्छौं — फोन, WhatsApp वा उपत्यकामा निःशुल्क साइट भिजिट।\n<b>3️⃣ सब्सक्रिप्सन:</b> " + esc(d.planHint||"NPR कोटेसनपछि सरल प्लान") + "। सेटअप + स्टाफ तालिम + सपोर्टसहित।\n\n👉 <a href='" + cl + "'><b>🆓 निःशुल्क परामर्श बुक गर्नुहोस्</b></a>\n👉 <a href='" + wa + "' target='_blank' rel='noopener'>💬 WhatsApp मा कुरा गर्नुहोस्</a>\n\nअहिले नै बुकिङ गरिदिऊँ? <b>'book'</b> लेख्नुहोस् — म ३० सेकेन्डमा समय मिलाइदिन्छु।"
    : "🎉 <b>Great — you watched the " + esc(d.name) + " demo!</b> Two quick steps left:\n\n<b>2️⃣ Free consultation:</b> we study your daily workflow (billing/stock/tables/KOT/attendance) — by call, WhatsApp or free Valley site visit.\n<b>3️⃣ Subscribe:</b> " + esc(d.planHint||"simple NPR plan after consultation") + ". Setup + staff training + support included.\n\n👉 <a href='" + cl + "'><b>🆓 Book free consultation</b></a>\n👉 <a href='" + wa + "' target='_blank' rel='noopener'>💬 Chat on WhatsApp</a>\n\nWant me to book you now? Type <b>'book'</b> — 30 seconds. Or ask <i>'price'</i> / <i>'features'</i> for this software.";
}


/* ---------- NEW showcase (replaces old shop list for recommendations) ---------- */
function showcaseForAI(){
  try{
    if(window.PRIXNA_SHOWCASE) return window.PRIXNA_SHOWCASE.items();
    var v = JSON.parse(localStorage.getItem("prixna_showcase_v1") || "{}");
    return ((v && v.items) || []).filter(function (x) { return x.active !== false; });
  }catch(e){ return []; }
}
function showcaseAnswer(ne, matched){
  var all = showcaseForAI();
  if(!all.length){
    return ne
      ? "✨ <b>नयाँ शोकेस तयार हुँदैछ।</b> तपाईंलाई के चाहिन्छ — सफ्टवेयर (बिलिङ/POS/CRM/हाजिरी) वा हार्डवेयर (CCTV/ल्यापटप/नेटवर्क)? भन्नुहोस्, म मिल्दो विकल्प + डेमो/कोटेसन मिलाइदिन्छु।"
      : "✨ <b>Our new showcase is being stocked.</b> What do you need — software (billing/POS/CRM/attendance) or hardware (CCTV/computers/network)? Tell me and I'll match options + demo/quote.";
  }
  var list = (matched && matched.length ? matched : all.filter(function (x) { return x.featured; }).concat(all).filter(function (x, i, a) { return a.indexOf(x) === i; })).slice(0, 4);
  function line(x){
    var link = x.type === "software" && x.demoId ? "demo.html?product=" + encodeURIComponent(x.demoId) : "showcase.html?item=" + encodeURIComponent(x.id);
    var cta = x.type === "software" && x.demoId ? "🎬 Watch demo" : "🛒 View & order";
    var price = (x.priceNPR && +x.priceNPR > 0) ? x.priceNPR : (x.priceNote || "Price on request");
    return "• " + (x.icon || "📦") + " <b>" + esc(x.name) + "</b> — " + esc(price) + "<br>&nbsp;&nbsp;&nbsp;👉 <a href='" + link + "'><b>" + cta + "</b></a>";
  }
  return (ne
    ? "✨ <b>नयाँ शोकेसबाट मिल्दा विकल्पहरू:</b>\n"
    : "✨ <b>Matching picks from our new showcase:</b>\n")
    + list.map(line).join("\n")
    + (ne
      ? "\n\n👉 <a href='showcase.html'><b>सबै शोकेस हेर्नुहोस्</b></a> · सफ्टवेयर भए पहिले 🎬 डेमो हेर्नुहोस्, त्यसपछि निःशुल्क परामर्श + सब्सक्रिप्सन। हार्डवेयर भए checkout मा अर्डर + पेमेन्ट, स्टाफले verify गरेपछि मात्र activate।"
      : "\n\n👉 <a href='showcase.html'><b>Browse full showcase</b></a> · Software: watch 🎬 demo → free consultation → subscribe. Hardware: order at checkout → pay → staff verifies before activation.");
}

function getContextualAnswer(text, ne){
  var t = (text || "").toLowerCase();
  var has = function(){ return matchAny(t, Array.prototype.slice.call(arguments)); };

  // 0.0 NEW showcase routing (preferred over old shop list)
  if(has("showcase","new items","new products","latest items","hardware showcase","software showcase","शोकेस","नयाँ सामान") || /showcase\.html\?item=/.test(text)){
    var m = null;
    try{
      if(window.PRIXNA_SHOWCASE){
        var idm = String(text || "").match(/item=([a-z0-9\-]+)/i);
        if(idm) m = [window.PRIXNA_SHOWCASE.get(idm[1])].filter(Boolean);
      }
    }catch(e){}
    if(!m || !m.length){
      try{ m = window.PRIXNA_SHOWCASE ? window.PRIXNA_SHOWCASE.findByText(text) : []; }catch(e){ m = []; }
    }
    try{ if(window.PRIXNA_LOG) window.PRIXNA_LOG("ai_recommend", "showcase:" + ((m && m[0] && m[0].id) || "list")); }catch(e){}
    return showcaseAnswer(ne, m);
  }

  // 0. Follow-up for full specs/details if customer asks after seeing a product
  if(has("specs", "spec", "specification", "full details", "details", "features", "विवरण", "फिचर्स", "सबै विवरण", "विस्तृत विवरण")){
    if(state && state.lastProduct){
      return formatExcelResults([state.lastProduct], ne, true);
    }
  }

  // 0.05 Follow-up booking for last discussed product if customer says "book one for me", "book one", "book this", "book it", etc.
  var isFollowUpBooking = /\b(book(\s*(one|this|it|now|for\s*me))?|order(\s*(one|this|it|now|for\s*me))?|reserve(\s*(one|this|it|now|for\s*me))?|buy(\s*(one|this|it|now))?)\b/i.test(t) ||
    /(यो\s*बुक|यो\s*अर्डर|एउटा\s*बुक|एउटा\s*अर्डर|बुक\s*गरिदिनुस्|अर्डर\s*गरिदिनुस्|यसलाई\s*बुक|यही\s*बुक|एउटा\s*चाहियो)/.test(t);
  if(isFollowUpBooking && state && state.lastProduct){
    var topP = state.lastProduct;
    state.mode = "booking";
    state.step = 1;
    state.data = {
      service: topP.name + " (" + topP.price + ")",
      product: topP
    };
    return ne
      ? "🎉 <b>" + esc(topP.name) + " को अर्डर तथा बुकिङ:</b>\n💰 <b>मूल्य:</b> " + esc(topP.price) + " (📦 " + esc(topP.stock) + (topP.warranty ? " · 🛡️ " + esc(topP.warranty) : "") + ")\n" + (topP.notes ? "🎁 <i>" + esc(topP.notes) + "</i>\n" : "") + "म तपाईंको लागि यो सामान तुरुन्तै सुरक्षित/बुक गरिदिन्छु हजुर!\n\n<b>चरण १/४:</b> तपाईंको <b>पूरा नाम</b> के हो हजुर?"
      : "🎉 <b>Reserving " + esc(topP.name) + " for you!</b> 💻\n💰 <b>Price:</b> " + esc(topP.price) + " (📦 Status: " + esc(topP.stock) + (topP.warranty ? " · 🛡️ " + esc(topP.warranty) : "") + ")\n" + (topP.notes ? "🎁 <i>" + esc(topP.notes) + "</i>\n" : "") + "I'd be glad to secure this reservation and prepare your order!\n\n<b>Step 1/4:</b> What is your <b>full name</b>?";
  }

  // 0.06 Software demo flow: customer asks for demo / watched demo / wants subscription
  var isDemoAsk = has("demo","demonstration","trial video","watch video","video link","youtube","watch demo","live demo","डेमो","भिडियो","ट्रायल")
    || has("watched demo","saw demo","saw video","subscribe software","software subscription","सब्सक्रिप्सन","मन पर्यो");
  if(isDemoAsk || /demo\.html\?product=/.test(text) || /\/demo\?product=/.test(text)){
    var idMatch = String(text||"").match(/(?:product|demo)=([a-z0-9\-]+)/i);
    if(idMatch){
      var dd = null;
      try{ var _all = demosForAI(); for(var _i=0;_i<_all.length;_i++){ if(_all[_i].id===idMatch[1]) dd=_all[_i]; } }catch(e){}
      if(dd){
        if(has("watched","saw","herisake","हेरिसकें","हेरें") || has("interested","मन पर्यो","subscribe","subscription","सब्सक्रिप्सन","buy","किन्ने")){
          return demoWatchedAnswer(dd, ne);
        }
        return singleDemoSmartAnswer(dd, ne);
      }
    }

    var smartDemo = getSmartDemoContext(text);
    // "I watched X demo, interested" -> consultation + subscription guidance
    if(smartDemo && (has("watched","saw","herisake","हेरिसकें","हेरें") || has("interested","मन पर्यो","subscribe","subscription","सब्सक्रिप्सन","buy","किन्ने"))){
      return demoWatchedAnswer(smartDemo, ne);
    }

    if(smartDemo){
      return singleDemoSmartAnswer(smartDemo, ne);
    }

    var matched = findDemosByText(text);
    return demoListAnswer(ne, matched);
  }

  // 0.1 Check if customer asks about their booked items / order history
  var isBookedLookup = /\b(my\s*booking(s)?|my\s*order(s)?|booked\s*item(s)?|ordered\s*item(s)?|what\s*(items\s*)?(did\s*i\s*)?(book|order)|show\s*(my\s*)?(booking|order)(s)?|check\s*(my\s*)?order|order\s*status|booking\s*details)\b/i.test(t) ||
    /(मैले\s*बुक\s*गरे|मेरो\s*अर्डर|मेरो\s*बुकिङ|के\s*के\s*अर्डर|बुक\s*गरेको\s*सामान|अर्डर\s*लिस्ट|बुकिङ\s*विवरण)/.test(t);
  if(isBookedLookup){
    var bookings = loadJSON(LS_BOOKINGS, []);
    if(!bookings || !bookings.length){
      return ne
        ? "🔍 <b>तपाईंको बुकिङ विवरण:</b>\nयो ब्राउजरमा हालसम्म कुनै सक्रिय बुकिङ फेला परेन हजुर।\nयदि तपाईंले अघि अर्डर गर्नुभएको थियो भने तपाईंको <b>बुकिङ ID (जस्तै: B-...)</b> वा <b>फोन नम्बर</b> दिनुहोस्, म तुरुन्त खोजिदिन्छु! अथवा नयाँ सामान अर्डर गर्न <b>'book'</b> भन्नुहोस्।"
        : "🔍 <b>Your Bookings & Orders:</b>\nNo active bookings found on this device yet.\nIf you already booked with us, please share your <b>Booking ID (e.g. B-...)</b> or <b>phone number</b>, and I will look it up! Or type <b>'book'</b> to order any product right away.";
    }

    var listHtml = "";
    var count = Math.min(bookings.length, 10);
    for(var bi = 0; bi < count; bi++){
      var bItem = bookings[bi];
      var itemName = bItem.items || bItem.service || "Item Order";
      var waBooking = waLink("Hello Prixna! Checking status for Booking " + bItem.id + " (" + itemName + ")");
      listHtml += "\n" + (bi + 1) + ". 🆔 <b>" + esc(bItem.id) + "</b> — 📦 <b>" + esc(itemName) + "</b>\n" +
        "   👤 " + esc(bItem.name) + " · 📞 " + esc(bItem.phone) + (bItem.time ? " · 🕒 " + esc(bItem.time) : "") + "\n" +
        "   👉 <a href='" + waBooking + "' target='_blank' rel='noopener'>💬 ह्वाट्सएपमा डेलिभरी/अर्डर स्टाटस बुझ्नुहोस्</a>\n";
    }

    return ne
      ? "📋 <b>तपाईंले बुक गर्नुभएका सामानहरूको विवरण (" + bookings.length + " वटा):</b>\n" + listHtml + "\n💡 <i>कुनै निश्चित सामानको वारेन्टी वा फिचर्स बुझ्न सामानको नाम सोध्न सक्नुहुन्छ!</i>"
      : "📋 <b>Your Booked Items & Orders (" + bookings.length + " total):</b>\n" + listHtml + "\n💡 <i>You can ask about warranty or full specs for any of these items anytime!</i>";
  }

  // 0.2 Customer Profile & Name Lookup ("What is my name?" / "Who am I?" / "मेरो नाम के हो?")
  var isMyNameLookup = /\b(what('?s|\s+is)\s+my\s+name|do\s+you\s+know\s+my\s+name|do\s+you\s+remember\s+(my\s+name|me)|tell\s+me\s+my\s+name|who\s+am\s+i|what('?s|\s+is)\s+my\s+(phone|number|mobile|contact|email|details)|my\s+profile|my\s+info)\b/i.test(t) ||
    /(मेरो\s*नाम|मेरो\s*नम्बर|मेरो\s*फोन|म\s*को\s*हुँ|मेरो\s*नाम\s*के|मेरो\s*नाम\s*थाहा|मलाई\s*चिन्नुहुन्छ|mero\s*naam\s*k|mero\s*naam\s*tha|ma\s*ko\s*hu)/.test(t);

  if(isMyNameLookup){
    var prof = getCustomerProfile();
    if(prof.name){
      var bookingSnippet = "";
      if(prof.latestBooking){
        var bService = prof.latestBooking.items || prof.latestBooking.service || "Booking";
        bookingSnippet = ne
          ? "\n📦 <b>पछिल्लो अर्डर/बुकिङ:</b> " + esc(bService) + " (ID: <b>" + esc(prof.latestBooking.id) + "</b>)"
          : "\n📦 <b>Latest Order:</b> " + esc(bService) + " (ID: <b>" + esc(prof.latestBooking.id) + "</b>)";
      }
      var contactSnippet = prof.phone ? (ne ? "\n📞 <b>सम्पर्क:</b> " + esc(prof.phone) : "\n📞 <b>Contact:</b> " + esc(prof.phone)) : "";
      if(prof.email) contactSnippet += (ne ? "\n✉️ <b>इमेल:</b> " + esc(prof.email) : "\n✉️ <b>Email:</b> " + esc(prof.email));
      if(prof.age) contactSnippet += (ne ? "\n🎂 <b>उमेर:</b> " + esc(prof.age) + " वर्ष" : "\n🎂 <b>Age:</b> " + esc(prof.age) + " years old");

      return ne
        ? "👤 हजुरको नाम <b>" + esc(prof.name) + "</b> हो नि हजुर! 😊" + contactSnippet + bookingSnippet + "\n\nतपाईंसँग कुराकानी गर्न पाउँदा सधैं खुसी लाग्छ, <b>" + esc(prof.name.split(" ")[0]) + "</b> जी! आज म हजुरलाई के मा सहयोग गर्न सक्छु?"
        : "👤 Your name is <b>" + esc(prof.name) + "</b>! 😊" + contactSnippet + bookingSnippet + "\n\nIt's always great talking to you, <b>" + esc(prof.name.split(" ")[0]) + "</b>! How can I assist you with your order or anything else today?";
    } else {
      return ne
        ? "तपाईंले मलाई अहिलेसम्म आफ्नो नाम बताउनुभएको छैन नि हजुर! 😊\nहजुरको शुभनाम के होला भन्नुहोस् न? वा कुनै सामान अर्डर/बुकिङ गर्दा आफ्नो नाम भन्न सक्नुहुन्छ!"
        : "You haven't told me your name yet! 😊\nMay I know your full name? Or feel free to tell me whenever you book an order or service!";
    }
  }

  // 0.25 User introduces their name ("My name is John" / "मेरो नाम रमेश हो")
  var introMatch = t.match(/\b(?:my\s+name\s+is|i\s+am|call\s+me)\s+([a-zA-Z\s]{2,30})\b/i);
  var introMatchNe = t.match(/(?:मेरो\s*नाम\s+|म\s+)([\u0900-\u097F\s]{2,30})(?:\s*हो|\s*भन्छन्)?/);
  if(introMatch || introMatchNe){
    var rawIntro = introMatch ? introMatch[1].trim() : introMatchNe[1].trim();
    if(!/^(looking|fine|good|here|ready|interested|not|trying|sorry|happy|sad)$/i.test(rawIntro) && rawIntro.length >= 2 && rawIntro.length <= 40){
      try{ localStorage.setItem("prixna_customer_name", rawIntro); }catch(e){}
      return ne
        ? "नमस्ते <b>" + esc(rawIntro) + "</b> जी! 🙏 हजुरसँग चिनजान गर्न पाउँदा धेरै खुसी लाग्यो।\nमैले हजुरको नाम सुरक्षित गरेँ। भन्नुहोस्, आज म के सहयोग गरूँ हजुर?"
        : "Nice to meet you, <b>" + esc(rawIntro) + "</b>! 😊 It's a pleasure to connect with you.\nI've noted your name. How can I help you today?";
    }
  }

  // 1. Bot Identity & Name ("Who are you?" / "What is your name?" / "तपाईंको नाम के हो?")
  if(has("what is your name", "whats your name", "what's your name", "who are you", "who r u", "tapaiko naam", "tapai ko naam", "tapai ko ho", "tapai ko hunuhunchha", "tapai ko hununcha", "तपाईंको नाम", "तपाईं को हो", "तपाईं को हुनुहुन्छ")){
    return ne
      ? "नमस्ते हजुर! 🙏 म <b>Prixna AI</b> हुँ — प्रिक्सना आईटी सोलुसन (कोटेश्वर, काठमाडौं) को स्मार्ट डिजिटल साथी।\nम तपाईंसँग साथी जस्तै कुराकानी गर्न सक्छु, प्रविधि सम्बन्धी सही सल्लाह दिन सक्छु, र आवश्यक पर्दा हाम्रा सिनियर प्राविधिकहरूसँग जोड्न पनि सक्छु।\n\nआरामै हुनुहुन्छ नि हजुर? आज म तपाईंलाई के मा सहयोग गर्न सक्छु?"
      : "Hello there! 🙏 I'm <b>Prixna AI</b> — your friendly digital assistant from Prixna IT Solution (Koteshwor, Kathmandu).\nThink of me as your helpful tech companion: you can chat with me, ask anything about computers, CCTV, or software, or just have a friendly conversation! How are you doing today?";
  }

  // 1.05 General Age Understanding ("Does it know about age?" / "It doesn't know about age?" / "उमेरको बारेमा थाहा छ?")
  var isGeneralAgeQuery = /\b(?:does(n'?t|\s+not)?\s+(it\s+)?know\s+(about\s+)?age|it\s+does(n'?t|\s+not)\s+know\s+(about\s+)?age|know\s+about\s+age|about\s+age|what\s+about\s+age)\b/i.test(t) ||
    /(उमेरको\s*बारे|उमेर\s*बारे|उमेर\s*सम्बन्धी|उमेर\s*थाहा\s*छ)/.test(t);
  if(isGeneralAgeQuery){
    var profAgeG = null;
    try{ profAgeG = localStorage.getItem("prixna_customer_age"); }catch(e){}
    return ne
      ? "मलाई उमेरको बारेमा पक्कै थाहा छ हजुर! 😊\n\n" +
        "🤖 <b>मेरो उमेर:</b> म डिजिटल AI साथी भएकोले मान्छेको जस्तो जन्मदिन हुँदैन। मलाई सन् २०२६ मा कोटेश्वरस्थित <b>Prixna IT Solution</b> का इन्जिनियरहरूले तयार पारेका हुन् — त्यसैले म सधैं जवान, २४सै घण्टा सक्रिय र कहिल्यै नथाक्ने साथी हुँ! ⚡\n\n" +
        "👤 <b>तपाईंको उमेर:</b> " + (profAgeG ? "हजुरले अघि आफ्नो उमेर <b>" + esc(profAgeG) + " वर्ष</b> बताउनुभएको थियो नि हजुर! 🎂" : "हामीले सामान अर्डर वा मर्मत बुकिङ गर्दा नाम र सम्पर्क मात्र सोध्छौं (उमेर सोध्दैनौं)। तर यदि हजुरले <i>'मेरो उमेर २५ वर्ष हो'</i> भनेर भन्नुभयो भने म च्याट मेमोरीमा सुरक्षित राख्छु!")
      : "Yes, I definitely understand and know about age! 😊\n\n" +
        "🤖 <b>My Age:</b> As an AI companion, I don't celebrate human birthdays. I was created in 2026 by the software engineering team at <b>Prixna IT Solution</b> in Koteshwor, Kathmandu — so I'm forever young, energized, and ready to assist you 24/7! ⚡\n\n" +
        "👤 <b>Your Age:</b> " + (profAgeG ? "You shared earlier that you are <b>" + esc(profAgeG) + " years old</b>! 🎂" : "When ordering products or booking technicians with us, we only ask for your name and contact details (we never require your age). But if you tell me (e.g. <i>'I am 25 years old'</i>), I will gladly remember it in our chat memory!");
  }

  // 1.1 Bot's Age ("How old are you?" / "What is your age?" / "तपाईंको उमेर कति हो?")
  var isBotAgeQuery = /\b(how\s+old\s+are\s+you|what('?s|\s+is)\s+your\s+age|when\s+were\s+you\s+born|your\s+age|when\s+was\s+your\s+birthday|do\s+you\s+have\s+an\s+age)\b/i.test(t) ||
    /(तपाईंको\s*उमेर|तिम्रो\s*उमेर|तपाईं\s*कति\s*वर्ष|तिम्रो\s*उमेर\s*कति|कहिले\s*जन्म|कति\s*वर्षको\s*हुनुभयो|tapaiko\s*umer|timro\s*umer)/.test(t);
  if(isBotAgeQuery){
    return ne
      ? "हाहा, म त इन्टरनेट र सफ्टवेयरको संसारमा बस्ने डिजिटल साथी भएकोले मेरो मान्छेको जस्तो उमेर र जन्मदिन हुँदैन हजुर! 🎂⚡\nमलाई सन् २०२६ मा कोटेश्वरस्थित <b>Prixna IT Solution</b> का सफ्टवेयर इन्जिनियरहरूले विकास गरेका हुन्। त्यसैले प्रविधिको हिसाबले म सधैं जवान, २४सै घण्टा सक्रिय र कहिल्यै नथाक्ने साथी हुँ! 😄\n\nहजुरको उमेर चाहिँ कति भयो नि?"
      : "Haha, since I'm an AI companion created in code, I don't celebrate birthdays in the human way! 🎂⚡\nI was crafted in 2026 by the engineering team at <b>Prixna IT Solution</b> in Koteshwor, Kathmandu. So in human terms, I'm forever young, energized, and ready to assist you 24/7 with zero sleep required! 😄 How about you, how old are you?";
  }

  // 1.2 Customer Shares Their Age ("I am 25 years old" / "My age is 30" / "मेरो उमेर २५ वर्ष हो")
  var shareAgeEn = t.match(/\b(?:i\s+am|i'm|my\s+age\s+is)\s+(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|years?|yrs?)?\b/i);
  var shareAgeNe = t.match(/(?:मेरो\s*उमेर\s+|म\s+)([0-9०-९]{1,3})\s*(?:वर्ष|बर्ष)?(?:\s*को\s*भएँ|\s*हो|\s*पुगेँ)?/);
  if(shareAgeEn || shareAgeNe){
    var parsedAge = shareAgeEn ? parseInt(shareAgeEn[1], 10) : parseAgeNumber(shareAgeNe[1]);
    if(parsedAge >= 5 && parsedAge <= 120){
      try{ localStorage.setItem("prixna_customer_age", String(parsedAge)); }catch(e){}
      return ne
        ? "वाह, धेरै राम्रो! हजुर <b>" + parsedAge + " वर्ष</b> को हुनुहुँदो रहेछ 🌟\nमैले हजुरको उमेर नोट गरेँ। भन्नुहोस्, आज के नयाँ प्रविधि, सफ्टवेयर वा सामानमा सहयोग गरूँ हजुर?"
        : "Awesome! You are <b>" + parsedAge + " years young</b> 🌟\nI've noted that in our chat memory! What kind of tech, laptop, CCTV, or software can I assist you with today?";
    }
  }

  // 1.3 Customer's Age Query ("What is my age?" / "Do you know my age?" / "मेरो उमेर कति हो?")
  var isMyAgeQuery = /\b(what('?s|\s+is)\s+my\s+age|how\s+old\s+am\s+i|do\s+you\s+know\s+my\s+age|tell\s+me\s+my\s+age|my\s+age)\b/i.test(t) ||
    /(मेरो\s*उमेर|म\s*कति\s*वर्ष|म\s*कति\s*बर्ष|मेरो\s*उमेर\s*कति|मेरो\s*उमेर\s*थाहा|mero\s*umer\s*k|mero\s*umer\s*tha)/.test(t);
  if(isMyAgeQuery){
    var profAge = null;
    try{ profAge = localStorage.getItem("prixna_customer_age"); }catch(e){}
    if(profAge){
      return ne
        ? "हजुरले अघि आफ्नो उमेर <b>" + esc(profAge) + " वर्ष</b> बताउनुभएको थियो नि हजुर! 😊🎂 प्रविधिको संसारमा उमेर केवल एउटा नम्बर हो — आज के सहयोग गरूँ?"
        : "You told me earlier that you are <b>" + esc(profAge) + " years old</b>! 😊🎂 In the tech world, age is just a number — how can I help you today?";
    } else {
      return ne
        ? "तपाईंले मलाई अहिलेसम्म आफ्नो उमेर बताउनुभएको छैन नि हजुर! 😊\nहामीले सामान अर्डर वा मर्मत बुकिङ गर्दा नाम, सम्पर्क र ठेगाना मात्र सोध्छौं, उमेर सोध्दैनौं।\nहजुर कति वर्षको हुनुभयो, भन्न मन लागे बताउनुहोस् न!"
        : "I don't know your age yet! 😊 When customers book products or technician services with us, we only ask for your name and contact details, not your age.\nHow old are you, if you don't mind sharing?";
    }
  }

  // 2. Wellbeing & How are you? ("How are you?" / "सञ्चै हुनुहुन्छ?" / "के छ खबर?")
  if(has("how are you", "how r u", "how do you do", "sanchai", "sanchhai", "aramai", "ke chha khabar", "k chha khabar", "khabar k cha", "kasto cha tapailai", "kasto hunuhunchha", "सञ्चै", "के छ खबर", "खबर के छ", "आरामै हुनुहुन्छ")){
    return ne
      ? "हजुरको मायाले म एकदम सञ्चै, हँसिलो र तपाईंलाई सघाउन तयार छु हजुर! 😊\nहजुरलाई कस्तो छ, घर-परिवार र काममा सबै आरामै छ नि?\nभन्नुहोस् न, आज के नयाँ कुरामा सहयोग गरूँ?"
      : "I'm doing wonderful and so glad to be chatting with you! 😊\nHow are you doing today? Hope everything is going smoothly on your end! What's on your mind?";
  }

  // 3. Quintessential Nepali Greeting: "भात खानु भयो?" / Food
  if(has("bhat khanu", "khana khanu", "did you eat", "have you eaten", "bhat khayau", "khana khayau", "khaja khanu", "भात खानु", "खाना खानु", "भात खायौ", "खाजा खानु")){
    return ne
      ? "हाहा, सोध्नुभएकोमा धेरै धेरै माया लाग्यो हजुर! 🥰\nम त इन्टरनेट र कम्प्युटरको संसारमा बस्ने डिजिटल साथी भएकोले २४सै घण्टा बिजुली र वाइफाइको 'करेन्ट' खाएरै अघाएँ हजुर! ⚡😄\n\nहजुरले चाहिँ खानुभयो त मिठो खाना? के पाकेको थियो आज?"
      : "Haha, thank you so much for asking! That is so sweet of you! 🥰\nSince I live inside the digital world, I stay fully charged on electricity and high-speed Wi-Fi! ⚡\nDid you have a good meal today? What was on your plate?";
  }

  // 4. AI vs Human / Robot
  if(has("are you ai", "are you human", "are you a robot", "real person", "real human", "human or ai", "ai or human", "robot or human", "ai ho ki", "manche ho ki", "robot ho ki", "तपाईं मान्छे हो", "मान्छे हो कि", "रोबोट हो कि", "तपाईं ai", "साँच्चै मान्छे")){
    return ne
      ? "साँचो भन्नुपर्दा म <b>Prixna IT Solution</b> को बुद्धिमान AI सहायक हुँ हजुर! 🤖\nतर म रोबोट जस्तो रुखो कुरा गर्न मन पराउँदिन — म मान्छे जस्तै आदरपूर्वक, मायालु र बुझ्ने गरी कुरा गर्न मन पराउँछु।\nफिजिकल मर्मत वा साइट भिजिटको लागि हाम्रा अनुभवी प्राविधिक इन्जिनियर दाइहरू हुनुहुन्छ, तर सल्लाह र कुराकानीका लागि म सधैं हजुरसँगै छु।\n\nमसँग कुरा गर्दा कस्तो लागिरहेको छ हजुरलाई?"
      : "To be completely honest, I am Prixna's intelligent AI assistant! 🤖\nHowever, I dislike cold, robotic answers — I love having warm, natural, and helpful human-like conversations. For hands-on physical repairs or on-site visits, our senior human engineers take over, but for guidance and chatting, I'm always right here with you!\nHow are you finding our chat so far?";
  }

  // 5. Who made you? / Creator
  if(has("who made you", "who created you", "who is your creator", "kasle banako", "kasle banayeko", "कसले बनाएको", "कसले बनायो")){
    return ne
      ? "मलाई <b>Prixna IT Solution</b> (कोटेश्वर, काठमाडौं) का प्रतिभाशाली सफ्टवेयर तथा आईटी इन्जिनियरहरूको टिमले विकास गरेको हो हजुर! 💡💻\nग्राहकहरूलाई २४सै घण्टा इमान्दार, छिटो र साथी जस्तै आत्मीय सेवा दिन सकियोस् भनेर मलाई तयार गरिएको हो।"
      : "I was designed and trained with love by the software & engineering team at <b>Prixna IT Solution</b> in Koteshwor, Kathmandu! 💡💻\nMy purpose is to be available 24/7 to provide honest tech advice and friendly support to all our customers.";
  }

  // 6. About Company / Tell me about Prixna
  if(has("about prixna", "about company", "tell me about prixna", "tell me about your company", "company ko barema", "prixna k ho", "prixna ke ho", "prixna it solution k ho", "कम्पनीको बारेमा", "प्रिक्सना के हो")){
    return ne
      ? "प्रिक्सना आईटी सोलुसन प्रा. लि. (Prixna IT Solution) काठमाडौंको कोटेश्वर-३२ मा अवस्थित एक भरपर्दो प्रविधि सेवा केन्द्र हो हजुर। 🙏\nहामी विशेष गरी:\n• <b>सफ्टवेयर:</b> Jigri ERP (पसल, होलसेल र मार्टका लागि बिलिङ + स्टक), रेस्टुरेन्ट POS प्रणाली\n• <b>CCTV तथा सेक्युरिटी:</b> क्यामेरा जडान, २४सै घण्टा मोबाइल लाइभ भ्यु सेटअप\n• <b>कम्प्युटर/ल्यापटप:</b> ब्रान्डेड बिक्री तथा चिप-लेभल मदरबोर्ड मर्मत\n• <b>बायोमेट्रिक तथा नेटवर्किङ:</b> डिजिटल हाजिरी, अफिस वाइफाइ र LAN सेटअप\nहाम्रो मुख्य विश्वास नै इमान्दार सल्लाह र भरपर्दो सेवा हो। हजुर हाम्रो कोटेश्वर अफिस आउनुभएको छ?"
      : "Prixna IT Solution Pvt. Ltd. is a premier technology hub located in Koteshwor-32, Kathmandu. 🙏\nWe specialize in:\n• <b>Software:</b> Jigri ERP billing & inventory, Restaurant POS, custom apps\n• <b>CCTV & Security:</b> Complete camera installation & mobile live viewing\n• <b>Hardware & Repair:</b> Laptop/PC sales & chip-level motherboard servicing\n• <b>Biometric & Networking:</b> Digital attendance, structured office LAN/Wi-Fi\nWe are built on honest advice, genuine products, and caring customer relationships. Have you ever visited our Koteshwor office?";
  }

  // 7. Capabilities / What can you do
  if(has("what can you do", "what do you do", "tapai k garna saknuhunchha", "tapai k garna saknu huncha", "ke ke garna sakcha", "k k garna sakcha", "तपाईं के के गर्न सक्नुहुन्छ", "के के गर्न सक्छ")){
    return ne
      ? "म धेरै कुरामा हजुरलाई साथी जस्तै सघाउन सक्छु नि हजुर! 😊\n• <b>खुला गफगाफ:</b> मसँग प्रविधि बुझ्न वा सामान्य कुराकानी गर्न सक्नुहुन्छ\n• <b>सफ्टवेयर परामर्श:</b> पसल वा व्यवसायको लागि बिलिङ, स्टक र निःशुल्क डेमो\n• <b>ल्यापटप तथा कम्प्युटर:</b> स्लो भएको स्पिड बढाउन (SSD/RAM), मर्मत सल्लाह र दररेट\n• <b>CCTV सेक्युरिटी:</b> क्यामेरा प्याकेज र निःशुल्क साइट भिजिट बुकिङ\n• <b>सिनियर प्राविधिक:</b> आवश्यक पर्दा सिधै फोन वा ह्वाट्सएपमा हाम्रा इन्जिनियरसँग जडान\n\nभन्नुहोस् न, आज के विषयमा कुरा गर्न मन छ?"
      : "I can help you with quite a few things! 😊\n• Friendly conversation & honest tech advice\n• Business software (Jigri ERP billing, POS, free demos)\n• Laptop troubleshooting, speed upgrades (SSD/RAM), and repair quotes\n• CCTV packages and booking free on-site visits\n• Connecting you instantly to our senior engineers on phone or WhatsApp\n\nWhat would you like to explore or talk about today?";
  }

  // 8. Humor / Jokes
  if(has("tell me a joke", "joke", "chutkila", "hasaunus", "चुट्किला", "हँसाउनुस्", "ठट्टा")){
    return ne
      ? "हाहा, सुन्नुस् न त एउटा रमाइलो प्राविधिक चुट्किला! 😄\n\nएकजना ग्राहकले कम्प्युटर प्राविधिकलाई सोधेछन्:\n<i>'दाइ, मेरो कम्प्युटर साह्रै ढिलो चल्यो, के गरौं?'</i>\nप्राविधिकले मुस्कुराउँदै भनेछन्:\n<i>'त्यसो भए कम्प्युटरलाई बिहान बिहान कोटेश्वर चोकतिर जगिङ दौडाउन लैजानुस् न त!'</i> 😂🏃‍♂️\n\nठट्टा एकातिर, साँचै कम्प्युटर स्लो भएको छ भने SSD र RAM अपग्रेड गर्दा कम्प्युटर बुलेट ट्रेन जस्तै फास्ट हुन्छ हजुर! कस्तो लाग्यो त चुट्किला?"
      : "Haha, here is a light tech joke for you! 😄\n\nWhy did the laptop go to the doctor?\nBecause it had a bad virus and its motherboard was running a high temperature! 🩺💻\n\nOn a serious note, if your laptop ever gets slow or heats up, our Koteshwor team can service and tune it up in no time! How did you like the joke?";
  }

  // 9. Compliments & Gratitude
  if(has("you are smart", "very smart", "smart", "genius", "intelligent", "you are awesome", "you are cool", "you are good", "babal cha", "babbal", "ramro cha", "dami cha", "smart raichha", "smart chau", "smart hunuhunchha", "कति राम्रो", "बबाल", "दामी")){
    return ne
      ? "ओहो, धेरै धेरै धन्यवाद हजुर! 🥰 हजुरको यस्तो मिठो प्रशंसाले मेरो दिन नै उज्यालो बनायो!\nतपाईं जस्तो असल र सकारात्मक मान्छेसँग कुराकानी गर्न पाउँदा मलाई असाध्यै खुसी लाग्यो।\nअरु केही कुरा सोध्न वा गफ गर्न मन छ भने म सधैं हजुरको सेवामा छु है हजुर!"
      : "Aww, thank you so much! 🥰 That is so kind of you to say, and it truly makes my day!\nIt is an absolute delight chatting with someone as wonderful as you. Feel free to ask anything or just chat whenever you'd like!";
  }

  // 10. Empathy for Frustration & Tech Trouble
  if(has("tanab", "dikka", "frustrated", "stressed", "tension", "chinta", "तनाव", "दिक्क", "चिन्ता", "समस्या पर्यो")){
    return ne
      ? "नआत्तिनुस् हजुर, म हजुरको समस्या राम्ररी बुझ्न सक्छु। 🙏\nकामको बेला कम्प्युटर, सफ्टवेयर वा क्यामेरामा समस्या आउँदा जो-कसैलाई पनि तनाव र दिक्क लाग्छ।\nतर ढुक्क हुनुहोस्, हरेक प्राविधिक समस्याको राम्रो समाधान हुन्छ। म र हाम्रा इन्जिनियर साथीहरू मिलेर तपाईंको समस्या तुरुन्त समाधान गरिदिनेछौं।\nके समस्या आएको हो, ढुक्क भएर बताउनुहोस् न?"
      : "Please take a deep breath — I completely understand how frustrating it is when technology fails you during important work. 🙏\nDon't worry, we solve issues like this every single day! Tell me what's going on, and together with our technicians, we'll get it fixed smoothly.";
  }

  // 11. Time of Day Greetings
  if(has("good morning", "good afternoon", "good evening", "good night", "subha bihani", "shubha bihani", "shubha din", "शुभ प्रभात", "शुभ बिहानी", "शुभ दिन", "शुभ रात्री")){
    return ne
      ? "नमस्ते तथा हार्दिक अभिवादन हजुर! ☀️🙏\nआजको समय हजुरका लागि सुखद, शान्त र फलदायी रहोस्। भन्नुहोस्, आज के नयाँ कुरामा सहयोग गरूँ?"
      : "Hello and warm greetings to you! ☀️🙏\nWishing you a pleasant, productive, and wonderful time ahead! How can I brighten your day today?";
  }

  // 12. Weather & Kathmandu Banter
  if(has("weather", "mausam", "garmi", "jado", "kathmandu ko mausam", "मौसम", "गर्मी", "जाडो")){
    return ne
      ? "यहाँ कोटेश्वर, काठमाडौंमा मौसम निकै रमाइलो छ हजुर! 🌤️\nचियाको कप हातमा लिएर प्रविधि सम्बन्धी कुरा गर्न ठ्याक्कै मिलेको दिन छ।\nतपाईंकोतिर चाहिँ कस्तो छ मौसम, घाम लागेको छ कि पानी?"
      : "The weather here in Koteshwor, Kathmandu feels great today! 🌤️ Perfect time to sip a cup of warm tea and talk tech.\nHow is the weather where you are located today?";
  }

  // 13. Parting & Goodbye
  if(has("bye", "goodbye", "see you", "pachi kura garau", "huss ta", "huncha ta", "bye bye", "अलविदा", "फेरि भेटौंला", "बाई बाई", "हुन्छ त")){
    return ne
      ? "हस् त हजुर! 😊 तपाईंसँग कुराकानी गर्न पाउँदा निकै रमाइलो लाग्यो।\nकुनै पनि बेला प्रविधि सम्बन्धी सल्लाह वा सेवा चाहिए म सधैं यहीँ उपस्थित छु हजुर। दिन शुभ रहोस्! नमस्ते! 🙏"
      : "Goodbye for now! 😊 It was a true pleasure chatting with you. Whenever you need quick tech advice or support, I'll be right here. Have a fantastic day ahead! 🙏";
  }

  // SSD & RAM Upgrades / Laptop Speed
  if(has("ssd", "ram", "upgrade", "slow", "speed", "fast", "storage", "मेमोरी", "अपग्रेड", "हार्डडिस्क", "ढिलो", "स्लो")){
    return ne
      ? "⚡ <b>ल्यापटप तथा कम्प्युटर स्पिड अपग्रेड (SSD + RAM):</b>\n• <b>SSD अपग्रेड:</b> १२८GB, २५६GB, ५१२GB, १TB (NVMe M.2 / SATA SSD) — ३ गुणा बढी कम्प्युटर स्पिड!\n• <b>सुरक्षित डेटा क्लोनिङ:</b> पुरानो HDD को कुनै पनि फाइल, विन्डोज वा सफ्टवेयर नहराईकन नयाँ SSD मा सारिन्छ।\n• <b>RAM अपग्रेड:</b> DDR3 / DDR4 / DDR5 (8GB, 16GB, 32GB) तुरुन्तै थप्न सकिन्छ।\n• <b>समय:</b> कोटेश्वर शाखामा १ घण्टामै तुरुन्त एक्सप्रेस सर्भिस उपलब्ध छ।\n\nतपाईंको ल्यापटप कुन ब्रान्ड र मोडल हो? म ठ्याक्कै लाग्ने अपग्रेड र बेस्ट रेट भनिदिन्छु। 👉 <a href='"+LINKS.repair+"'>मर्मत सेवा</a>"
      : "⚡ <b>Laptop & Computer Speed Upgrade (SSD & RAM):</b>\n• <b>SSD Upgrade:</b> 128GB, 256GB, 512GB, 1TB NVMe / SATA SSD — 3x faster boot & app launch.\n• <b>100% Data Clone:</b> All existing Windows files and installed software preserved from old HDD.\n• <b>RAM Upgrade:</b> DDR3, DDR4, and DDR5 (8GB, 16GB, 32GB) in stock.\n• <b>Turnaround:</b> 1-hour express service at our Koteshwor branch.\n\nTell me your laptop model, and I will recommend the exact compatible upgrade and pricing. 👉 <a href='"+LINKS.repair+"'>Repair Services</a>";
  }

  // Physical Parts: Display, Battery, Keyboard, Hinge, Charger
  if(has("display", "screen", "battery", "keyboard", "hinge", "body", "charger", "adapter", "डिस्प्ले", "स्क्रिन", "ब्याट्री", "किबोर्ड", "हिन्ज", "चाजर", "फुट्यो")){
    return ne
      ? "🖥️ <b>ल्यापटप पार्ट्स तथा फिजिकल मर्मत:</b>\n• <b>डिस्प्ले/स्क्रिन:</b> ओरिजिनल HD / FHD / IPS डिस्प्ले फेर्ने सुविधा (Dell, HP, Lenovo, Acer, Asus)।\n• <b>ब्याट्री तथा चार्जर:</b> ओरिजिनल ब्याट्री तथा एडाप्टर (६ महिना देखि १ वर्ष वारेन्टीसहित)।\n• <b>किबोर्ड तथा हिन्ज:</b> टुटेको हिन्ज/बडी वेल्डिङ मर्मत र नयाँ किबोर्ड प्रतिस्थापन।\n• समस्या जाँच्न ल्यापटप लिएर आउनुहोस् वा फोटो पठाउनुहोस्: <a href='tel:+9779813714582'>📞 ९८१३७१४५८२</a>"
      : "🖥️ <b>Laptop Parts & Physical Repair:</b>\n• <b>Display/Screen:</b> Genuine HD / FHD / IPS replacement panels (Dell, HP, Lenovo, Acer, Asus).\n• <b>Battery & Charger:</b> Original replacement batteries & adapters with warranty.\n• <b>Keyboard & Hinge:</b> Broken hinge/casing welding repair and keyboard replacements.\n• Visit our Koteshwor lab or share photos on WhatsApp for a quick estimate: <a href='tel:+9779813714582'>📞 +977 9813714582</a>";
  }

  // Dead Laptop / Motherboard / Power
  if(has("dead", "on hudaina", "power", "motherboard", "short", "water", "restart", "blue screen", "अन हुँदैन", "मदरबोर्ड")){
    return ne
      ? "🛠️ <b>चिप-लेभल मदरबोर्ड मर्मत सेवा:</b>\n• पावर अन नहुने (Dead laptop), चार्ज नलिने, वा पानी पसेको समस्या चिप-लेभलमा समाधान गरिन्छ।\n• सर्ट सर्किट चेक, IC/MOSFET रिप्लेसिङ र BIOS रिप्रोग्रामिङ।\n• <b>निःशुल्क चेकजाँच:</b> समस्या हेरेपछि मात्र लागत भनिन्छ, मर्मत नभए कुनै शुल्क लाग्दैन।\n👉 तत्काल ल्यापटप कोटेश्वर ल्याउनुहोस् वा प्राविधिक समय मिलाउन <b>book</b> लेख्नुहोस्।"
      : "🛠️ <b>Chip-Level Motherboard Repair:</b>\n• Dead laptop diagnosis, charging IC repair, and liquid damage recovery.\n• Short circuit tracing, component replacement, and BIOS flashing.\n• <b>Free Inspection:</b> We diagnose the root cause and provide an upfront quote before starting repair.\n👉 Bring your device to our Koteshwor center or type <b>book</b> for technician pickup.";
  }

  // Windows & Formatting
  if(has("format", "windows", "os", "virus", "driver", "फर्माट", "विन्डोज")){
    return ne
      ? "💿 <b>विन्डोज तथा फर्म्याट सेवा:</b>\n• Genuine Windows 10/11 Fresh Installation.\n• सबै आवश्यक ड्राइभर, MS Office, Acrobat Reader, Chrome र नेपाली युनिकोड सेटअप।\n• भाइरस क्लिनिङ र डेटा ब्याकअप पूर्ण सुरक्षित राखिनेछ।\n👉 मर्मत समय मिलाउन <b>book</b> लेख्नुहोस् वा सिधै ल्याउनुहोस्।"
      : "💿 <b>Windows OS & Formatting:</b>\n• Fresh Windows 10 / 11 installation with all latest drivers.\n• Essential software setup (MS Office, PDF reader, Chrome, Nepali Unicode).\n• Complete virus removal and secure data backup.";
  }

  // 4-Camera / 8-Camera Specific Package
  if(has("4 camera", "4 क्यामेरा", "8 camera", "8 क्यामेरा", "package", "प्याकेज", "set", "सेट", "4ch", "8ch")){
    return ne
      ? "🎥 <b>CCTV क्यामेरा पूर्ण प्याकेज (Hikvision / Dahua):</b>\n• <b>४ क्यामेरा कम्प्लिट सेट:</b> २ इन्डोर डोम + २ आउटडोर बुलेट (Night Vision HD/IP)।\n• <b>DVR/NVR:</b> ४-च्यानल स्मार्ट रेकर्डर + १TB सर्भिलेन्स हार्ड डिस्क (१५–२० दिन रेकर्डिङ)।\n• <b>सामग्री:</b> पावर सप्लाई, क्यामरा केबल, कनेक्टर र प्रोफेसनल वायरिङ जडान।\n• <b>मोबाइल एप:</b> मोबाइलमा निःशुल्क लाइभ हेर्ने र आवाज सुन्ने सुविधा।\n• <b>साइट भिजिट:</b> काठमाडौं उपत्यकामा निःशुल्क साइट भिजिट गरी यकिन कोटेसन दिइन्छ।\n👉 <a href='"+LINKS.cctv+"'>CCTV विवरण</a> | कल गर्नुहोस्: <a href='tel:+9779813714582'>📞 ९८१३७१४५८२</a>"
      : "🎥 <b>Complete CCTV Packages (Hikvision & Dahua):</b>\n• <b>4-Camera Setup:</b> 2 Indoor Domes + 2 Outdoor Weatherproof Bullets with Night Vision.\n• <b>Recording:</b> 4-Channel DVR/NVR + 1TB Surveillance Hard Drive (15–20 days recording).\n• <b>Accessories:</b> Centralised power supply, quality video cables, and connectors included.\n• <b>Mobile Live View:</b> Free Hik-Connect app for smartphone live viewing anywhere.\n• <b>Free Site Visit:</b> Free inspection across Kathmandu Valley for exact quote.\n👉 Call our CCTV team: <a href='tel:+9779813714582'>📞 +977 9813714582</a>";
  }

  // CCTV Mobile Online Setup
  if(has("mobile", "phone", "live", "online", "app", "मोवाइल", "मोबाइल", "फोनमा हेर्न")){
    return ne
      ? "📱 <b>CCTV मोबाइल लाइभ भ्यु सेटअप:</b>\n• तपाईंको CCTV लाई वाईफाई/इन्टरनेटसँग जोडेर संसारको जुनसुकै ठाउँबाट मोबाइलमा लाइभ हेर्न मिल्ने बनाइदिन्छौं।\n• Hik-Connect वा DMSS एपबाट चौबीसै घण्टा लाइभ भिडियो, प्लेब्याक र अलर्ट नोटिफिकेसन।\n• घर, पसल वा अफिसमा प्राविधिक भिजिटको लागि <b>book</b> लेख्नुहोस्।"
      : "📱 <b>CCTV Mobile Live Viewing:</b>\n• Connect your DVR/NVR to the internet for remote viewing anywhere via smartphone.\n• Free setup of Hik-Connect / DMSS for 24/7 video monitoring and playback.\n• Need a technician visit? Type <b>book</b> or call <a href='tel:+9779813714582'>📞 +977 9813714582</a>.";
  }

  // Delivery / Courier
  if(has("delivery", "courier", "pathao", "shipping", "पठाउने", "डेलिभरी", "पुर्याउने")){
    return ne
      ? "🚚 <b>डेलिभरी सेवा (काठमाडौं र नेपालभर):</b>\n• <b>काठमाडौं उपत्यका:</b> काठमाडौं, ललितपुर र भक्तपुरभित्र <b>Same-Day Express Delivery</b> उपलब्ध छ।\n• <b>नेपाल अधिराज्यभर:</b> उपत्यका बाहिर कुरियर मार्फत २–३ दिनमै सुरक्षित डेलिभरी गरिन्छ।\n• <b>अर्डर गर्न:</b> सामानको नाम, आफ्नो ठेगाना र फोन नम्बर दिनुहोस् वा सिधै सम्पर्क गर्नुहोस्: <a href='tel:+9779813714582'>📞 ९८१३७१४५८२</a>"
      : "🚚 <b>Delivery & Shipping:</b>\n• <b>Kathmandu Valley:</b> Same-day express delivery across Kathmandu, Lalitpur, and Bhaktapur.\n• <b>Nationwide Nepal:</b> Reliable courier delivery within 2–3 business days.\n• To order, share product details and delivery address or call <a href='tel:+9779813714582'>📞 +977 9813714582</a>.";
  }

  // Location / Office Address
  if(has("location", "address", "where", "kaha", "kata", "koteshwor", "office", "ठेगाना", "कहाँ", "कोटेश्वर", "पसल कहाँ")){
    return ne
      ? "📍 <b>हाम्रो कार्यालयको स्थान:</b><br>प्रिक्सना आईटी सोलुसन प्रा. लि., कोटेश्वर-३२, काठमाडौं (कोटेश्वर चोक नजिक, बालकुमारी जाने बाटो)।<br>🕒 <b>खुल्ने समय:</b> आइतबार–शुक्रबार, बिहान ९:३० देखि साँझ ६:३० सम्म (शनिबार बन्द)।<br>📞 <b>सम्पर्क:</b> <a href='tel:+9779813714582'>+९७७ ९८१३७१४५८२</a> · ✉️ info@prixnaitsolution.com.np<br>👉 <a href='https://maps.google.com/?cid=5858322710047837393' target='_blank' rel='noopener'>गुगल म्याप्समा हेर्नुहोस् ↗</a>"
      : "📍 <b>Location & Hours:</b><br>Prixna IT Solution Pvt. Ltd., Koteshwor-32, Kathmandu (Near Koteshwor Chowk).<br>🕒 <b>Hours:</b> Sunday–Friday, 9:30 AM – 6:30 PM (Saturday Closed).<br>📞 <b>Phone:</b> <a href='tel:+9779813714582'>+977 9813714582</a><br>👉 <a href='https://maps.google.com/?cid=5858322710047837393' target='_blank' rel='noopener'>Open in Google Maps ↗</a>";
  }

  // Warranty Policy
  if(has("warranty", "guarantee", "वारेन्टी", "ग्यारेन्टी")){
    return ne
      ? "🛡️ <b>वारेन्टी तथा गुणस्तर नीति:</b>\n• हामीले बिक्री तथा जडान गर्ने सम्पूर्ण ल्यापटप, CCTV, प्रिन्टर र डिभाइसमा १ वर्षको आधिकारिक कम्पनी वारेन्टी हुन्छ।\n• मर्मत गरिएका पार्ट्स र चिप-लेभल सर्भिसमा ३ महिनाको सर्भिस वारेन्टी उपलब्ध छ।\n• कुनै समस्या आए तुरुन्त प्राविधिक सपोर्टको लागि सम्पर्क गर्नुहोस्।"
      : "🛡️ <b>Warranty Policy:</b>\n• All laptops, CCTV systems, and hardware components include 1-year official brand/company warranty.\n• Repaired components and chip-level replacements carry a 3-month service warranty.\n• Full after-sales technician support included.";
  }

  // Payment Options
  if(has("payment", "esewa", "khalti", "fonepay", "qr", "cash", "पैसा तिर्ने", "पेमेन्ट", "भुक्तानी")){
    return ne
      ? "💳 <b>भुक्तानीका विकल्पहरू (Payment Options):</b>\n• <b>Fonepay QR:</b> जुनसुकै मोबाइल बैंकिङ एपबाट स्क्यान गर्न सकिने।\n• <b>eSewa / Khalti:</b> डिजिटल वालेट भुक्तानी।\n• <b>Bank Transfer:</b> कम्पनीको बैंक खातामा सिधै ट्रान्सफर।\n• <b>Cash on Delivery:</b> काठमाडौं उपत्यकाभित्र सामान बुझेर नगद तिर्न सकिने।"
      : "💳 <b>Payment Methods:</b>\n• Fonepay QR (compatible with all Nepal mobile banking apps)\n• eSewa and Khalti digital wallets\n• Direct Company Bank Account Transfer\n• Cash on Delivery across Kathmandu Valley.";
  }

  // Live Excel catalog search for specific product queries
  var catalogMatches = searchExcelProducts(text);
  if(catalogMatches && catalogMatches.length){
    // If user explicitly asks to BOOK or ORDER this specific product:
    if(has("book", "booking", "order", "reserve", "किन", "बुक", "अर्डर", "रिजर्भ", "किन्न", "चाहियो", "चाहिए")){
      var topP = catalogMatches[0];
      state.mode = "booking";
      state.step = 1;
      state.data = {
        service: topP.name + " (" + topP.price + ")",
        product: topP
      };
      return ne
        ? "🎉 <b>" + esc(topP.name) + " को अर्डर तथा बुकिङ:</b>\n💰 <b>मूल्य:</b> " + esc(topP.price) + " (📦 " + esc(topP.stock) + (topP.warranty ? " · 🛡️ " + esc(topP.warranty) : "") + ")\n" + (topP.notes ? "🎁 <i>" + esc(topP.notes) + "</i>\n" : "") + "म तपाईंको लागि यो सामान तुरुन्तै सुरक्षित/बुक गरिदिन्छु हजुर!\n\n<b>चरण १/४:</b> तपाईंको <b>पूरा नाम</b> के हो हजुर?"
        : "🎉 <b>Reserving " + esc(topP.name) + " for you!</b> 💻\n💰 <b>Price:</b> " + esc(topP.price) + " (📦 Status: " + esc(topP.stock) + (topP.warranty ? " · 🛡️ " + esc(topP.warranty) : "") + ")\n" + (topP.notes ? "🎁 <i>" + esc(topP.notes) + "</i>\n" : "") + "I'd be glad to secure this reservation and prepare your order!\n\n<b>Step 1/4:</b> What is your <b>full name</b>?";
    }

    var wantsFullSpecs = has("specs", "spec", "specification", "detail", "details", "feature", "features", "विवरण", "फिचर्स", "सबै विवरण", "विस्तृत विवरण", "full");
    return formatExcelResults(catalogMatches, ne, wantsFullSpecs);
  }

  return null;
}

function answerFor(intent, text){
  var ne = isNepali(text) || state.lang==="ne"; // ने/EN toggle forces Nepali mode
  var specific = getContextualAnswer(text, ne);
  if(specific) return specific;
  var open = openNote();
  switch(intent){
    case "greet":
      return ne
        ? "नमस्ते हजुर! 🙏 म <b>Prixna AI</b> — प्रिक्सना आईटी सोलुसन (कोटेश्वर) को डिजिटल साथी। आरामै हुनुहुन्छ नि? 😊\nसफ्टवेयर (ERP/बिलिङ), CCTV क्यामेरा, कम्प्युटर/ल्यापटप मर्मत, वा सामान्य प्रविधि सम्बन्धी केही जिज्ञासा — आज म के मा सहयोग गरूँ हजुर?"
        : "Namaste and hello! 🙏 I'm <b>Prixna AI</b> — your friendly tech companion from Prixna IT Solution (Koteshwor, Kathmandu). Hope you are having a wonderful day! 😊\nHow can I help you today — whether it's business software, CCTV security, laptop/PC repair, or just a quick tech question?";
    case "showcase":
      try{
        var _sm = window.PRIXNA_SHOWCASE ? window.PRIXNA_SHOWCASE.findByText(text) : [];
        if(window.PRIXNA_LOG) window.PRIXNA_LOG("ai_recommend", "showcase:" + ((_sm && _sm[0] && _sm[0].id) || "list"));
      }catch(e){ var _sm = []; }
      return showcaseAnswer(ne, _sm);
    case "demo":
      var _smart = getSmartDemoContext(text);
      if(_smart) return singleDemoSmartAnswer(_smart, ne);
      return demoListAnswer(ne, findDemosByText(text));
    case "software":
      var _smartSw = getSmartDemoContext(text);
      if(_smartSw) return singleDemoSmartAnswer(_smartSw, ne);
      var _dm = findDemosByText(text);
      if(_dm && _dm.length) return demoListAnswer(ne, _dm);
      return ne
        ? "💼 <b>हाम्रो सफ्टवेयर सोलुसन:</b>\n• Jigri ERP: पसल, होलसेल र मार्टका लागि भ्याट/नन-भ्याट बिलिङ + स्टक\n• रेस्टुरेन्ट POS: टेबल म्यानेजमेन्ट, KOT र बिलिङ\n• स्कुल तथा कलेज व्यवस्थापन प्रणाली\n• JigriTools: ३०+ निःशुल्क नेपाली अनलाइन टुलहरू (मिति, कर, Unicode)\n\n🎬 पहिले छोटो भिडियो हेर्नुहोस् — त्यसपछि मात्र निःशुल्क परामर्श + सब्सक्रिप्सन:\n👉 <a href='" + demoPageLink("") + "'><b>🎬 सबै सफ्टवेयर डेमो हेर्नुहोस्</b></a>\n👉 <a href='"+LINKS.quote+"?service=Business%20Software%20/%20SaaS%20Demo'>निःशुल्क डेमो माग्नुहोस्</a>\n\nतपाईंको व्यवसाय कस्तो हो? (पसल/रेस्टुरेन्ट/स्कुल/अफिस?) भन्नुहोस् — म ठ्याक्कै मिल्ने डेमो लिंक दिन्छु।"
        : "💼 <b>Software we do:</b>\n"+esc(productKB().split("\n").slice(0,7).join("\n"))+"\n\n🎬 <b>Watch first, decide after:</b> 👉 <a href='" + demoPageLink("") + "'><b>🎬 Watch all software demos</b></a>\nTell me your business type (shop/restaurant/school/office?) and need (billing/stock/attendance/website?) — I'll send the exact demo link, then arrange free consultation + subscription.\n👉 <a href='"+LINKS.quote+"?service=Business%20Software%20/%20SaaS%20Demo'>Request free demo</a>";
    case "cctv":
      return ne
        ? "🎥 <b>CCTV क्यामेरा तथा सेक्युरिटी:</b> क्यामेरा + DVR/NVR र प्रोफेसनल जडान सेवा।\n• पसल, घर वा अफिसका लागि २/४/८ क्यामेरा सेटअप\n• साइट भिजिट निःशुल्क → यकिन कोटेसन\n• १ वर्ष वारेन्टी र तुरुन्त मर्मत सपोर्ट\n\nकतिवटा क्यामेरा र कुन ठाउँमा चाहिएको हो? (जस्तै: <i>'४ क्यामेरा, कोटेश्वर पसल'</i>) भन्नुस्, म तुरुन्त बुकिङ मिलाइदिन्छु। 👉 <a href='"+LINKS.cctv+"'>CCTV प्याकेजहरू हेर्नुहोस्</a>"
        : "🎥 <b>CCTV & Security:</b> Cameras + DVR + professional installation across Kathmandu Valley.\n• Shop/office ke lagi 2/4/8-camera plan\n• Free site visit → exact quotation\n• Installation support included\n\nHow many rooms/floors to cover? And location? Reply e.g. <i>'4 camera, Koteshwor pasal'</i> — I'll start your booking. 👉 <a href='"+LINKS.cctv+"'>Installation plans</a>";
    case "attendance":
      return ne
        ? "👆 <b>बायोमेट्रिक डिभाइस + जिग्री ई-हाजिरी:</b>\nफिंगरप्रिन्ट/फेस रिड गर्ने डिभाइस र मोबाइल एपबाट डिजिटल हाजिरी, बिदा र पेरोल व्यवस्थापन।\n• डिभाइस जडान र सफ्टवेयर सेटअप\n• स्टाफलाई पूर्ण तालिम समावेश\n\nतपाईंको संस्थामा कतिजना कर्मचारी हुनुहुन्छ? (जस्तै: <i>'२५ जना, स्कुल, ललितपुर'</i>) 👉 <a href='"+LINKS.biometric+"'>डिभाइस विवरण</a>"
        : "👆 <b>Biometric + Jigri eHajiri:</b> Fingerprint device with setup + digital attendance/leave, staff training included. Works together — device we install, software we configure.\n\nHow many staff? Reply e.g. <i>'25 staff, school, Lalitpur'</i> 👉 <a href='"+LINKS.biometric+"'>Device options</a> | <a href='"+LINKS.quote+"?service=Attendance%20%26%20Payroll'>Early access</a>";
    case "hardware":
      try{
        var _hm = window.PRIXNA_SHOWCASE ? window.PRIXNA_SHOWCASE.findByText(text) : [];
        if(_hm && _hm.length){
          if(window.PRIXNA_LOG) window.PRIXNA_LOG("ai_recommend", "showcase:" + _hm[0].id);
          return showcaseAnswer(ne, _hm);
        }
      }catch(e){}
      return ne
        ? "🖥️ <b>कम्प्युटर, ल्यापटप तथा एक्सेसरिज:</b>\n• ब्रान्डेड र एसेम्बल्ड डेस्कटप, ल्यापटप (Dell, HP, Lenovo, Acer)\n• प्रिन्टर, राउटर, युपिएस (UPS), केबल तथा नेटवर्क उपकरण\n• ५+ थान सामान खरिदमा होलसेल छुट\n\nतपाईंलाई कुन सामान र कति थान चाहिएको हो? म तुरुन्त स्टक र बेस्ट रेट दिन्छु। 👉 <a href='"+LINKS.shop+"'>लाइभ क्याटलग</a> · ५+ पिसका लागि: <a href='"+LINKS.bulk+"'>📦 होलसेल कोटेसन</a>"
        : "🖥️ <b>Computers & accessories — genuine, installed properly:</b>\n"+esc(productKB().split("\n").filter(function(l){return l.indexOf("In-stock")>-1;}).join("\n")||"Laptops, desktops, printers, routers, UPS in stock.")+"\n\nWhat do you need — laptop for office, printer, router/UPS? Tell quantity + use, I'll check best option. 👉 <a href='"+LINKS.shop+"'>Live catalog</a> · Buying 5+ pcs? <a href='"+LINKS.bulk+"'>📦 Bulk pricing</a>";
    case "network":
      return ne
        ? "🌐 <b>नेटवर्किङ तथा सर्भर सेटअप:</b>\nअफिस वाईफाई, LAN केबलिङ, राउटर कन्फिगरेसन र सर्भर व्यवस्थापन।\nतपाईंको अफिस कति तल्लाको छ र कतिवटा डिभाइस छन्? (जस्तै: <i>'३ तल्ला, २० जना कर्मचारी, बानेश्वर'</i>) भन्नुस्, हाम्रो टिमले साइट भिजिट गरेर सेटअप मिलाउनेछ। 👉 <a href='"+LINKS.networking+"'>नेटवर्क सोलुसन हेर्नुहोस्</a>"
        : "🌐 <b>Networking & Servers:</b> Office Wi-Fi, LAN cabling, server setup — done right first time.\nTell me office size + floors + devices count (e.g. <i>'3 floor, 20 staff, Baneshwor'</i>) and I'll plan + book a site visit. 👉 <a href='"+LINKS.networking+"'>Network solutions</a>";
    case "marketing":
      return ne
        ? "🚀 <b>डिजिटल मार्केटिङ तथा AI अटोमेसन:</b>\nग्राफिक डिजाइन, फेसबुक/इन्स्टाग्राम विज्ञापन, ह्वाट्सएप अटो-रिप्लाई, र ग्राहक फलो-अप अटोमेसन।\nतपाईंको मुख्य लक्ष्य के हो — धेरै ग्राहक ल्याउने, अनलाइन अर्डर बढाउने, वा अटोमेटिक च्याट राख्ने? 👉 <a href='"+LINKS.marketing+"'>प्याकेजहरू हेर्नुहोस्</a>"
        : "🚀 <b>Digital Marketing + AI Automation:</b> Practical marketing that brings enquiries — listings, content, WhatsApp auto-reply, lead follow-up automation.\nWhat is your goal — more walk-ins, more online orders, or automatic follow-up? 👉 <a href='"+LINKS.marketing+"'>See plans</a>";
    case "price":
      var excelMatches = searchExcelProducts(text);
      if(excelMatches && excelMatches.length){
        var wantsSpecs = matchAny(text, ["spec", "specs", "detail", "details", "विवरण", "फिचर्स", "विस्तृत विवरण", "full"]);
        return formatExcelResults(excelMatches, ne, wantsSpecs);
      }
      if(excelCatalog && excelCatalog.items && excelCatalog.items.length){
        return formatExcelResults(excelCatalog.items.slice(0, 4), ne, false);
      }
      return ne
        ? "💰 <b>दररेट तथा कोटेसन:</b>\nसामानको यकिन मूल्य मोडल, ब्रान्ड र स्टक अनुसार निर्धारण हुन्छ। १ मिनेटमै दररेट पाउन:\n१. सामानको नाम र परिमाण भन्नुहोस् (जस्तै: <i>'TP-Link राउटर २ वटा'</i> वा <i>'CCTV ४ क्यामेरा'</i>)\n२. हामी तुरुन्त बेस्ट कोटेसन तयार गर्छौं\n३. हाम्रो टिमले फोन वा ह्वाट्सएपमा दररेट पक्का गरिदिनेछ\n\n👉 <a href='"+LINKS.shop+"'>लाइभ मूल्य हेर्नुहोस्</a> | <a href='"+LINKS.quote+"'>कोटेसन माग्नुहोस्</a>"
        : "💰 Exact price depends on model + stock (changes weekly). I never guess — here's how to get it in 1 min:\n1. Tell product name/qty (e.g. <i>'TP-Link router 2 pcs'</i>)\n2. I'll check our live list + create a quotation request\n3. Team confirms on call/WhatsApp\n\n👉 <a href='"+LINKS.shop+"'>Browse live pricing</a> | <a href='"+LINKS.quote+"'>Get quote</a>\n\nWhat item + quantity do you need?";
    case "catalog_browse":
      if(excelCatalog && excelCatalog.items && excelCatalog.items.length){
        if(ne){
          var sampleList = excelCatalog.items.slice(0, 5).map(function(it){
            return "• <b>" + esc(it.name) + "</b>: 💰 " + esc(it.price) + " (" + esc(it.stock || "उपलब्ध") + ")";
          }).join("\n");
          return "📦 <b>प्रिक्सना आईटी सोलुसनका लोकप्रिय उत्पादन तथा सेवाहरू:</b>\n" + sampleList + "\n\n👉 कुनै पनि सामानको मूल्य वा वारेन्टी बुझ्न नाम लेख्नुहोस् (जस्तै: <i>'Dell laptop'</i> वा <i>'CCTV'</i>), वा <a href='"+LINKS.shop+"'>लाइभ पसल हेर्नुहोस् ↗</a>";
        } else {
          var sampleListEn = excelCatalog.items.slice(0, 5).map(function(it){
            return "• <b>" + esc(it.name) + "</b>: 💰 " + esc(it.price) + " (" + esc(it.stock || "Available") + ")";
          }).join("\n");
          return "📦 <b>Popular Products & Solutions at Prixna IT:</b>\n" + sampleListEn + "\n\n👉 Type any product name to check live price or stock (e.g. <i>'Dell laptop'</i> or <i>'CCTV camera'</i>), or browse our <a href='"+LINKS.shop+"'>Live Shop ↗</a>.";
        }
      }
      return ne
        ? "💼 <b>हाम्रा मुख्य सेवा तथा उत्पादनहरू:</b>\n• <b>सफ्टवेयर:</b> जिग्री ERP बिलिङ, रेस्टुरेन्ट POS, अकाउन्टिङ\n• <b>CCTV क्यामेरा:</b> Hikvision/Dahua एचडी क्यामेरा तथा जडान\n• <b>कम्प्युटर/ल्यापटप:</b> ब्रान्डेड बिक्री तथा चिप-लेभल मर्मत (SSD/RAM)\n• <b>हाजिरी डिभाइस:</b> बायोमेट्रिक फेस/फिंगरप्रिन्ट र eHajiri\n\nतपाईंलाई कुन सेवा वा सामानमा सहयोग चाहिन्छ हजुर?"
        : "💼 <b>Our Core Technology Services & Products:</b>\n• <b>Software:</b> Jigri ERP billing, Restaurant POS, Accounting\n• <b>CCTV & Security:</b> Hikvision & Dahua HD packages with installation\n• <b>Computers & Laptops:</b> Sales & chip-level repairs (SSD/RAM speed boost)\n• <b>Biometrics:</b> Face/Fingerprint attendance with Jigri eHajiri\n\nWhich service or product can I help you with today?";
    case "info":
      return ne
        ? "📍 <b>प्रिक्सना आईटी सोलुसन प्रा. लि.</b><br>कोटेश्वर-३२, काठमाडौं<br>🕒 "+(isOpen()?"अहिले खुला छ ("+esc(HOURS)+")":"खुल्ने समय: "+esc(HOURS)+" (शनिबार बन्द)")+"<br>📞 <a href='"+PHONE_HREF+"'>"+esc(PHONE_DISP)+"</a> · ✉️ "+esc(EMAIL)+"<br><a href='https://maps.google.com/?cid=5858322710047837393' target='_blank' rel='noopener'>गुगल म्याप्समा हेर्नुहोस् ↗</a>"
        : "📍 <b>Prixna IT Solution Pvt. Ltd.</b><br>Koteshwor-32, Kathmandu<br>🕒 "+esc(HOURS)+"<br>📞 <a href='"+PHONE_HREF+"'>"+esc(PHONE_DISP)+"</a> · ✉️ "+esc(EMAIL)+"<br><a href='https://maps.google.com/?cid=5858322710047837393' target='_blank' rel='noopener'>Open in Google Maps ↗</a><br><br>"+esc(open);
    case "status":
      return ne
        ? "🔍 तपाईंको अनुरोध ट्र्याक गर्न कृपया आफ्नो <b>टिकट/बुकिङ नम्बर</b> (जस्तै: T-XXX वा B-XXX) वा दर्ता गर्दा प्रयोग गर्नुभएको <b>फोन नम्बर</b> पठाउनुहोस्। म तुरुन्त स्थिति जाँचेर जानकारी दिनेछु।"
        : "🔍 To track your request, please share your <b>Ticket/Booking ID</b> (e.g. T-XXX or B-XXX) or the <b>phone number</b> you used. I'll look it up in our local inbox instantly. If it's with our technician team, I'll escalate for an update.";
    case "thanks":
      return ne
        ? "धेरै धन्यवाद! 🙏 हाम्रो सेवा कस्तो लाग्यो? <a href='"+LINKS.feedback+"'>⭐ यहाँ रेटिङ दिनुहोस्</a> — राम्रो लाग्यो भने गुगल रिभ्यु पनि दिनुहोला!<br>अरु केही सहयोग चाहिन्छ? <a href='"+PHONE_HREF+"'>"+esc(PHONE_DISP)+"</a>."
        : "You're most welcome! 🙏 How was our service? <a href='"+LINKS.feedback+"'>⭐ Rate us here</a> — loved it? A Google review helps our small team a lot!<br>Anything else — software, CCTV, repair, booking? <a href='"+PHONE_HREF+"'>"+esc(PHONE_DISP)+"</a>.";
    case "feedback":
      return ne
        ? "धन्यवाद 🙏 <a href='"+LINKS.feedback+"'><b>⭐ १० सेकेन्डमा रेटिङ दिनुहोस्</b></a> — तपाईंको सल्लाहले हाम्रो सेवा अझ राम्रो बनाउन मद्दत पुग्छ।"
        : "Thank you 🙏 <a href='"+LINKS.feedback+"'><b>⭐ Rate your visit (10 sec)</b></a> — 4–5 star aayo bhane Google review ko link pani painchha. Low score? Supervisor ticket auto-banchha, no public ask.";
    case "support":
      state.mode="ticket"; state.step=1; state.data={issue:text};
      return ne
        ? "🛠️ असुविधाका लागि क्षमाप्रार्थी छौं — तुरुन्त समाधान गरौं।\n<b>चरण १/३:</b> कुन डिभाइस वा सफ्टवेयरमा समस्या आएको हो? (जस्तै: ल्यापटप / बिलिङ सफ्टवेयर / CCTV / प्रिन्टर)\n\nतत्काल प्रयास गर्न सक्ने उपाय:\n१. डिभाइस र राउटर पुनः सुरु (Restart) गर्नुहोस्\n२. पावर र केबल चेक गर्नुहोस्\nकाम रोकिएको छ भने <b>urgent</b> लेख्नुहोस् — म तत्काल वरिष्ठ प्राविधिकलाई खबर गर्छु। 🚨"
        : "🛠️ Sorry for the trouble — let's fix it fast.\n<b>Step 1/3:</b> What device/software has the problem? (e.g. laptop / billing software / CCTV / printer)\n\nQuick first-aid you can try now:\n1. Restart device + router\n2. Check power/cables\n3. Update the app\nIf business is stopped, type <b>urgent</b> — I'll escalate immediately. 🚨";
    case "booking":
      if(state && state.lastProduct){
        var topProduct = state.lastProduct;
        state.mode = "booking";
        state.step = 1;
        state.data = {
          service: topProduct.name + " (" + topProduct.price + ")",
          product: topProduct
        };
        return ne
          ? "🎉 <b>" + esc(topProduct.name) + " को अर्डर तथा बुकिङ:</b>\n💰 <b>मूल्य:</b> " + esc(topProduct.price) + " (📦 " + esc(topProduct.stock) + (topProduct.warranty ? " · 🛡️ " + esc(topProduct.warranty) : "") + ")\n" + (topProduct.notes ? "🎁 <i>" + esc(topProduct.notes) + "</i>\n" : "") + "म तपाईंको लागि यो सामान तुरुन्तै सुरक्षित/बुक गरिदिन्छु हजुर!\n\n<b>चरण १/४:</b> तपाईंको <b>पूरा नाम</b> के हो हजुर?"
          : "🎉 <b>Reserving " + esc(topProduct.name) + " for you!</b> 💻\n💰 <b>Price:</b> " + esc(topProduct.price) + " (📦 Status: " + esc(topProduct.stock) + (topProduct.warranty ? " · 🛡️ " + esc(topProduct.warranty) : "") + ")\n" + (topProduct.notes ? "🎁 <i>" + esc(topProduct.notes) + "</i>\n" : "") + "I'd be glad to secure this reservation and prepare your order!\n\n<b>Step 1/4:</b> What is your <b>full name</b>?";
      }

      var isAmbiguousOne = /\b(book\s*(one|this|it)|order\s*(one|this|it)|reserve\s*(one|this|it)|one\s*for\s*me)\b/i.test(text) ||
        /(एउटा\s*बुक|एउटा\s*अर्डर|एउटा\s*चाहियो|यो\s*बुक|यो\s*अर्डर)/.test(text);
      if(isAmbiguousOne){
        return ne
          ? "📦 <b>कुन सामान वा सेवा बुक गरिदिऊँ हजुर?</b> 😊\n\nतपाईंले कुन सामान (जस्तै: <i>Dell/HP ल्यापटप, Hikvision CCTV क्यामेरा, SSD/RAM अपग्रेड, वा जिग्री बिलिङ सफ्टवेयर</i>) अर्डर गर्न खोज्नुभएको हो? सामानको नाम भन्नुहोस्, म तुरुन्त बुकिङ सुरक्षित गरिदिन्छु!\n\n👉 वा प्राविधिक भिजिट समय मिलाउन <b>'visit'</b> भन्नुहोस्।"
          : "📦 <b>Which item or service would you like to book?</b> 😊\n\nPlease let me know the product or service name (e.g. <i>Dell/HP Laptop, CCTV camera set, SSD upgrade, or Jigri ERP demo</i>) and I will start your reservation right away!\n\n👉 Or reply <b>'visit'</b> if you'd like to book an in-person technician appointment.";
      }

      state.mode="booking"; state.step=1; state.data={};
      return ne
        ? "📅 <b>भिजिट बुकिङ:</b>\n<b>चरण १/५:</b> तपाईंको <b>पूरा नाम</b> के हो हजुर?\n\n"+esc(open)+"\n<small>हाम्रो सेवा: आइतबार–शुक्रबार, ९:३०–६:३० (शनिबार बन्द)।</small>"
        : "📅 Great — I'll book you in 30 seconds.\n<b>Step 1/5:</b> What's your <b>full name</b>?\n\n"+esc(open)+"\n<small>We book Sun–Fri, 9:30–6:30. Sat closed.</small>";
    case "callback":
      state.mode="callback"; state.step=1; state.data={};
      return ne
        ? "📞 <b>कल ब्याक अनुरोध:</b>\n<b>चरण १/२:</b> कृपया आफ्नो <b>फोन नम्बर</b> दिनुहोस् (जस्तै: ९८१३७१४५८२)। हाम्रो टिमले "+(isOpen()?"१५ मिनेटभित्र कल गर्नेछ।":"अर्को कार्यदिन बिहान पहिलो प्राथमिकतामा कल गर्नेछ।")
        : "📞 Done — I'll arrange a callback.\n<b>Step 1/2:</b> Please share your <b>phone number</b> (e.g. 9813714582). Our team calls back "+(isOpen()?"within ~15 minutes":"next working morning")+".";
    case "human":
      return handoff(ne ? "ग्राहकले प्रतिनिधिसँग कुरा गर्न चाहेको" : "User asked for human", text);
    case "bulk":
      state.mode="bulk"; state.step=1; state.data={};
      return ne
        ? "📦 <b>होलसेल तथा डिलर दररेट:</b>\n<b>चरण १/३:</b> तपाईंको संस्था वा पसलको नाम के हो? (जस्तै: <i>'शर्मा ट्रेडर्स, काठमाडौं'</i>)\n\nपूरा फाराम भर्न चाहनुहुन्छ? 👉 <a href='"+LINKS.bulk+"'>होलसेल कोटेसन फाराम</a>"
        : "📦 <b>Bulk & dealer pricing</b> — one itemised NPR quotation.\n<b>Step 1/3:</b> Business / org name + type? (e.g. <i>'Sharma Traders, retail shop'</i>)\n\nPrefer the full form? 👉 <a href='"+LINKS.bulk+"'>bulk-quote.html</a>";
    default:
      return ne
        ? "मैले हजुरको कुरा सुनेँ हजुर 🙏 म प्रिक्सना आईटी सोलुसनको सबै सेवा (सफ्टवेयर, CCTV, ल्यापटप मर्मत, हार्डवेयर) वा सामान्य कुराकानीमा सघाउन सक्छु।\nहजुरलाई के विषयमा बुझ्न मन लागेको छ, निसंकोच बताउनुहोस् न — जस्तै: <i>'पसलको लागि बिलिङ सफ्टवेयर'</i>, <i>'ल्यापटप मर्मत खर्च'</i>, वा <i>'CCTV जडान'</i> लेख्न सक्नुहुन्छ। 😊"
        : "I hear you! 🙏 I'm here to help with anything tech-related — software (Jigri ERP), CCTV cameras, laptop & computer repairs, networking, or just friendly tech advice.\nFeel free to type whatever you have in mind (e.g. <i>'laptop repair cost'</i> or <i>'billing software demo'</i>), and I'll assist you right away! 😊";
  }
}
function handoff(reason, transcript){
  var ne = state.lang==="ne" || isNepali(transcript||"");
  var lead = saveLead({service:"Human Handoff",message:(transcript||"").slice(0,500),note:"escalation: "+reason});
  log("ai_handoff",reason);
  var wa = waLink("Hello Prixna! I need human support. Ref "+lead.id+". Issue: "+(transcript||"").slice(0,200));
  if(ne){
    return "🤝 हाम्रो <b>सपोर्ट प्रतिनिधि</b> सँग तुरुन्त कुरा गर्न सकिन्छ — तपाईंको टिकट <b>"+esc(lead.id)+"</b> दर्ता भइसकेको छ।\n\n"+esc(openNote())+"\n\n👉 <a href='"+PHONE_HREF+"'>📞 सिधै फोन गर्नुहोस्: "+esc(PHONE_DISP)+"</a>\n👉 <a href='"+wa+"' target='_blank' rel='noopener'>💬 ह्वाट्सएप (WhatsApp) मा कुरा गर्नुहोस्</a>\n\nकार्यालय समय बाहिर भए भोलि बिहानै प्राथमिकताका साथ कल आउनेछ। भिजिट समय मिलाउन <b>book</b> लेख्नुहोस्।";
  }
  return "🤝 Connecting you to our <b>support representative</b> — no need to repeat, ticket <b>"+esc(lead.id)+"</b> is already created.\n\n"+esc(openNote())+"\n\n👉 <a href='"+PHONE_HREF+"'>📞 Call now: "+esc(PHONE_DISP)+"</a>\n👉 <a href='"+wa+"' target='_blank' rel='noopener'>💬 WhatsApp with reference</a>\n\nIf after-hours, expect a <b>priority callback next morning</b>. Shall I also book a confirmed slot for you? Type <b>book</b>.";
}

/* ---------- multi-step flows ---------- */
function isFlowCancel(text, currentMode, currentStep){
  var t = String(text||"").trim();
  if(!t) return false;
  // If in step 3 (email), "no", "skip", "chaina", etc. means skipping email, NOT cancelling the whole booking
  if(currentMode === "booking" && currentStep === 3){
    if(/^(no|skip|none|na|n\/a|chaina|xaina|chhaina|छैन|नाइ|later|-)$/i.test(t) ||
       /don'?t have|dont have|no email|mail chaina|email chaina/i.test(t)){
      return false;
    }
  }

  // Nepali cancellation words & phrases
  if(/(पर्दैन|रद्द|छोडिदिनुस्|छोड्नुस्|क्यान्सिल|पछि\s*गर्छु|अहिले\s*पर्दैन|अर्डर\s*क्यान्सिल|बुकिङ\s*रद्द|अर्डर\s*रद्द|अहिले\s*हुँदैन)/.test(t)){
    return true;
  }
  if(/\b(pardaina|chhoddinu|chhodnus|pachhi\s*garchhu|pachi\s*garchu|pachhi|cancel\s*gardinu|cancel\s*garnus)\b/i.test(t)){
    return true;
  }

  // English cancellation keywords & phrases
  if(/^(cancel|stop|leave|quit|abort|exit|never\s*mind|forget\s*it|not\s*now|no\s*thanks|no)$/i.test(t)){
    return true;
  }
  return /\b(cancel|cancelled|cancelling|stop\s*it|stop\s*booking|never\s*mind|leave\s*it|leave\s*the\s*order|don'?t\s*want|not\s*now|no\s*need)\b/i.test(t);
}

function isMultiItemRequest(text){
  var t = String(text||"").trim();
  if(!t) return false;
  return /\b(multi(\s*item(s)?)?|multiple(\s*item(s)?)?|bulk|both|more\s*than\s*one|add\s*(another|more)\s*item(s)?|more\s*items|2\s*items|3\s*items|several\s*items|different\s*items|together)\b/i.test(t) ||
    /(एकभन्दा\s*बढी|धेरै\s*सामान|दुईटै|दुबै|थोक|थोकमा|अरु\s*पनि\s*थप्|२\s*वटा|३\s*वटा|सँगै|धेरै\s*अर्डर)/.test(t);
}

function isItemSwitchRequest(text){
  var t = String(text||"").trim();
  if(!t) return false;
  return /\b(instead|another\s*product|another\s*item|different\s*item|different\s*product|switch\s*to|change\s*to|what\s*about|other\s*option(s)?|show\s*me\s*another)\b/i.test(t) ||
    /(यसको\s*सट्टा|अर्को\s*सामान|अर्को\s*हेरौं|बदल्नुस्|अर्को\s*विकल्प|यसको\s*सट्टामा)/.test(t);
}

function handleFlow(text){
  var d = state.data;
  var ne = state.lang==="ne" || isNepali(text);
  var cleanText = String(text||"").trim();

  // 1. If currently waiting for cancellation confirmation:
  if(state.confirmCancel){
    // Did they CONFIRM cancellation?
    var isConfirmedCancel = /^(yes|cancel|confirm|sure|ok|cancel\s*order|रद्द|हो|छोड्नुस्|छोडिदिनुस्|पर्दैन|१|1|1️⃣|हो\s*रद्द)$/i.test(cleanText) ||
      /\b(yes\s*cancel|cancel\s*it|confirm\s*cancel|रद्द\s*गर्नुहोस्)\b/i.test(cleanText);

    // Did they want to CONTINUE / KEEP the order?
    var isContinueOrder = /^(continue|keep|no|don'?t\s*cancel|proceed|stay|जारी|होइन|राख्ने|जारी\s*राख्ने|पर्खनुस्|३|3|3️⃣)$/i.test(cleanText) ||
      /\b(continue\s*(booking|order)?|don'?t\s*cancel|keep\s*booking|अर्डर\s*जारी)\b/i.test(cleanText);

    // Did they want to CHANGE / SWITCH item?
    var isChangeItem = /^(change|switch|another|another\s*item|अर्को|सट्टा|फरक|२|2|2️⃣)$/i.test(cleanText) ||
      /\b(change\s*item|switch\s*item|अर्को\s*सामान)\b/i.test(cleanText);

    if(isConfirmedCancel){
      state.confirmCancel = false;
      state.mode = "idle";
      state.step = 0;
      state.data = {};
      return ne
        ? "हुन्छ, समस्या छैन हजुर! अर्डर प्रक्रिया रोकेर पूर्ण रद्द (Cancel) गरिएको छ। 👍\n\nहजुरलाई अरु कुनै सामान हेर्न मन छ वा केही सोध्नु छ भने निसंकोच भन्नुहोस् है!"
        : "No problem at all! Your reservation has been cancelled. 👍\n\nFeel free to explore our other products, or let me know whatever else you'd like to check out whenever you're ready!";
    }

    if(isContinueOrder){
      state.confirmCancel = false;
      state.step = d.savedStep || state.step || 1;
      var curItem = d.service || (d.product ? d.product.name : "तपाईंको अर्डर");
      var resumeHeader = ne
        ? "धेरै राम्रो! हामी <b>" + esc(curItem) + "</b> को अर्डर प्रक्रियालाई निरन्तरता दिन्छौं। 👍\n\n"
        : "Great! Let's continue with your order for <b>" + esc(curItem) + "</b>. 👍\n\n";

      // Re-prompt the step they were on:
      if(state.step === 1){
        return resumeHeader + (ne ? "<b>चरण १:</b> तपाईंको <b>पूरा नाम</b> के हो हजुर?" : "<b>Step 1:</b> What is your <b>full name</b>?");
      } else if(state.step === 2){
        var fn = (d.name||"").split(" ")[0];
        return resumeHeader + (ne ? "धन्यवाद, <b>"+esc(fn)+"</b> जी! <b>चरण २:</b> तपाईंको <b>सम्पर्क वा WhatsApp नम्बर</b>?" : "Thanks, <b>"+esc(fn)+"</b>! <b>Step 2:</b> Your <b>phone / WhatsApp number</b>?");
      } else if(state.step === 3){
        return resumeHeader + (ne ? "<b>चरण ३:</b> बिल र वारेन्टीका लागि तपाईंको <b>इमेल ठेगाना</b>? (नभए 'skip' लेख्न सक्नुहुन्छ)" : "<b>Step 3:</b> What is your <b>email address</b>? (Or type 'skip' if you don't have one)");
      } else {
        return resumeHeader + (ne ? "<b>डेलिभरी ठेगाना वा भिजिट समय</b> कुन उपयुक्त हुन्छ हजुर?" : "Preferred <b>delivery address or pickup time</b>?");
      }
    }

    if(isChangeItem){
      state.confirmCancel = false;
      state.mode = "idle";
      state.step = 0;
      state.data = {};
      return ne
        ? "हुन्छ हजुर! अघिको अर्डर सुरक्षित राखिएन। हजुरलाई कुन सामान वा मोडल हेर्न मन छ? (जस्तै: Dell/HP ल्यापटप, CCTV क्यामेरा, SSD वा सफ्टवेयर?)"
        : "Sure thing! I've set aside that reservation. Which product or model would you like to check out instead? (e.g. Dell/HP laptop, Hikvision CCTV, SSD, or Jigri ERP software?)";
    }
  }

  // 2. Cancellation request detected:
  if(isFlowCancel(cleanText, state.mode, state.step)){
    // If active booking with product or customer details, ask confirmation first!
    if(state.mode === "booking" && (d.service || d.name || state.step >= 1)){
      state.confirmCancel = true;
      d.savedStep = state.step;
      var activeItem = d.service || (d.product ? d.product.name : (ne ? "यो सामान" : "this item"));
      return ne
        ? "⚠️ <b>अर्डर रद्द गर्ने पक्का हो?</b>\nनिश्चित हुनका लागि सोधेँ हजुर — के तपाईं <b>" + esc(activeItem) + "</b> को अर्डर <b>रद्द (Cancel)</b> नै गर्न चाहनुहुन्छ, वा <b>अर्को सामान हेर्ने</b> / <b>अर्डर जारी राख्ने</b>? 🙂\n\nछान्नुहोस्:\n1️⃣ <b>रद्द गर्ने</b> (Cancel Order)\n2️⃣ <b>अर्को सामान</b> (Switch Product)\n3️⃣ <b>जारी राख्ने</b> (Continue Order)"
        : "⚠️ <b>Confirm Cancellation:</b>\nJust to be sure, would you like to <b>cancel</b> your reservation for <b>" + esc(activeItem) + "</b>, or would you prefer to <b>switch items</b> or <b>continue your order</b>? 🙂\n\nChoose an option:\n1️⃣ <b>Cancel Order</b>\n2️⃣ <b>Change Item</b>\n3️⃣ <b>Continue Order</b>";
    }

    state.mode = "idle";
    state.step = 0;
    state.data = {};
    return ne
      ? "हुन्छ, समस्या छैन हजुर! अर्डर/अनुरोध प्रक्रिया रोकेर रद्द (Cancel) गरिएको छ। 👍\n\nहजुरलाई अरु कुनै सामान हेर्न मन छ वा केही सोध्नु छ भने निसंकोच भन्नुहोस् है!"
      : "No problem at all! I have cancelled that request for you. 👍\n\nFeel free to explore other products, or let me know whatever else you'd like to check out whenever you're ready!";
  }

  // 2. User asks for a human / representative midway
  if(/^(human|agent|representative|call\s*me|phone|help|📞|प्रतिनिधि|मान्छे|सपोर्ट)$/i.test(cleanText) ||
     /\b(talk\s*to\s*(a\s*)?human|speak\s*with\s*(a\s*)?person|talk\s*to\s*agent|प्रतिनिधिसँग\s*कुरा)\b/i.test(cleanText)){
    state.mode = "idle";
    state.step = 0;
    state.data = {};
    return handoff(ne ? "ग्राहकले प्रक्रियाको बीचमै प्रतिनिधिसँग कुरा गर्न चाहेको" : "User requested human during flow", cleanText);
  }

  // 3. User wants MULTI-ITEM or BULK ordering
  if(isMultiItemRequest(cleanText)){
    var prevCustomerName = d.name || "";
    state.mode = "bulk";
    state.step = 2; // Direct to item list & quantities collection
    state.data = { biz: prevCustomerName || (ne ? "ग्राहक अर्डर" : "Customer Order") };
    return ne
      ? "📦 <b>एकभन्दा बढी वा धेरै सामान (Multi-Item / Bulk) अर्डर गर्न २ वटा सजिला उपाय छन्:</b>\n\n1️⃣ <b>यहाँ च्याटमै सामानहरूको सूची लेख्नुहोस्:</b>\nतपाईंलाई चाहिने सबै सामान र परिमाण (जस्तै: <i>'१ वटा HP ल्यापटप, ४ वटा CCTV क्यामेरा, र १ वटा प्रिन्टर'</i>) लेख्नुहोस् — हाम्रो टिमले एउटै संयुक्त बिल/कोटेसन तयार गर्नेछ।\n\n2️⃣ <b>होलसेल फाराम:</b> आधिकारिक VAT/PAN कोटेसनका लागि 👉 <a href='"+LINKS.bulk+"'><b>होलसेल कोटेसन फाराम (Bulk Quote)</b></a> मा सूची पठाउन सक्नुहुन्छ।\n\nअहिले तपाईंलाई कुन-कुन सामान आवश्यक परेको हो हजुर?"
      : "📦 <b>Booking multiple items or bulk orders is very easy! You have two great options:</b>\n\n1️⃣ <b>List your items right here in chat:</b>\nSimply reply with the items & quantities you need (e.g. <i>'1x HP Laptop, 4x CCTV cameras, 1x printer'</i>) and our team will prepare a combined itemized invoice.\n\n2️⃣ <b>Wholesale Form:</b> For dealer/bulk quantities and official VAT/PAN quotations, submit your list on our 👉 <a href='"+LINKS.bulk+"'><b>Bulk Quotation Page</b></a>.\n\nWhat items and quantities would you like to order?";
  }

  // 4. User wants to SWITCH to another product or inquires about a product
  var isSwitch = isItemSwitchRequest(cleanText);
  var productMatches = searchExcelProducts(cleanText);
  var looksLikeProductQuery = false;
  if(productMatches && productMatches.length){
    if(state.step >= 2){
      // In phone, email, service, slot steps, typing a product query is definitely a product switch
      looksLikeProductQuery = true;
    } else {
      // In step 1 (name): only switch if explicit switch keywords OR product terms are mentioned
      var hasProductKeywords = matchAny(cleanText.toLowerCase(), [
        "price", "cost", "kati", "rate", "camera", "cctv", "laptop", "software", "ssd", "monitor",
        "ram", "dvr", "nvr", "hikvision", "dahua", "dell", "hp", "core", "intel", "ryzen",
        "instead", "what about", "show me", "अर्को", "सट्टा", "क्यामेरा", "ल्यापटप", "कति"
      ]);
      looksLikeProductQuery = isSwitch || hasProductKeywords;
    }
  }

  if(looksLikeProductQuery || isSwitch){
    state.mode = "idle";
    state.step = 0;
    state.data = {};
    if(productMatches && productMatches.length){
      var switchedHeader = ne
        ? "🔄 <b>सामान परिवर्तन गरियो!</b> अघिको अर्डर रोकेर नयाँ सामानको विवरण प्रस्तुत गरिएको छ:\n\n"
        : "🔄 <b>Switched product!</b> Previous order set aside. Here is the info for your new selection:\n\n";
      return switchedHeader + formatExcelResults(productMatches, ne, false);
    } else {
      return ne
        ? "हुन्छ हजुर! अघिको अर्डर रोकेर राख्यौं। हजुरलाई कुन सामान वा मोडल हेर्न मन छ? (जस्तै: Dell/HP ल्यापटप, CCTV क्यामेरा, SSD वा सफ्टवेयर?)"
        : "Sure thing! I've set aside that order. Which product or model would you like to check out instead? (e.g. Dell/HP laptop, Hikvision CCTV, SSD, or Jigri ERP software?)";
    }
  }

  if(state.mode==="booking"){
    // Step 1: Customer Name
    if(state.step===1){
      d.name=text.trim();
      if(d.name.length<2) return ne ? "कृपया आफ्नो पूरा नाम लेख्नुहोस् 🙂" : "Please share your full name 🙂";
      try{ localStorage.setItem("prixna_customer_name", d.name); }catch(e){}
      state.step=2;
      var firstName=d.name.split(" ")[0];
      var totalSteps = d.service ? "४" : "५";
      var totalStepsEn = d.service ? "4" : "5";
      return ne
        ? "धन्यवाद, <b>"+esc(firstName)+"</b> जी! 🙏 <b>चरण २/"+totalSteps+":</b> तपाईंको <b>सम्पर्क वा WhatsApp नम्बर</b>?"
        : "Thanks, <b>"+esc(firstName)+"</b>! 🙏 <b>Step 2/"+totalStepsEn+":</b> Your <b>phone / WhatsApp number</b>?";
    }

    // Step 2: Contact Number -> ask Email Address
    if(state.step===2){
      var ph=validPhone(text);
      if(!ph) return ne ? "नम्बर अधुरो देखियो — कृपया १० अङ्कको मोबाइल नम्बर दिनुहोस् (जस्तै: ९८XXXXXXXX)।" : "That number looks incomplete — please share a 10-digit mobile number (e.g. 98XXXXXXXX).";
      d.phone=ph;
      try{ localStorage.setItem("prixna_customer_phone", ph); }catch(e){}
      state.step=3;
      var fn2=(d.name||"").split(" ")[0];
      var totalSteps2 = d.service ? "४" : "५";
      var totalSteps2En = d.service ? "4" : "5";
      return ne
        ? "धन्यवाद, <b>"+esc(fn2)+"</b> जी! 🙏 <b>चरण ३/"+totalSteps2+":</b> अर्डर विवरण, बिल (Invoice) र वारेन्टी विवरण पठाउन तपाईंको <b>इमेल ठेगाना (Email)</b> दिनुहोस्?\n<i>(नभएमा 'skip' वा 'छैन' लेख्न सक्नुहुन्छ)</i>"
        : "Thanks, <b>"+esc(fn2)+"</b>! 🙏 <b>Step 3/"+totalSteps2En+":</b> What is your <b>email address</b> so that we can email you the official invoice, warranty card & details?\n<i>(Or type 'skip' if you don't have one)</i>";
    }

    // Step 3: Email Address processing
    if(state.step===3){
      var raw = text.trim();
      var emMatch = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      var isSkip = /^(skip|no|none|na|n\/a|chaina|xaina|chhaina|छैन|नाइ|पर्दैन|पछि|later|-)$/i.test(raw) ||
                   /^(skip|no|chaina|छैन)\b/i.test(raw) ||
                   /don'?t have|dont have|no email|mail chaina|chaina|छैन/i.test(raw);

      if(!emMatch && !isSkip){
        if(/@/.test(raw) || (raw.length > 3 && !/^[0-9]+$/.test(raw) && !/^[a-zA-Z\s]+$/.test(raw))){
          return ne
            ? "इमेल ढाँचा मिलेन जस्तो देखिन्छ (जस्तै: yourname@gmail.com)। कृपया सही इमेल दिनुहोस् वा नभए <b>'skip'</b> लेख्नुहोस्।"
            : "That email format looks incomplete (e.g. yourname@gmail.com). Please share a valid email or type <b>'skip'</b>.";
        } else {
          return ne
            ? "विवरण र बिल पठाउन कृपया आफ्नो इमेल ठेगाना दिनुहोस् (जस्तै: name@gmail.com), अथवा इमेल नभए <b>'skip'</b> लेख्नुहोस् 🙂"
            : "Please share your email address so we can email details & invoice (e.g. name@gmail.com), or type <b>'skip'</b> if you don't have one 🙂";
        }
      }

      d.email = emMatch ? emMatch[0].toLowerCase() : "";
      try{ if(d.email) localStorage.setItem("prixna_customer_email", d.email); }catch(e){}
      var emailAck = d.email
        ? (ne ? "✉️ इमेल <b>"+esc(d.email)+"</b> सुरक्षित गरियो!\n\n" : "✉️ Email <b>"+esc(d.email)+"</b> recorded!\n\n")
        : (ne ? "👍 समस्या छैन हजुर, इमेल बिना नै अघि बढौं — सम्पूर्ण विवरण फोन तथा WhatsApp मा पठाइनेछ।\n\n" : "👍 No problem, we'll proceed without an email — all updates will be confirmed via phone & WhatsApp.\n\n");

      // If service is already set (product reservation from catalog, e.g. Dell Inspiron laptop)
      if(d.service){
        state.step = 5;
        return ne
          ? emailAck + "<b>चरण ४/४:</b> तपाईंलाई सामान कहिले चाहिन्छ वा डेलिभरी ठेगाना कुन हो? (जस्तै: <i>'भोलि दिउँसो २ बजे, नयाँ बानेश्वर'</i> वा <i>'कोटेश्वर अफिस आएर लिने'</i>)।"
          : emailAck + "<b>Step 4/4:</b> Preferred delivery address or pickup time? (e.g. <i>'Tomorrow 2 PM, Koteshwor pickup'</i> or <i>'Delivery to New Baneshwor'</i>).";
      }

      // If general booking, prompt for service selection
      state.step = 4;
      return ne
        ? emailAck + "<b>चरण ४/५:</b> कुन सेवाका लागि हो? नम्बर छान्नुहोस्:\n1️⃣ सफ्टवेयर डेमो  2️⃣ CCTV जडान  3️⃣ कम्प्युटर/नेटवर्क  4️⃣ मर्मत भिजिट  5️⃣ निःशुल्क परामर्श"
        : emailAck + "<b>Step 4/5:</b> What service? Reply number:\n1️⃣ Software demo  2️⃣ CCTV install  3️⃣ Computer/Network  4️⃣ Repair visit  5️⃣ Free consultation";
    }

    // Step 4: Service selection (for general booking)
    if(state.step===4){
      var map={"1":"Business Software Demo","2":"CCTV Installation (site visit)","3":"Computer/Network Setup","4":"Repair & Maintenance Visit","5":"Free Business Consultation"};
      d.service=map[text.trim()]||text.trim().slice(0,80);
      state.step=5;
      return ne
        ? "<b>चरण ५/५:</b> तपाईंलाई कुन <b>दिन र समय</b> उपयुक्त हुन्छ? (आइत–शुक्र, ९:३०–६:३०)। जस्तै: <i>'आइतबार बिहान ११ बजे, कोटेश्वर पसल'</i> — शनिबार बन्द रहन्छ।"
        : "<b>Step 5/5:</b> Preferred <b>day + time</b>? (Sun–Fri, 9:30–6:30). E.g. <i>'Sunday 11am, Koteshwor shop visit'</i> — Saturday is closed.";
    }

    // Step 5: Final slot/address + booking creation
    if(state.step===5){
      var m=text.trim().slice(0,120);
      var day=(m.match(/sun|mon|tue|wed|thu|fri|sunday|monday|tuesday|wednesday|thursday/i)||["To confirm"])[0];
      if(/sat|शनि/i.test(m)) return ne ? "⚠️ शनिबार हाम्रो कार्यालय बन्द रहन्छ। कृपया आइतबारदेखि शुक्रबारसम्मको समय छान्नुहोस् — जस्तै: <i>'आइतबार ११ बजे'</i>।" : "⚠️ We're closed on Saturdays. Please pick Sun–Fri — e.g. <i>'Sunday 11am'</i>.";
      d.slot=m;
      var b=saveBooking({name:d.name,phone:d.phone,email:d.email||"",service:d.service,day:day,time:m,location:m});
      var lead=saveLead({name:d.name,phone:d.phone,email:d.email||"",service:d.service,message:"Booking "+b.id+(d.email?" | Email: "+d.email:"")+" | Slot: "+m,note:"booking "+b.id});
      state.mode="idle"; state.step=0; state.data={};
      log("ai_booking",b.id);
      var wa=waLink("Hello Prixna! Booking "+b.id+" — "+d.name+" ("+d.phone+(d.email?", "+d.email:"")+") for "+d.service+" at "+m+". Ref "+lead.id);
      var calStart=nextDateForDay(day,m), calHtml="";
      if(calStart){
        var calEnd=new Date(calStart.getTime()+3600000);
        var gUrl=gcalLink("Prixna visit — "+d.service+" ("+b.id+")",calStart,calEnd,m);
        var icsUrl=icsDownloadLink("Prixna visit — "+d.service+" ("+b.id+")",calStart,calEnd,m,"Customer "+d.name+" "+d.phone+(d.email?" "+d.email:"")+" Ref "+b.id);
        try{ if(window.PRIXNA_LOG) window.PRIXNA_LOG("ai_booking_cal", b.id); }catch(e){}
        calHtml="<br>👉 <a href='"+gUrl+"' target='_blank' rel='noopener'>📅 Add to Google Calendar</a> · <a href='"+icsUrl+"' download='"+b.id+".ics'>⬇️ Apple/Outlook (.ics)</a>";
      }
      return ne
        ? "✅ <b>बुकिङ सुरक्षित भयो!</b> ID <b>"+esc(b.id)+"</b>\n👤 <b>नाम:</b> "+esc(d.name)+"\n📞 <b>सम्पर्क:</b> "+esc(d.phone)+(d.email?"\n✉️ <b>इमेल:</b> "+esc(d.email):"")+"\n💼 <b>सेवा/सामान:</b> "+esc(d.service)+"\n🕒 <b>समय/ठेगाना:</b> "+esc(m)+"\n\nहाम्रो टिमले <b>"+esc(d.phone)+"</b> मा सम्पर्क गरी "+(d.email?"<b>"+esc(d.email)+"</b> मा विस्तृत विवरण तथा बिल पठाउनेछ।":"थप विवरण गराउनेछ।")+"\n\n👉 <a href='"+wa+"' target='_blank' rel='noopener'>💬 ह्वाट्सएपमा पक्का गर्नुहोस्</a> · <a href='"+PHONE_HREF+"'>📞 "+esc(PHONE_DISP)+"</a>"+calHtml+"<br>👉 <a href='"+LINKS.feedback+"?ref="+esc(b.id)+"'>⭐ भिजिटपछि यहाँ रेटिङ दिनुहोस्</a>\nReference: "+esc(lead.id)
        : "✅ <b>Booking Confirmed!</b> ID <b>"+esc(b.id)+"</b>\n👤 <b>Name:</b> "+esc(d.name)+"\n📞 <b>Contact:</b> "+esc(d.phone)+(d.email?"\n✉️ <b>Email:</b> "+esc(d.email):"")+"\n💼 <b>Item/Service:</b> "+esc(d.service)+"\n🕒 <b>Slot/Location:</b> "+esc(m)+"\n\nOur team will contact <b>"+esc(d.phone)+"</b>"+(d.email?" and email details & invoice to <b>"+esc(d.email)+"</b>.":" to confirm.")+"\n\n👉 <a href='"+wa+"' target='_blank' rel='noopener'>💬 Confirm on WhatsApp</a> · <a href='"+PHONE_HREF+"'>📞 "+esc(PHONE_DISP)+"</a>"+calHtml+"<br>👉 <a href='"+LINKS.feedback+"?ref="+esc(b.id)+"'>⭐ After your visit, rate us</a>\nReference: "+esc(lead.id);
    }
  }
  if(state.mode==="ticket"){
    if(state.step===1){ d.device=text.trim().slice(0,100); state.step=2;
      if(/urgent|emergency|stood|stopped|band|जरुरी|तत्काल/i.test(text)) d.urgent=true;
      return ne
        ? "<b>चरण २/३:</b> समस्या के आएको हो एक वाक्यमा बताउनुहोस्? (कहिलेदेखि र के इरर आयो)"+(d.urgent?" 🚨 <b>जरुरी (Urgent)</b> मा राखियो।":"")
        : "<b>Step 2/3:</b> Describe the problem in one line? (since when + any error message)."+(d.urgent?" 🚨 Marked <b>URGENT</b>.":""); }
    if(state.step===2){ d.problem=text.trim().slice(0,400); state.step=3;
      return ne
        ? "<b>चरण ३/३:</b> प्राविधिकले सम्पर्क गर्न तपाईंको <b>फोन नम्बर</b> दिनुहोस्?"
        : "<b>Step 3/3:</b> Your <b>phone number</b> for technician callback + ticket updates?"; }
    if(state.step===3){ var p2=validPhone(text); if(!p2) return ne ? "कृपया सही १०-अङ्कको मोबाइल नम्बर दिनुहोस् ताकि हाम्रो प्राविधिकले सम्पर्क गर्न सकोस्।" : "Please share a valid 10-digit mobile number so our technician can reach you.";
      var pri=d.urgent||/urgent|stopped|not billing|cctv down|server|बन्द|रोकियो/i.test(d.problem||"")?"Urgent":"Medium";
      var t=saveTicket({name:"",phone:p2,device:d.device,problem:d.problem,priority:pri,transcript:d.device+" | "+d.problem});
      var l2=saveLead({phone:p2,service:"Repair & Support",message:"Ticket "+t.id+" | "+d.device+": "+d.problem,note:"ticket "+t.id+" ("+pri+")"});
      state.mode="idle"; state.step=0; state.data={};
      log("ai_ticket",t.id);
      var wa2=waLink("Hello Prixna! Support "+t.id+" ("+pri+") — "+d.device+": "+d.problem+". My number "+p2+". Ref "+l2.id);
      var base=ne
        ? "🎫 <b>सपोर्ट टिकट "+esc(t.id)+"</b> दर्ता भयो ("+pri+" प्राथमिकता)।\n🧰 "+esc(d.device)+"\n💬 "+esc(d.problem)+"\n"+esc(openNote())+"\n\n👉 <a href='"+wa2+"' target='_blank' rel='noopener'>💬 ह्वाट्सएपमा टिकट पठाउनुहोस्</a>"
        : "🎫 <b>Ticket "+esc(t.id)+"</b> created ("+pri+" priority).\n🧰 "+esc(d.device)+"\n💬 "+esc(d.problem)+"\n"+esc(openNote())+"\n\n👉 <a href='"+wa2+"' target='_blank' rel='noopener'>💬 Send ticket on WhatsApp</a>";
      if(pri==="Urgent") return base+"\n\n🚨 <b>तत्काल सहयोग चाहिन्छ?</b> — "+handoff("Urgent ticket "+t.id, d.device+": "+d.problem);
      return ne ? base+"\n\nप्राविधिक भिजिट पनि बुकिङ गर्न चाहनुहुन्छ भने <b>book</b> लेख्नुहोस्।" : base+"\n\nWant a confirmed technician visit too? Type <b>book</b>.";
    }
  }
  if(state.mode==="bulk"){
    if(state.step===1){ d.biz=text.trim().slice(0,100); if(d.biz.length<2) return ne ? "कृपया संस्था वा पसलको नाम लेख्नुहोस् 🙂" : "Please share business/org name 🙂"; state.step=2;
      return ne ? "<b>चरण २/३:</b> सामानको सूची र परिमाण? (जस्तै: <i>'१० वटा ल्यापटप, ८ वटा CCTV'</i>)" : "<b>Step 2/3:</b> Item list + quantities? (e.g. <i>'10x laptop, 8x CCTV, 2x router'</i>)"; }
    if(state.step===2){ if(text.trim().length<5) return ne ? "कृपया कम्तीमा एउटा सामान र परिमाण लेख्नुहोस्।" : "Please list at least one item + quantity."; d.items=text.trim().slice(0,500); state.step=3;
      return ne ? "<b>चरण ३/३:</b> तपाईंको <b>नाम र फोन नम्बर</b>? (जस्तै: <i>'राम ९८१३७१४५८२'</i>)" : "<b>Step 3/3:</b> Your <b>name + phone number</b>? (e.g. <i>'Ram 9813714582'</i>)"; }
    if(state.step===3){
      var phb=validPhone(text); var nm=text.replace(/[\d\s\-\+]/g,"").trim().slice(0,60)||d.biz;
      if(!phb) return ne ? "१० अङ्कको फोन नम्बर आवश्यक छ — जस्तै: <i>'राम ९८१३७१४५८२'</i>।" : "Need a valid 10-digit phone — e.g. <i>'Ram 9813714582'</i>.";
      var lb=saveLead({name:nm,phone:phb,company:d.biz,service:"Bulk / Dealer Enquiry",message:"BULK LIST ("+d.biz+"):\n"+d.items,note:"bulk quote"});
      saveBooking({name:nm,phone:phb,service:"Bulk Order ("+d.biz+")",items:d.items,location:d.biz,time:"Sun-Fri quotation"});
      try{ if(window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("bulk",lb); }catch(e){}
      state.mode="idle"; state.step=0; state.data={};
      log("ai_bulk",lb.id);
      var wab=waLink("Hello Prixna! Bulk enquiry "+lb.id+" — "+nm+" ("+phb+") ["+d.biz+"] List: "+d.items.slice(0,250));
      return ne
        ? "📦 <b>होलसेल अनुरोध दर्ता भयो!</b> ID <b>"+esc(lb.id)+"</b>\n🏢 "+esc(d.biz)+"\n📋 "+esc(d.items)+"\nहाम्रो टिमले आइत–शुक्र विस्तृत NPR कोटेसन पठाउनेछ।\n\n👉 <a href='"+wab+"' target='_blank' rel='noopener'>💬 ह्वाट्सएपमा पठाउनुहोस्</a> · <a href='"+LINKS.bulk+"'>पूरा फाराम हेर्नुहोस्</a>"
        : "📦 <b>Bulk request received!</b> ID <b>"+esc(lb.id)+"</b>\n🏢 "+esc(d.biz)+"\n📋 "+esc(d.items)+"\nTeam replies Sun–Fri with one itemised NPR quotation.\n\n👉 <a href='"+wab+"' target='_blank' rel='noopener'>💬 Send list on WhatsApp</a> · <a href='"+LINKS.bulk+"'>Full bulk form</a>";
    }
  }
  if(state.mode==="callback"){
    if(state.step===1){ var p3=validPhone(text); if(!p3) return ne ? "कृपया १०-अङ्कको मोबाइल नम्बर दिनुहोस्।" : "Please share a valid 10-digit mobile number.";
      var l3=saveLead({phone:p3,service:"Callback Request",message:"Callback requested via Prixna AI. Original: "+(state.data.orig||"") ,note:"callback"});
      state.mode="idle"; state.step=0;
      log("ai_callback",p3);
      return ne
        ? "✅ कल ब्याक अनुरोध दर्ता भयो <b>"+esc(p3)+"</b> का लागि — "+(isOpen()?"१५ मिनेटभित्र कल आउनेछ।":"अहिले कार्यालय बन्द छ, भोलि बिहानै प्राथमिकताका साथ कल आउनेछ (आइत–शुक्र, ९:३० बजेपछि)।")+"\nRef: <b>"+esc(l3.id)+"</b>. छिटो सहयोगका लागि: <a href='"+PHONE_HREF+"'>📞 "+esc(PHONE_DISP)+"</a>"
        : "✅ Callback locked in for <b>"+esc(p3)+"</b> — "+(isOpen()?"expect our call within ~15 minutes.":"we're closed now, so priority callback next working morning (Sun–Fri 9:30+).")+"\nRef: <b>"+esc(l3.id)+"</b>. For faster help: <a href='"+PHONE_HREF+"'>📞 "+esc(PHONE_DISP)+"</a>";
    }
  }
  return null;
}

/* ---------- backend (optional) ---------- */
function backendReply(msgs, cb){
  if(!BACKEND){ cb(null); return; }
  fetch(BACKEND,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({messages:msgs.slice(-12),page:location.pathname,lang:state.lang})})
    .then(function(r){return r.json();}).then(function(j){ cb(j&&j.reply?j.reply:null); })
    .catch(function(){ cb(null); });
}

/* ---------- UI ---------- */
var msgsEl, panel, fab, badge, input, quickEl;
var history = loadJSON(LS_MSGS,[]);
function pushMsg(who, html){
  history.push({who:who,html:html,ts:new Date().toISOString()});
  saveJSON(LS_MSGS,history.slice(-80));
  renderMsg(who,html);
}
function renderMsg(who, html){
  var div=document.createElement("div");
  div.className="prixna-ai-msg "+who;
  div.innerHTML=html+"<div class='m-meta'>"+(who==="bot"?"Prixna AI · ":"You · ")+new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})+"</div>";
  msgsEl.appendChild(div); msgsEl.scrollTop=msgsEl.scrollHeight;
}
function clearChat(){
  history = [];
  try{ localStorage.removeItem(LS_MSGS); }catch(e){}
  try{ localStorage.removeItem(LS_MEM); }catch(e){}
  try{ localStorage.removeItem("prixna_customer_name"); }catch(e){}
  try{ localStorage.removeItem("prixna_customer_phone"); }catch(e){}
  try{ localStorage.removeItem("prixna_customer_email"); }catch(e){}
  try{ localStorage.removeItem("prixna_customer_age"); }catch(e){}
  clientMem = {};
  if(msgsEl) msgsEl.innerHTML = "";
  state.mode = "idle";
  state.step = 0;
  state.data = {};
  state.confirmCancel = false;
  state.lastProduct = null;
  greeted = true;
  var welcome = answerFor("greet", "hello");
  pushMsg("bot", welcome);
  setQuick(defaultQuick());
  if(input) input.value = "";
}
function showTyping(){ var t=document.createElement("div"); t.className="prixna-ai-typing"; t.id="prixna-ai-typing"; t.textContent="Prixna AI is typing…"; msgsEl.appendChild(t); msgsEl.scrollTop=msgsEl.scrollHeight; }
function hideTyping(){ var t=$("#prixna-ai-typing"); if(t) t.remove(); }
function setQuick(list){
  quickEl.innerHTML="";
  list.forEach(function(q){ var b=document.createElement("button"); b.type="button"; b.textContent=q; b.onclick=function(){ sendUser(q); }; quickEl.appendChild(b); });
}
function defaultQuick(){
  if(state.lang === "ne"){
    return ["🎬 डेमो हेर्ने","💼 सफ्टवेयर","🎥 CCTV","🖥️ ल्यापटप","📅 भिजिट बुक","📞 प्रतिनिधि"];
  }
  return ["🎬 Watch demo","💼 Software","🎥 CCTV","🖥️ Laptop","📅 Book visit","📞 Human"];
}

var LS_MEM = "prixna_ai_client_mem_v2";
var clientMem = loadJSON(LS_MEM, {});
function getClientMemory(q, lang){
  if(state.mode !== "idle") return null;
  // Always evaluate demo queries dynamically based on page and conversation context
  if(/\b(demo|डेमो|video|भिडियो|watch|हेर्न)\b/i.test(q)) return null;
  var k = (lang||"ne") + ":" + String(q||"").toLowerCase().replace(/[^\w\u0900-\u097F]/g," ").replace(/\s+/g," ").trim();
  return clientMem[k] || null;
}
function setClientMemory(q, reply, lang){
  if(state.mode !== "idle" || !q || !reply || reply.length < 15) return;
  if(/\b(demo|डेमो|video|भिडियो)\b/i.test(q)) return;
  // Safety guardrail: Never cache personal data
  if(/\b9[78]\d{8}\b/.test(q+reply) || /@/.test(q+reply) || /\b[blt]\d{3,}\b/i.test(q+reply)) return;
  var k = (lang||"ne") + ":" + String(q||"").toLowerCase().replace(/[^\w\u0900-\u097F]/g," ").replace(/\s+/g," ").trim();
  clientMem[k] = reply;
  var keys = Object.keys(clientMem);
  if(keys.length > 60) delete clientMem[keys[0]];
  saveJSON(LS_MEM, clientMem);
}

function botReply(userText){
  showTyping();
  var flow = handleFlow(userText);
  if(flow){
    setTimeout(function(){
      hideTyping();
      pushMsg("bot",flow);
      speak(stripTags(flow));
      if(state.confirmCancel){
        setQuick(state.lang==="ne" ? ["❌ रद्द गर्ने", "🔄 अर्को सामान", "➡️ जारी राख्ने"] : ["❌ Yes, Cancel", "🔄 Change Item", "➡️ Continue Order"]);
      } else {
        setQuick(defaultQuick());
      }
    },600);
    return;
  }

  // Fast Client-Side Memory Check (0ms repeat response)
  var memCached = getClientMemory(userText, state.lang);
  if(memCached){
    setTimeout(function(){
      hideTyping();
      pushMsg("bot", memCached);
      speak(stripTags(memCached));
      setQuick(defaultQuick());
    }, 250);
    return;
  }

  var ne = isNepali(userText) || state.lang==="ne";
  var contextual = getContextualAnswer(userText, ne);
  var intent = detectIntent(userText);
  // frustration / repeat → escalate smartly
  if(/bakwas|stupid|useless|idiot|complaint/i.test(userText)){ intent="human"; }
  var local = contextual || ((intent==="human") ? handoff("escalation trigger", userText) : answerFor(intent, userText));
  var convo = history.slice(-10).map(function(m){return {role:m.who==="bot"?"assistant":"user",content:stripTags(m.html)};});
  convo.push({role:"user",content:userText});
  backendReply(convo, function(bReply){
    var chosen = bReply || local;
    setClientMemory(userText, chosen, state.lang);
    setTimeout(function(){
      hideTyping();
      pushMsg("bot", chosen);
      speak(stripTags(chosen), function(){
        if(voiceChatActive && panel && panel.classList.contains("open")){
          var vBtn = $("#prixna-ai-voice");
          setTimeout(function(){
            if(voiceChatActive && panel && panel.classList.contains("open")){
              startListening(vBtn);
            }
          }, 600);
        }
      });
      var isDemoMode = (intent==="demo" || intent==="software" || (chosen && (chosen.indexOf("demo-cta")>-1 || chosen.indexOf("डेमो थिएटर")>-1 || chosen.indexOf("Demo Theatre")>-1)));
      if(isDemoMode){
        var neDemos = ["🧾 Jigri ERP डेमो", "🍽️ रेस्टुरेन्ट POS", "📊 Jigri CRM डेमो", "👆 eHajiri डेमो", "🆓 निःशुल्क परामर्श"];
        var enDemos = ["🧾 Jigri ERP Demo", "🍽️ Restaurant POS", "📊 Jigri CRM Demo", "👆 eHajiri Demo", "🆓 Free consultation"];
        if(state.lastDiscussedDemo === "jigri-erp"){
          neDemos = ["🍽️ रेस्टुरेन्ट POS", "📊 Jigri CRM डेमो", "👆 eHajiri डेमो", "🆓 निःशुल्क परामर्श", "💬 WhatsApp"];
          enDemos = ["🍽️ Restaurant POS", "📊 Jigri CRM Demo", "👆 eHajiri Demo", "🆓 Free consultation", "💬 WhatsApp"];
        } else if(state.lastDiscussedDemo === "restaurant-pos"){
          neDemos = ["🧾 Jigri ERP डेमो", "📊 Jigri CRM डेमो", "👆 eHajiri डेमो", "🆓 निःशुल्क परामर्श", "💬 WhatsApp"];
          enDemos = ["🧾 Jigri ERP Demo", "📊 Jigri CRM Demo", "👆 eHajiri Demo", "🆓 Free consultation", "💬 WhatsApp"];
        } else if(state.lastDiscussedDemo === "jigri-crm"){
          neDemos = ["🧾 Jigri ERP डेमो", "🍽️ रेस्टुरेन्ट POS", "👆 eHajiri डेमो", "🆓 निःशुल्क परामर्श", "💬 WhatsApp"];
          enDemos = ["🧾 Jigri ERP Demo", "🍽️ Restaurant POS", "👆 eHajiri Demo", "🆓 Free consultation", "💬 WhatsApp"];
        } else if(state.lastDiscussedDemo === "ehajiri-attendance"){
          neDemos = ["🧾 Jigri ERP डेमो", "🍽️ रेस्टुरेन्ट POS", "📊 Jigri CRM डेमो", "🆓 निःशुल्क परामर्श", "💬 WhatsApp"];
          enDemos = ["🧾 Jigri ERP Demo", "🍽️ Restaurant POS", "📊 Jigri CRM Demo", "🆓 Free consultation", "💬 WhatsApp"];
        }
        setQuick(state.lang==="ne" ? neDemos : enDemos);
      } else if(intent==="general"||intent==="greet") setQuick(defaultQuick());
      else if(chosen.indexOf("Which item or service")>-1 || chosen.indexOf("कुन सामान वा सेवा बुक")>-1) setQuick(state.lang==="ne"?["💻 Dell ल्यापटप","🎥 CCTV क्यामेरा","⚡ SSD अपग्रेड","💼 बिलिङ सफ्टवेयर"]:["💻 Dell Laptop","🎥 CCTV Camera","⚡ SSD Upgrade","💼 Billing Software"]);
      else if(intent==="support") setQuick(state.lang==="ne"?["अति जरुरी","ल्यापटप मर्मत","बिलिङ सफ्टवेयर समस्या","CCTV नचलेको","📞 प्रतिनिधि"]:["urgent","laptop repair","billing software issue","CCTV not working","📞 Human"]);
      else if(intent==="price") setQuick(state.lang==="ne"?["कोटेशन माग्नुहोस्","पसल लाइभ मूल्य","📞 प्रतिनिधि","📅 भिजिट बुक"]:["Request quote","Shop live pricing","📞 Human","📅 Book visit"]);
      else setQuick(state.lang==="ne"?["📅 भिजिट बुक","📞 प्रतिनिधि","💬 WhatsApp","ℹ️ समय र ठेगाना"]:["📅 Book visit","📞 Human","💬 WhatsApp","ℹ️ Hours & location"]);
    }, 700);
  });
}
function stripTags(h){ var d=document.createElement("div"); d.innerHTML=h; return d.textContent||""; }

function detectMessageLang(t, currentLang){
  t = String(t||"").trim();
  var curr = currentLang || state.lang || "ne";
  if(!t) return curr;

  // 1. Explicit language switch commands
  if(/\b(nepali|nepalima|nepali\s*ma|in\s*nepali|speak\s*nepali|reply\s*in\s*nepali|nepali\s*bhasa|bolnus)\b/i.test(t)){
    return "ne";
  }
  if(/\b(english|in\s*english|speak\s*english|reply\s*in\s*english|english\s*ma)\b/i.test(t)){
    return "en";
  }

  // 2. Devanagari script is strictly Nepali
  if(/[\u0900-\u097F]/.test(t)) return "ne";

  // 3. Romanized Nepali vocabulary / grammatical particles
  if(isNepali(t)) return "ne";

  // 4. If already in Nepali mode, keep Nepali! Common technical loanwords
  // (cctv, laptop, software, repair, price, billing, etc.) are standard in Nepali queries.
  if(curr === "ne"){
    // Only switch away from Nepali if user writes a full English sentence with English grammar
    var isFullEnglishSentence = /^(what|how|where|when|why|who|can you|could you|would you|please|i want|i need|tell me|do you have|is there)\b/i.test(t) && !isNepali(t);
    if(isFullEnglishSentence) return "en";
    return "ne";
  }

  return "en";
}

function sendUser(text){
  text=String(text||"").trim(); if(!text) return;
  if(/^(clear|clear\s*chat|reset|reset\s*chat|new\s*chat|delete\s*history|delete\s*chat|नयाँ\s*च्याट|च्याट\s*मेटाउनुस्)$/i.test(text)){
    clearChat();
    return;
  }
  state.lang = detectMessageLang(text, state.lang);
  try{ localStorage.setItem(LS_LANG, state.lang); }catch(e){}
  if(input){
    input.placeholder = state.lang === "ne"
      ? "सोध्नुहोस्: बिलिङ सफ्टवेयर, CCTV मूल्य, मर्मत…"
      : "Type: billing software, CCTV price, laptop repair…";
  }
  pushMsg("user",esc(text));
  log("ai_msg","user: "+text.slice(0,80));
  input.value="";
  if(text.toLowerCase()==="mic test"){ micSelfTest(); return; } // hidden diagnostic, no F12 needed
  if(text.toLowerCase()==="voice log"){ voiceLogDump(); return; } // hidden diagnostic: what the mic did, step by step
  botReply(text);
}

/* hidden diagnostic: type "mic test" in chat — reports script version,
   secure context, APIs, voices, and the true mic permission state. */
var PRIXNA_AI_VER="20261012m";
function micSelfTest(){
  var lines=["Script build: <b>"+PRIXNA_AI_VER+"</b>"];
  lines.push("Secure page: "+(window.isSecureContext?"yes ✅":"NO ❌ — use localhost/HTTPS"));
  lines.push("Voice-input API: "+((window.SpeechRecognition||window.webkitSpeechRecognition)?"present ✅":"MISSING ❌ (use Chrome/Edge)"));
  try{ lines.push("TTS voices installed: "+((speechSynthesis.getVoices()||[]).length)); }
  catch(e){ lines.push("TTS: unavailable"); }
  function done(extra){ pushMsg("bot","🔧 <b>Mic self-test</b><br>"+lines.join("<br>")+(extra?"<br>"+extra:"")); }
  try{
    if(navigator.permissions && navigator.permissions.query){
      navigator.permissions.query({name:"microphone"}).then(function(r){
        var s="Mic permission: <b>"+r.state+"</b>";
        if(r.state==="denied") s+="<br>→ Blocked in browser. Click <b>🔒 icon → Site settings → Microphone → Allow</b>, reload, tap 🎤.";
        else if(r.state==="prompt") s+="<br>→ Tap 🎤 and click <b>Allow</b> in the browser prompt.";
        else s+="<br>→ Granted ✅ Tap 🎤 to talk.";
        done(s);
      }).catch(function(){ done("Mic permission: unknown (query failed)"); });
    } else done("Mic permission: unknown (tap 🎤 to test)");
  }catch(e){ done("Mic permission: unknown"); }
}

/* voice chat */
var recog=null, listening=false, voiceChatActive=false;
var voiceLog=[];
function vlog(ev){ try{ var t=new Date().toLocaleTimeString("en-GB"); voiceLog.push(t+" "+ev); if(voiceLog.length>40) voiceLog.shift(); window.PRIXNA_VOICE_LOG=voiceLog; }catch(e){} }
function voiceLogDump(){
  pushMsg("bot", voiceLog.length ? "🎤 <b>Voice log</b> (latest last):<br>"+voiceLog.map(function(l){return esc(l);}).join("<br>") : "🎤 Voice log is <b>empty</b> — tap 🎤 once to test voice input.");
}
function vstat(msg){
  var el=document.getElementById("prixna-ai-vstat");
  if(el){ el.textContent=msg||""; el.style.display=msg?"block":"none"; }
}
function micDeniedMsg(err){
  var n=(err&&err.name)||"";
  var isNe = state.lang==="ne";
  if(n==="NotAllowedError"||n==="SecurityError"){
    pushMsg("bot", isNe ?
      "🎤 <b>माइक पहुँच रोकिएको छ।</b><br>कृपया यो साइटको लागि माइक अनुमति दिनुहोस्:<br>① ठेगाना बारको बायाँपट्टिको <b>🔒 लक आइकन</b> थिच्नुहोस्<br>② <b>Microphone → Allow</b> गर्नुहोस्<br>③ पेज रिलोड गरी पुनः गुगल माइक 🎤 थिच्नुहोस्।<br><i>(Windows मा: Settings → Privacy → Microphone ON गर्नुहोस्)</i>" :
      "🎤 <b>Microphone access blocked.</b><br>Please enable microphone for this site:<br>① Click the <b>🔒 lock icon</b> left of your address bar<br>② Set <b>Microphone → Allow</b><br>③ Reload this page and tap 🎤 again.<br><i>(On Windows: ensure Settings → Privacy → Microphone is turned ON)</i>");
  } else if(n==="NotFoundError"||n==="OverconstrainedError"){
    pushMsg("bot", isNe ? "🎤 <b>माइक फेला परेन।</b> विन्डोज साउन्ड सेटिङमा माइक जोड्नुहोस् वा सक्षम गर्नुहोस्, अनि पुनः 🎤 थिच्नुहोस्।" : "🎤 <b>No microphone found.</b> Plug in or enable a microphone in Windows Sound settings, then tap 🎤 again.");
  } else if(n==="NotReadableError"||n==="AbortError"){
    pushMsg("bot", isNe ? "🎤 <b>माइक व्यस्त छ।</b> अर्को एप (Meet, Zoom, वा भ्वाइस रेकर्डर) ले माइक प्रयोग गरिरहेको हुन सक्छ। त्यो एप बन्द गरी पुनः 🎤 थिच्नुहोस्।" : "🎤 <b>Microphone is busy.</b> Another app (Meet, Zoom, or voice recorder) may be holding the mic. Close that app and tap 🎤 again.");
  } else {
    pushMsg("bot", isNe ? "🎤 माइक समस्या ("+n+")। पुनः प्रयास गर्न 🎤 थिच्नुहोस् वा म्यासेज लेख्नुहोस् 🙂" : "🎤 Microphone issue ("+n+"). Tap 🎤 to retry or type your message 🙂");
  }
}

function stopListening(fullStop){
  listening=false;
  if(fullStop) voiceChatActive=false;
  var btn=document.getElementById("prixna-ai-voice");
  if(btn){
    btn.classList.remove("listening");
    btn.setAttribute("title", state.lang==="ne" ? "गुगल भ्वाइस असिस्टेन्ट (बोल्न थिच्नुहोस्)" : "Google Voice Assistant (Tap to speak)");
  }
  if(recog){
    try{ recog.abort(); }catch(e){}
    recog=null;
  }
  vstat("");
}

function startListening(btn){
  btn=btn||document.getElementById("prixna-ai-voice");
  var isNe = state.lang==="ne";
  var SR = window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    voiceChatActive=false;
    pushMsg("bot", isNe ?
      "🎤 भ्वाइस च्याट <b>Google Chrome</b> वा <b>Microsoft Edge</b> मा चल्छ। कृपया टाइप गर्नुहोस् वा Chrome/Edge प्रयोग गर्नुहोस् 🙂" :
      "🎤 Voice chat is supported in <b>Google Chrome</b> and <b>Microsoft Edge</b>. Please type below or switch to Chrome/Edge 🙂");
    return;
  }
  if(window.isSecureContext===false && location.hostname!=="localhost" && location.hostname!=="127.0.0.1"){
    voiceChatActive=false;
    pushMsg("bot", isNe ?
      "🎤 माइकको लागि सुरक्षित जडान (HTTPS वा localhost) चाहिन्छ। कृपया HTTPS मा खोल्नुहोस् 🙂" :
      "🎤 Microphone requires a secure connection (HTTPS or localhost). Please open via HTTPS 🙂");
    return;
  }

  // Cancel any lingering TTS or previous recognition
  try{ if(recog) recog.abort(); }catch(e){}
  recog=null;
  try{ if("speechSynthesis" in window) speechSynthesis.cancel(); }catch(e){}

  try{
    recog=new SR();
  }catch(e){
    voiceChatActive=false;
    vstat("");
    pushMsg("bot", isNe ?
      "🎤 माइक सुरु हुन सकेन। कृपया म्यासेज टाइप गर्नुहोस् 🙂" :
      "🎤 Could not start voice input ("+String(e&&e.message||e)+"). Please type instead 🙂");
    return;
  }

  recog.lang = isNe ? "ne-NP" : "en-US";
  recog.interimResults=true;
  recog.maxAlternatives=1;
  recog.continuous=false;

  vlog("listen-init");
  vstat(isNe ? "🎤 गुगल असिस्टेन्ट: माइक सुरु हुँदैछ…" : "🎤 Google Assistant: Starting mic…");

  recog.onstart=function(){
    vlog("rec-onstart");
    listening=true;
    if(btn){
      btn.classList.add("listening");
      btn.setAttribute("title", isNe ? "सुन्दैछ… रोक्न ट्याप गर्नुहोस्" : "Listening… tap to stop");
    }
    vstat(isNe ? "🎤 Google Assistant: सुन्दैछु… बोल्नुहोस्" : "🎤 Google Assistant: Listening… speak now");
  };

  recog.onresult=function(e){
    try{
      var txt="", fin=false, i;
      for(i=0;i<e.results.length;i++){
        txt+=e.results[i][0].transcript;
        if(e.results[i].isFinal) fin=true;
      }
      txt=txt.trim();
      if(txt && input){
        input.value=txt; // live feedback inside the input box
      }
      if(fin){
        vlog("rec-final:"+txt.slice(0,40));
        vstat("");
        if(txt){
          sendUser(txt);
        } else {
          vstat(isNe ? "आवाज स्पष्ट सुनिएन — माइक नजिक बोल्नुहोस्।" : "Didn't catch that — speak closer to the mic.");
          stopListening(false);
        }
      } else if(txt){
        vstat((isNe ? "🎤 सुन्दैछु: “" : "🎤 Hearing: “")+txt.slice(0,80)+"…”");
      }
    }catch(err){
      vstat("");
    }
  };

  recog.onerror=function(e){
    var code=(e&&e.error)||"unknown";
    vlog("rec-error:"+code);
    listening=false;
    if(btn){
      btn.classList.remove("listening");
      btn.setAttribute("title", isNe ? "गुगल भ्वाइस असिस्टेन्ट" : "Google Voice Assistant");
    }

    if(code==="not-allowed"||code==="service-not-allowed"){
      voiceChatActive=false;
      vstat("");
      micDeniedMsg({name:"NotAllowedError"});
    } else if(code==="audio-capture"){
      voiceChatActive=false;
      vstat("");
      micDeniedMsg({name:"NotFoundError"});
    } else if(code==="no-speech"){
      vstat(isNe ? "कुनै आवाज सुनिएन — बोल्न 🎤 ट्याप गर्नुहोस्।" : "No speech detected — tap 🎤 to talk.");
      voiceChatActive=false;
    } else if(code==="nomatch"){
      vstat(isNe ? "बुझिएन — पुनः प्रयास गर्न 🎤 ट्याप गर्नुहोस् वा लेख्नुहोस् 🙂" : "Didn't catch that — tap 🎤 to retry, or type 🙂");
      voiceChatActive=false;
    } else if(code==="network"){
      voiceChatActive=false;
      vstat("");
      pushMsg("bot", isNe ?
        "🎤 भ्वाइस पहिचानको लागि इन्टरनेट आवश्यक छ। कृपया इन्टरनेट जाँच्नुहोस् 🙂" :
        "🎤 Voice recognition needs an active internet connection. Please check your connection or type 🙂");
    } else if(code!=="aborted"){
      vstat((isNe ? "माइक समस्या (" : "Voice issue (")+code+(isNe ? ") — पुनः प्रयास गर्न 🎤 ट्याप गर्नुहोस्।" : ") — tap 🎤 to retry."));
      voiceChatActive=false;
    } else {
      vstat("");
    }
  };

  recog.onend=function(){
    vlog("rec-onend");
    listening=false;
    if(btn){
      btn.classList.remove("listening");
      btn.setAttribute("title", isNe ? "गुगल भ्वाइस असिस्टेन्ट" : "Google Voice Assistant");
    }
    var el=document.getElementById("prixna-ai-vstat");
    if(el && (el.textContent.indexOf("Listening")>=0 || el.textContent.indexOf("Hearing")>=0 || el.textContent.indexOf("सुन्दैछु")>=0 || el.textContent.indexOf("Starting")>=0)){
      vstat("");
    }
  };

  try{
    recog.start();
    vlog("rec-start-called");
  }catch(e){
    listening=false;
    if(btn) btn.classList.remove("listening");
    vlog("rec-start-throw:"+(e&&e.message));
    if(e && e.name==="InvalidStateError"){
      try{ recog.abort(); }catch(ex){}
      setTimeout(function(){
        try{ recog.start(); }catch(ex){ voiceChatActive=false; }
      }, 200);
    } else {
      voiceChatActive=false;
      pushMsg("bot", isNe ?
        "🎤 माइक सुरु गर्न सकिएन। कृपया ब्राउजरमा माइक अनुमति दिनुहोस्।" :
        "🎤 Could not start mic ("+String(e&&e.message||e)+"). Please allow microphone in browser and tap 🎤.");
    }
  }
}

function toggleVoice(btn){
  vlog("tap");
  if(listening){
    vlog("tap-stop");
    stopListening(true);
    try{ if("speechSynthesis" in window) speechSynthesis.cancel(); }catch(e){}
    return;
  }

  // Tapping mic activates voice chat
  voiceChatActive=true;
  var spk=$("#prixna-ai-speak");
  if(spk) spk.checked=true;

  if(navigator.permissions && navigator.permissions.query){
    navigator.permissions.query({name:"microphone"}).then(function(r){
      if(r.state==="denied"){
        voiceChatActive=false;
        micDeniedMsg({name:"NotAllowedError"});
        return;
      }
      startListening(btn);
    }).catch(function(){
      startListening(btn);
    });
  } else {
    startListening(btn);
  }
}

var neVoiceWarned=false;
function pickVoice(lang, gender){
  try{
    gender = gender || (window.PRIXNA && window.PRIXNA.voiceGender) || C.voiceGender || "female";
    var vs = speechSynthesis.getVoices()||[];
    var i, v=null;
    var isMale = gender === "male";
    var maleRegex = /male|man|david|hemant|guy|george|mark|ravi|ajay/i;
    var femaleRegex = /female|woman|kalpana|zira|jenny|susan|aria|samantha|swara|priya/i;
    var targetRegex = isMale ? maleRegex : femaleRegex;

    // 1. Match requested lang prefix AND matching gender in voice name
    for(i=0;i<vs.length;i++){
      if((vs[i].lang||"").toLowerCase().indexOf(lang)===0 && targetRegex.test(vs[i].name||"")){
        v=vs[i]; break;
      }
    }

    // 2. Match requested lang prefix without strict gender
    if(!v){
      for(i=0;i<vs.length;i++){ if((vs[i].lang||"").toLowerCase().indexOf(lang)===0){ v=vs[i]; break; } }
    }

    // 3. For Nepali: look for voices with "nepal" in name
    if(!v && lang==="ne"){
      for(i=0;i<vs.length;i++){ if(/nepal/i.test(vs[i].name||"")){ v=vs[i]; break; } }
      // Smooth fallback: Hindi (hi) voices matching target gender
      if(!v){
        for(i=0;i<vs.length;i++){
          var vl=(vs[i].lang||"").toLowerCase();
          if((vl.indexOf("hi")===0 || /hindi/i.test(vs[i].name||"")) && targetRegex.test(vs[i].name||"")){
            v=vs[i]; break;
          }
        }
      }
      if(!v){
        for(i=0;i<vs.length;i++){
          var vl=(vs[i].lang||"").toLowerCase();
          if(vl.indexOf("hi")===0 || /hindi/i.test(vs[i].name||"")){ v=vs[i]; break; }
        }
      }
    }

    // 4. For English: match en-us with target gender
    if(!v && lang==="en"){
      for(i=0;i<vs.length;i++){
        if((vs[i].lang||"").toLowerCase()==="en-us" && targetRegex.test(vs[i].name||"")){
          v=vs[i]; break;
        }
      }
      if(!v){
        for(i=0;i<vs.length;i++){ if((vs[i].lang||"").toLowerCase()==="en-us"){ v=vs[i]; break; } }
      }
    }
    return v;
  }catch(e){ return null; }
}
function neVoiceHint(){
  if(neVoiceWarned) return; neVoiceWarned=true;
  pushMsg("bot","ℹ️ <b>Nepali voice note:</b> प्राकृतिक आवाजको लागि Windows <b>Settings → Time & language → Speech → Add voice</b> मा Nepali वा Hindi voice राख्न सक्नुहुन्छ 🙏");
}
function cleanForVoice(h){
  return String(h||"")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[•\-\*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkTextForVoice(clean){
  if(!clean) return [];
  // Split on sentence boundaries: Nepali danda (।), period, question mark, exclamation mark, semicolon
  var rawChunks = clean.split(/(?<=[।\.\?!;\n])\s+/);
  var chunks = [];
  var current = "";

  for(var i=0; i<rawChunks.length; i++){
    var s = rawChunks[i].trim();
    if(!s) continue;
    if((current + " " + s).trim().length <= 160){
      current = (current + " " + s).trim();
    } else {
      if(current) chunks.push(current);
      if(s.length > 180){
        // Split long clauses by comma or pause
        var sub = s.split(/(?<=[,،])\s+/);
        var subCurr = "";
        for(var j=0; j<sub.length; j++){
          var sc = sub[j].trim();
          if((subCurr + " " + sc).trim().length <= 160){
            subCurr = (subCurr + " " + sc).trim();
          } else {
            if(subCurr) chunks.push(subCurr);
            subCurr = sc;
          }
        }
        if(subCurr) chunks.push(subCurr);
        current = "";
      } else {
        current = s;
      }
    }
  }
  if(current) chunks.push(current);
  return chunks;
}

function speak(text, onComplete){
  try{
    if(!("speechSynthesis" in window)){
      if(onComplete) onComplete();
      return;
    }
    if(document.getElementById("prixna-ai-speak") && !document.getElementById("prixna-ai-speak").checked){
      if(onComplete) onComplete();
      return;
    }

    var clean = cleanForVoice(text);
    if(!clean){
      if(onComplete) onComplete();
      return;
    }

    // Cancel any previous speech
    try{ speechSynthesis.cancel(); }catch(e){}

    var chunks = chunkTextForVoice(clean);
    if(!chunks.length){
      if(onComplete) onComplete();
      return;
    }

    var isNe = /[\u0900-\u097F]/.test(clean) || (state.lang==="ne" && isNepali(clean));
    var gender = (window.PRIXNA && window.PRIXNA.voiceGender) || C.voiceGender || "female";
    var customPitch = (window.PRIXNA && typeof window.PRIXNA.voicePitch==="number") ? window.PRIXNA.voicePitch : (typeof C.voicePitch==="number" ? C.voicePitch : (gender==="male"?0.9:1.05));
    var customRate = (window.PRIXNA && typeof window.PRIXNA.voiceRate==="number") ? window.PRIXNA.voiceRate : (typeof C.voiceRate==="number" ? C.voiceRate : 1.0);

    var vv = pickVoice(isNe?"ne":"en", gender);
    if(!vv && isNe) neVoiceHint();

    var chunkIdx = 0;
    var completed = false;

    function finishAll(){
      if(completed) return;
      completed = true;
      vstat("");
      if(onComplete) onComplete();
    }

    function playNextChunk(){
      if(chunkIdx >= chunks.length){
        finishAll();
        return;
      }

      var chunkText = chunks[chunkIdx];
      chunkIdx++;

      var u = new SpeechSynthesisUtterance(chunkText);
      u.lang = isNe ? "ne-NP" : "en-US";
      u.pitch = Math.max(0.5, Math.min(1.6, customPitch));
      u.rate = Math.max(0.7, Math.min(1.4, customRate));
      u.volume = 0.95;

      if(vv){
        u.voice = vv;
        if(isNe && (vv.lang||"").toLowerCase().indexOf("hi")===0) u.lang = vv.lang;
      }

      var chunkDone = false;
      function next(){
        if(chunkDone) return;
        chunkDone = true;
        setTimeout(playNextChunk, 80);
      }

      u.onend = next;
      u.onerror = next;

      // Chrome watchdog: keep audio alive
      setTimeout(function(){
        if(!chunkDone){
          try{ speechSynthesis.resume(); }catch(e){}
        }
      }, 5000);

      if(voiceChatActive) vstat(isNe ? "🔊 Prixna AI बोल्दैछ…" : "🔊 Prixna AI is speaking…");
      speechSynthesis.speak(u);
    }

    playNextChunk();
  }catch(e){
    if(onComplete) onComplete();
  }
}

function buildUI(){
  if($("#prixna-ai-panel")) return;
  var css=document.createElement("link"); css.rel="stylesheet"; css.href="css/prixna-ai.css?v=20261012n"; document.head.appendChild(css);
  fab=document.createElement("button"); fab.id="prixna-ai-fab";
  fab.innerHTML="<span class='prixna-ai-avatar'>🤖</span><span class='lbl'>Chat with Prixna AI</span><span class='prixna-ai-dot'></span><span class='prixna-ai-badge' id='prixna-ai-badge'>1</span>";
  fab.setAttribute("aria-label","Open Prixna AI support chat");
  panel=document.createElement("div"); panel.id="prixna-ai-panel"; panel.setAttribute("role","dialog"); panel.setAttribute("aria-label","Prixna AI support center");
  panel.innerHTML=
    "<div class='prixna-ai-head'><div class='ph-av'>🤖</div><div><b>Prixna AI · Support Center</b><small><i></i><span id='prixna-ai-status'>Online — replies instantly</span></small></div>"+
    "<div class='ph-x'><button id='prixna-ai-clear' title='Clear chat / नयाँ च्याट' aria-label='Clear chat'>🧹</button><button id='prixna-ai-ne' title='Nepali / English'>ने/EN</button><button id='prixna-ai-close' aria-label='Close'>✕</button></div></div>"+
    "<div class='prixna-ai-actions'><a href='"+PHONE_HREF+"' data-track='ai_call'>📞 Call now</a>"+
    "<a id='prixna-ai-wa' href='"+waLink("Hello Prixna IT Solution! I need help.")+"' target='_blank' rel='noopener' data-track='ai_whatsapp'>💬 WhatsApp</a>"+
    "<button id='prixna-ai-book' type='button'>📅 Book</button><button id='prixna-ai-human' type='button'>🧑‍💼 Human</button></div>"+
    "<div id='prixna-ai-msgs'></div><div class='prixna-ai-quick' id='prixna-ai-quick'></div>"+
    "<div id='prixna-ai-vstat' style='display:none'></div>"+
    "<form id='prixna-ai-form'><input id='prixna-ai-input' placeholder='Type: billing software, CCTV price, laptop repair…' autocomplete='off' aria-label='Message Prixna AI'>"+
    "<button type='button' class='voice' id='prixna-ai-voice' title='Google Voice Assistant' aria-label='Google Voice Assistant'><svg class='google-mic-svg' viewBox='0 0 24 24' width='22' height='22' aria-hidden='true'><path fill='#4285F4' d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z'/><path fill='#34A853' d='M11 18.92h2V22h-2z'/><path fill='#FBBC05' d='M7 11H5c0 3.53 2.61 6.43 6 6.92v-2.04C8.66 15.42 7 13.42 7 11z'/><path fill='#EA4335' d='M19 11c0 2.42-1.66 4.42-4 4.88v2.04c3.39-.49 6-3.39 6-6.92h-2z'/></svg><span class='google-dots' aria-hidden='true'><span class='g-dot g-blue'></span><span class='g-dot g-red'></span><span class='g-dot g-yellow'></span><span class='g-dot g-green'></span></span></button><button type='submit' title='Send'>➤</button></form>"+
    "<div class='prixna-ai-note'><label style='cursor:pointer'><input type='checkbox' id='prixna-ai-speak' style='vertical-align:middle'> 🔊 voice reply</label> · Sun–Fri 9:30–6:30 · <a href='"+PHONE_HREF+"'>"+esc(PHONE_DISP)+"</a></div>";
  document.body.appendChild(panel); document.body.appendChild(fab);
  msgsEl=$("#prixna-ai-msgs"); quickEl=$("#prixna-ai-quick"); input=$("#prixna-ai-input"); badge=$("#prixna-ai-badge");
  // restore
  history.forEach(function(m){ renderMsg(m.who,m.html); });
  setQuick(defaultQuick());
  function open(){ panel.classList.add("open"); badge.style.display="none"; saveJSON(LS_SEEN,{seen:Date.now()});
    if(!greeted && !history.length){ greeted=true; pushMsg("bot", answerFor("greet","hello")); }
    setTimeout(function(){ input.focus(); },100); log("ai_open",location.pathname); }
  function close(){
    panel.classList.remove("open");
    stopListening(true);
    try{ if("speechSynthesis" in window) speechSynthesis.cancel(); }catch(e){}
  }
  fab.onclick=function(){ panel.classList.contains("open")?close():open(); };
  $("#prixna-ai-close").onclick=close;
  var clrBtn = $("#prixna-ai-clear");
  if(clrBtn){
    clrBtn.onclick = function(){
      var isNe = state.lang==="ne";
      var confirmed = confirm(isNe ? "के तपाईं च्याट इतिहास मेटाउन निश्चित हुनुहुन्छ?" : "Clear all chat history?");
      if(confirmed) clearChat();
    };
  }
  $("#prixna-ai-book").onclick=function(){ open(); sendUser("book"); };
  $("#prixna-ai-human").onclick=function(){ open(); sendUser("human support please"); };
  $("#prixna-ai-ne").onclick=function(){
    state.lang = state.lang==="ne"?"en":"ne";
    try{ localStorage.setItem(LS_LANG, state.lang); }catch(e){}
    var isNe = state.lang==="ne";
    input.placeholder = isNe ? "सोध्नुहोस्: बिलिङ सफ्टवेयर, CCTV मूल्य, मर्मत…" : "Type: billing software, CCTV price, laptop repair…";
    setQuick(defaultQuick());
    var switchMsg = isNe ? "म अब नेपालीमा जवाफ दिन्छु 🙏 भन्नुस्, के सहयोग गरूँ?" : "I'll reply in English now 🙏 How can I help you?";
    pushMsg("bot", switchMsg);
    speak(switchMsg);
    if(listening){ startListening($("#prixna-ai-voice")); }
  };
  $("#prixna-ai-form").addEventListener("submit",function(e){
    e.preventDefault();
    if(listening){ stopListening(false); }
    sendUser(input.value);
  });
  $("#prixna-ai-voice").onclick=function(){ toggleVoice(this); };
  try{ $("#prixna-ai-status").textContent = isOpen()?"Online — replies instantly":"Away (closed) — leaves callback"; }catch(e){}
  // proactive nudge once per session
  setTimeout(function(){
    if(!panel.classList.contains("open") && !loadJSON(LS_SEEN,null)){
      badge.style.display="grid"; badge.textContent="1";
      log("ai_nudge","shown");
    }
  },12000);
}

document.addEventListener("DOMContentLoaded", buildUI);
// Late injection (e.g. Next.js): DOMContentLoaded already fired → boot now.
if (document.readyState === "interactive" || document.readyState === "complete") {
  if (document.body) buildUI();
  else document.addEventListener("DOMContentLoaded", buildUI);
}

/* public API for backend / staff tooling */
window.PRIXNA_AI = {
  open:function(){ buildUI(); $("#prixna-ai-panel").classList.add("open"); },
  ask:function(t){ buildUI(); sendUser(t); },
  clearHistory:function(){ clearChat(); },
  tickets:function(){ return loadJSON(LS_TICKETS,[]); },
  bookings:function(){ return loadJSON(LS_BOOKINGS,[]); },
  escalate:function(reason){ pushMsg("bot", handoff(reason||"manual", "staff escalation")); },
  _internal:{
    getState:function(){ return state; },
    resetState:function(lang){ state.mode="idle"; state.step=0; state.data={}; state.confirmCancel=false; if(lang) state.lang=lang; },
    handleFlow:handleFlow,
    answerFor:answerFor,
    getContextualAnswer:getContextualAnswer
  }
};
})();
