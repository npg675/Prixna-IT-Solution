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
    fetch("/data/ai-catalog.json?_t=" + Date.now())
      .then(function(r){ return r.ok ? r.json() : null; })
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
  if(!excelCatalog || !excelCatalog.items || !excelCatalog.items.length) return [];
  var clean = (query || "").toLowerCase()
    .replace(/[^\w\u0900-\u097F\s]/g, " ")
    .split(/\s+/)
    .filter(function(w){
      return w.length > 1 && !/^(the|and|for|with|price|cost|rate|kati|parcha|ko|cha|ma|chahiyo|hajur|nepali|aaja|chha|ho|ke|k|euta|dinus)$/i.test(w);
    });
  if(!clean.length) return [];

  var matches = [];
  excelCatalog.items.forEach(function(it){
    var name = (it.name || "").toLowerCase();
    var cat = (it.category || "").toLowerCase();
    var specs = (it.specs || "").toLowerCase();
    var score = 0;
    clean.forEach(function(w){
      if(name.indexOf(w) > -1) score += 6;
      else if(cat.indexOf(w) > -1) score += 3;
      else if(specs.indexOf(w) > -1) score += 1;
    });
    if(score > 0){
      matches.push({ item: it, score: score });
    }
  });

  matches.sort(function(a, b){ return b.score - a.score; });
  return matches.slice(0, 3).map(function(m){ return m.item; });
}

function formatExcelResults(items, ne){
  if(!items || !items.length) return null;
  if(ne){
    var listNe = items.map(function(it){
      var l = "• <b>" + esc(it.name) + "</b>: 💰 <b>" + esc(it.price) + "</b>";
      if(it.stock) l += " | 📦 " + esc(it.stock);
      if(it.warranty) l += " | 🛡️ " + esc(it.warranty);
      if(it.specs) l += "\n  <small style='opacity:0.85;'>" + esc(it.specs) + "</small>";
      return l;
    }).join("\n");
    return "📊 <b>हाम्रो लाइभ मूल्य सूची (अपडेट गरिएको Excel क्याटलग अनुसार):</b>\n" + listNe + "\n\nथप विवरण वा अर्डरका लागि सिधै कल गर्नुहोस्: <a href='" + PHONE_HREF + "'>📞 " + esc(PHONE_DISP) + "</a> वा <b>book</b> लेख्नुहोस्।";
  } else {
    var listEn = items.map(function(it){
      var l = "• <b>" + esc(it.name) + "</b>: 💰 <b>" + esc(it.price) + "</b>";
      if(it.stock) l += " | 📦 Stock: " + esc(it.stock);
      if(it.warranty) l += " | 🛡️ " + esc(it.warranty);
      if(it.specs) l += "\n  <small style='opacity:0.85;'>" + esc(it.specs) + "</small>";
      return l;
    }).join("\n");
    return "📊 <b>Live Pricing from our Business Excel Catalog:</b>\n" + listEn + "\n\nNeed immediate order or booking? Call us: <a href='" + PHONE_HREF + "'>📞 " + esc(PHONE_DISP) + "</a> or reply <b>book</b>.";
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
  if(has("book","schedule","appointment","visit","site visit","installation book","amc","booking","समय","अपोइन्ट","समय मिलाउन")) return "booking";
  if(has("callback","call back","phone garnu","phone garnus","फोन","फर्क","फोन गर")) return "callback";
  if(has("price","rate","cost","kati","kati par","quotation","quote","मूल्य","पैसा","कति","दाम","शुल्क")) return "price";
  if(has("cctv","camera","dvr","सिसि","क्यामरा")) return "cctv";
  if(has("biometric","attendance","hajiri","e-hajiri","ehajiri","leave","payroll","हाजिरी","हाजिर")) return "attendance";
  if(has("laptop","computer","desktop","printer","scanner","mouse","ups","router","माउस","ल्यापटप","कम्प्युटर","प्रिन्टर")) return "hardware";
  if(has("wifi","network","lan","server","internet","वाईफाई","नेट","इन्टरनेट")) return "network";
  if(has("erp","billing","inventory","stock","crm","software","website","app","jigri","saas","accounting","restaurant","kot","बिलिङ","सफ्टवेयर","बिल")) return "software";
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
  try { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("ticket", t); } catch (e) {}
  return t;
}
function saveBooking(o){
  var arr=loadJSON(LS_BOOKINGS,[]);
  var b={id:uid("B-"),createdAt:new Date().toISOString(),name:o.name||"",phone:o.phone||"",email:o.email||"",
    service:o.service||"",day:o.day||"",time:o.time||"",location:o.location||"",status:"confirmed"};
  arr.unshift(b); saveJSON(LS_BOOKINGS,arr);
  try { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("booking", b); } catch (e) {}
  return b;
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
var LINKS = { shop:"shop.html", quote:"quote.html", repair:"repair-maintenance.html", contact:"contact.html", jigri:"https://jigritools.com/" };

function getContextualAnswer(text, ne){
  var t = (text || "").toLowerCase();
  var has = function(){ return matchAny(t, Array.prototype.slice.call(arguments)); };

  // 1. Identity & Name ("Who are you?" / "What is your name?" / "तपाईंको नाम के हो?")
  if(has("what is your name", "whats your name", "what's your name", "who are you", "who r u", "tapaiko naam", "tapai ko naam", "naam k ho", "naam ke ho", "tapai ko ho", "tapai ko hunuhunchha", "tapai ko hununcha", "तपाईंको नाम", "तपाईं को हो", "तपाईं को हुनुहुन्छ", "नाम के हो")){
    return ne
      ? "नमस्ते हजुर! 🙏 म <b>Prixna AI</b> हुँ — प्रिक्सना आईटी सोलुसन (कोटेश्वर, काठमाडौं) को स्मार्ट डिजिटल साथी।\nम तपाईंसँग साथी जस्तै कुराकानी गर्न सक्छु, प्रविधि सम्बन्धी सही सल्लाह दिन सक्छु, र आवश्यक पर्दा हाम्रा सिनियर प्राविधिकहरूसँग जोड्न पनि सक्छु।\n\nआरामै हुनुहुन्छ नि हजुर? आज म तपाईंलाई के मा सहयोग गर्न सक्छु?"
      : "Hello there! 🙏 I'm <b>Prixna AI</b> — your friendly digital assistant from Prixna IT Solution (Koteshwor, Kathmandu).\nThink of me as your helpful tech companion: you can chat with me, ask anything about computers, CCTV, or software, or just have a friendly conversation! How are you doing today?";
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
      ? "⚡ <b>ल्यापटप तथा कम्प्युटर स्पिड अपग्रेड (SSD + RAM):</b>\n• <b>SSD अपग्रेड:</b> १२८GB, २५६GB, ५१२GB, १TB (NVMe M.2 / SATA SSD) — ३ गुणा बढी कम्प्युटर स्पिड!\n• <b>सुरक्षित डेटा क्लोनिङ:</b> पुरानो HDD को कुनै पनि फाइल, विन्डोज वा सफ्टवेयर नहराईकन नयाँ SSD मा सारिन्छ।\n• <b>RAM अपग्रेड:</b> DDR3 / DDR4 / DDR5 (8GB, 16GB, 32GB) तुरुन्तै थप्न सकिन्छ।\n• <b>समय:</b> कोटेश्वर शाखामा १ घण्टामै तुरुन्त एक्सप्रेस सर्भिस उपलब्ध छ।\n\nतपाईंको ल्यापटप कुन ब्रान्ड र मोडल हो? म ठ्याक्कै लाग्ने अपग्रेड र बेस्ट रेट भनिदिन्छु। 👉 <a href='repair-maintenance.html'>मर्मत सेवा</a>"
      : "⚡ <b>Laptop & Computer Speed Upgrade (SSD & RAM):</b>\n• <b>SSD Upgrade:</b> 128GB, 256GB, 512GB, 1TB NVMe / SATA SSD — 3x faster boot & app launch.\n• <b>100% Data Clone:</b> All existing Windows files and installed software preserved from old HDD.\n• <b>RAM Upgrade:</b> DDR3, DDR4, and DDR5 (8GB, 16GB, 32GB) in stock.\n• <b>Turnaround:</b> 1-hour express service at our Koteshwor branch.\n\nTell me your laptop model, and I will recommend the exact compatible upgrade and pricing. 👉 <a href='repair-maintenance.html'>Repair Services</a>";
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
      ? "🎥 <b>CCTV क्यामेरा पूर्ण प्याकेज (Hikvision / Dahua):</b>\n• <b>४ क्यामेरा कम्प्लिट सेट:</b> २ इन्डोर डोम + २ आउटडोर बुलेट (Night Vision HD/IP)।\n• <b>DVR/NVR:</b> ४-च्यानल स्मार्ट रेकर्डर + १TB सर्भिलेन्स हार्ड डिस्क (१५–२० दिन रेकर्डिङ)।\n• <b>सामग्री:</b> पावर सप्लाई, क्यामरा केबल, कनेक्टर र प्रोफेसनल वायरिङ जडान।\n• <b>मोबाइल एप:</b> मोबाइलमा निःशुल्क लाइभ हेर्ने र आवाज सुन्ने सुविधा।\n• <b>साइट भिजिट:</b> काठमाडौं उपत्यकामा निःशुल्क साइट भिजिट गरी यकिन कोटेसन दिइन्छ।\n👉 <a href='cctv-security.html'>CCTV विवरण</a> | कल गर्नुहोस्: <a href='tel:+9779813714582'>📞 ९८१३७१४५८२</a>"
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

    if(has("price", "rate", "cost", "kati", "kati par", "parcha", "parchha", "मूल्य", "कति", "दाम", "कति पर्छ", "कति पर्ला", "stock", "stok", "available", "upalabdha", "उपलब्ध", "specs", "विवरण", "warranty", "वारेन्टी", "dell", "hp", "lenovo", "cctv", "camera", "ssd", "ram", "router", "pos", "erp", "biometric", "attendance")){
      return formatExcelResults(catalogMatches, ne);
    }
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
    case "software":
      return ne
        ? "💼 <b>हाम्रो सफ्टवेयर सोलुसन:</b>\n• Jigri ERP: पसल, होलसेल र मार्टका लागि भ्याट/नन-भ्याट बिलिङ + स्टक\n• रेस्टुरेन्ट POS: टेबल म्यानेजमेन्ट, KOT र बिलिङ\n• स्कुल तथा कलेज व्यवस्थापन प्रणाली\n• JigriTools: ३०+ निःशुल्क नेपाली अनलाइन टुलहरू (मिति, कर, Unicode)\n\nतपाईंको व्यवसाय कस्तो हो र के सुविधा चाहिएको हो? म उपयुक्त सिस्टम र निःशुल्क डेमो मिलाइदिन्छु।\n👉 <a href='"+LINKS.quote+"?service=Business%20Software%20/%20SaaS%20Demo'>निःशुल्क डेमो माग्नुहोस्</a>"
        : "💼 <b>Software we do:</b>\n"+esc(productKB().split("\n").slice(0,7).join("\n"))+"\n\nTell me your business type (shop/restaurant/school/office?) and need (billing/stock/attendance/website?) — I'll recommend the right setup + free demo.\n👉 <a href='"+LINKS.quote+"?service=Business%20Software%20/%20SaaS%20Demo'>Request free demo</a>";
    case "cctv":
      return ne
        ? "🎥 <b>CCTV क्यामेरा तथा सेक्युरिटी:</b> क्यामेरा + DVR/NVR र प्रोफेसनल जडान सेवा।\n• पसल, घर वा अफिसका लागि २/४/८ क्यामेरा सेटअप\n• साइट भिजिट निःशुल्क → यकिन कोटेसन\n• १ वर्ष वारेन्टी र तुरुन्त मर्मत सपोर्ट\n\nकतिवटा क्यामेरा र कुन ठाउँमा चाहिएको हो? (जस्तै: <i>'४ क्यामेरा, कोटेश्वर पसल'</i>) भन्नुस्, म तुरुन्त बुकिङ मिलाइदिन्छु। 👉 <a href='cctv-security.html'>CCTV प्याकेजहरू हेर्नुहोस्</a>"
        : "🎥 <b>CCTV & Security:</b> Cameras + DVR + professional installation across Kathmandu Valley.\n• Shop/office ke lagi 2/4/8-camera plan\n• Free site visit → exact quotation\n• Installation support included\n\nHow many rooms/floors to cover? And location? Reply e.g. <i>'4 camera, Koteshwor pasal'</i> — I'll start your booking. 👉 <a href='cctv-security.html'>Installation plans</a>";
    case "attendance":
      return ne
        ? "👆 <b>बायोमेट्रिक डिभाइस + जिग्री ई-हाजिरी:</b>\nफिंगरप्रिन्ट/फेस रिड गर्ने डिभाइस र मोबाइल एपबाट डिजिटल हाजिरी, बिदा र पेरोल व्यवस्थापन।\n• डिभाइस जडान र सफ्टवेयर सेटअप\n• स्टाफलाई पूर्ण तालिम समावेश\n\nतपाईंको संस्थामा कतिजना कर्मचारी हुनुहुन्छ? (जस्तै: <i>'२५ जना, स्कुल, ललितपुर'</i>) 👉 <a href='biometric-access.html'>डिभाइस विवरण</a>"
        : "👆 <b>Biometric + Jigri eHajiri:</b> Fingerprint device with setup + digital attendance/leave, staff training included. Works together — device we install, software we configure.\n\nHow many staff? Reply e.g. <i>'25 staff, school, Lalitpur'</i> 👉 <a href='biometric-access.html'>Device options</a> | <a href='"+LINKS.quote+"?service=Attendance%20%26%20Payroll'>Early access</a>";
    case "hardware":
      return ne
        ? "🖥️ <b>कम्प्युटर, ल्यापटप तथा एक्सेसरिज:</b>\n• ब्रान्डेड र एसेम्बल्ड डेस्कटप, ल्यापटप (Dell, HP, Lenovo, Acer)\n• प्रिन्टर, राउटर, युपिएस (UPS), केबल तथा नेटवर्क उपकरण\n• ५+ थान सामान खरिदमा होलसेल छुट\n\nतपाईंलाई कुन सामान र कति थान चाहिएको हो? म तुरुन्त स्टक र बेस्ट रेट दिन्छु। 👉 <a href='shop.html'>लाइभ क्याटलग</a> · ५+ पिसका लागि: <a href='bulk-quote.html'>📦 होलसेल कोटेसन</a>"
        : "🖥️ <b>Computers & accessories — genuine, installed properly:</b>\n"+esc(productKB().split("\n").filter(function(l){return l.indexOf("In-stock")>-1;}).join("\n")||"Laptops, desktops, printers, routers, UPS in stock.")+"\n\nWhat do you need — laptop for office, printer, router/UPS? Tell quantity + use, I'll check best option. 👉 <a href='shop.html'>Live catalog</a> · Buying 5+ pcs? <a href='bulk-quote.html'>📦 Bulk pricing</a>";
    case "network":
      return ne
        ? "🌐 <b>नेटवर्किङ तथा सर्भर सेटअप:</b>\nअफिस वाईफाई, LAN केबलिङ, राउटर कन्फिगरेसन र सर्भर व्यवस्थापन।\nतपाईंको अफिस कति तल्लाको छ र कतिवटा डिभाइस छन्? (जस्तै: <i>'३ तल्ला, २० जना कर्मचारी, बानेश्वर'</i>) भन्नुस्, हाम्रो टिमले साइट भिजिट गरेर सेटअप मिलाउनेछ। 👉 <a href='networking-servers.html'>नेटवर्क सोलुसन हेर्नुहोस्</a>"
        : "🌐 <b>Networking & Servers:</b> Office Wi-Fi, LAN cabling, server setup — done right first time.\nTell me office size + floors + devices count (e.g. <i>'3 floor, 20 staff, Baneshwor'</i>) and I'll plan + book a site visit. 👉 <a href='networking-servers.html'>Network solutions</a>";
    case "marketing":
      return ne
        ? "🚀 <b>डिजिटल मार्केटिङ तथा AI अटोमेसन:</b>\nग्राफिक डिजाइन, फेसबुक/इन्स्टाग्राम विज्ञापन, ह्वाट्सएप अटो-रिप्लाई, र ग्राहक फलो-अप अटोमेसन।\nतपाईंको मुख्य लक्ष्य के हो — धेरै ग्राहक ल्याउने, अनलाइन अर्डर बढाउने, वा अटोमेटिक च्याट राख्ने? 👉 <a href='digital-marketing-ai.html'>प्याकेजहरू हेर्नुहोस्</a>"
        : "🚀 <b>Digital Marketing + AI Automation:</b> Practical marketing that brings enquiries — listings, content, WhatsApp auto-reply, lead follow-up automation.\nWhat is your goal — more walk-ins, more online orders, or automatic follow-up? 👉 <a href='digital-marketing-ai.html'>See plans</a>";
    case "price":
      var excelMatches = searchExcelProducts(text);
      if(excelMatches && excelMatches.length){
        return formatExcelResults(excelMatches, ne);
      }
      if(excelCatalog && excelCatalog.items && excelCatalog.items.length){
        return formatExcelResults(excelCatalog.items.slice(0, 4), ne);
      }
      return ne
        ? "💰 <b>दररेट तथा कोटेसन:</b>\nसामानको यकिन मूल्य मोडल, ब्रान्ड र स्टक अनुसार निर्धारण हुन्छ। १ मिनेटमै दररेट पाउन:\n१. सामानको नाम र परिमाण भन्नुहोस् (जस्तै: <i>'TP-Link राउटर २ वटा'</i> वा <i>'CCTV ४ क्यामेरा'</i>)\n२. हामी तुरुन्त बेस्ट कोटेसन तयार गर्छौं\n३. हाम्रो टिमले फोन वा ह्वाट्सएपमा दररेट पक्का गरिदिनेछ\n\n👉 <a href='shop.html'>लाइभ मूल्य हेर्नुहोस्</a> | <a href='"+LINKS.quote+"'>कोटेसन माग्नुहोस्</a>"
        : "💰 Exact price depends on model + stock (changes weekly). I never guess — here's how to get it in 1 min:\n1. Tell product name/qty (e.g. <i>'TP-Link router 2 pcs'</i>)\n2. I'll check our live list + create a quotation request\n3. Team confirms on call/WhatsApp\n\n👉 <a href='shop.html'>Browse live pricing</a> | <a href='"+LINKS.quote+"'>Get quote</a>\n\nWhat item + quantity do you need?";
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
        ? "धेरै धन्यवाद! 🙏 हाम्रो सेवा कस्तो लाग्यो? <a href='feedback.html'>⭐ यहाँ रेटिङ दिनुहोस्</a> — राम्रो लाग्यो भने गुगल रिभ्यु पनि दिनुहोला!<br>अरु केही सहयोग चाहिन्छ? <a href='"+PHONE_HREF+"'>"+esc(PHONE_DISP)+"</a>."
        : "You're most welcome! 🙏 How was our service? <a href='feedback.html'>⭐ Rate us here</a> — loved it? A Google review helps our small team a lot!<br>Anything else — software, CCTV, repair, booking? <a href='"+PHONE_HREF+"'>"+esc(PHONE_DISP)+"</a>.";
    case "feedback":
      return ne
        ? "धन्यवाद 🙏 <a href='feedback.html'><b>⭐ १० सेकेन्डमा रेटिङ दिनुहोस्</b></a> — तपाईंको सल्लाहले हाम्रो सेवा अझ राम्रो बनाउन मद्दत पुग्छ।"
        : "Thank you 🙏 <a href='feedback.html'><b>⭐ Rate your visit (10 sec)</b></a> — 4–5 star aayo bhane Google review ko link pani painchha. Low score? Supervisor ticket auto-banchha, no public ask.";
    case "support":
      state.mode="ticket"; state.step=1; state.data={issue:text};
      return ne
        ? "🛠️ असुविधाका लागि क्षमाप्रार्थी छौं — तुरुन्त समाधान गरौं।\n<b>चरण १/३:</b> कुन डिभाइस वा सफ्टवेयरमा समस्या आएको हो? (जस्तै: ल्यापटप / बिलिङ सफ्टवेयर / CCTV / प्रिन्टर)\n\nतत्काल प्रयास गर्न सक्ने उपाय:\n१. डिभाइस र राउटर पुनः सुरु (Restart) गर्नुहोस्\n२. पावर र केबल चेक गर्नुहोस्\nकाम रोकिएको छ भने <b>urgent</b> लेख्नुहोस् — म तत्काल वरिष्ठ प्राविधिकलाई खबर गर्छु। 🚨"
        : "🛠️ Sorry for the trouble — let's fix it fast.\n<b>Step 1/3:</b> What device/software has the problem? (e.g. laptop / billing software / CCTV / printer)\n\nQuick first-aid you can try now:\n1. Restart device + router\n2. Check power/cables\n3. Update the app\nIf business is stopped, type <b>urgent</b> — I'll escalate immediately. 🚨";
    case "booking":
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
        ? "📦 <b>होलसेल तथा डिलर दररेट:</b>\n<b>चरण १/३:</b> तपाईंको संस्था वा पसलको नाम के हो? (जस्तै: <i>'शर्मा ट्रेडर्स, काठमाडौं'</i>)\n\nपूरा फाराम भर्न चाहनुहुन्छ? 👉 <a href='bulk-quote.html'>होलसेल कोटेसन फाराम</a>"
        : "📦 <b>Bulk & dealer pricing</b> — one itemised NPR quotation.\n<b>Step 1/3:</b> Business / org name + type? (e.g. <i>'Sharma Traders, retail shop'</i>)\n\nPrefer the full form? 👉 <a href='bulk-quote.html'>bulk-quote.html</a>";
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
function handleFlow(text){
  var d = state.data;
  var ne = state.lang==="ne" || isNepali(text);
  if(state.mode==="booking"){
    // Step 1: Customer Name
    if(state.step===1){
      d.name=text.trim();
      if(d.name.length<2) return ne ? "कृपया आफ्नो पूरा नाम लेख्नुहोस् 🙂" : "Please share your full name 🙂";
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
      var emailAck = d.email ? (ne ? "✉️ इमेल <b>"+esc(d.email)+"</b> सुरक्षित गरियो!\n\n" : "✉️ Email <b>"+esc(d.email)+"</b> recorded!\n\n") : "";

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
        ? "✅ <b>बुकिङ सुरक्षित भयो!</b> ID <b>"+esc(b.id)+"</b>\n👤 <b>नाम:</b> "+esc(d.name)+"\n📞 <b>सम्पर्क:</b> "+esc(d.phone)+(d.email?"\n✉️ <b>इमेल:</b> "+esc(d.email):"")+"\n💼 <b>सेवा/सामान:</b> "+esc(d.service)+"\n🕒 <b>समय/ठेगाना:</b> "+esc(m)+"\n\nहाम्रो टिमले <b>"+esc(d.phone)+"</b> मा सम्पर्क गरी "+(d.email?"<b>"+esc(d.email)+"</b> मा विस्तृत विवरण तथा बिल पठाउनेछ।":"थप विवरण गराउनेछ।")+"\n\n👉 <a href='"+wa+"' target='_blank' rel='noopener'>💬 ह्वाट्सएपमा पक्का गर्नुहोस्</a> · <a href='"+PHONE_HREF+"'>📞 "+esc(PHONE_DISP)+"</a>"+calHtml+"<br>👉 <a href='feedback.html?ref="+esc(b.id)+"'>⭐ भिजिटपछि यहाँ रेटिङ दिनुहोस्</a>\nReference: "+esc(lead.id)
        : "✅ <b>Booking Confirmed!</b> ID <b>"+esc(b.id)+"</b>\n👤 <b>Name:</b> "+esc(d.name)+"\n📞 <b>Contact:</b> "+esc(d.phone)+(d.email?"\n✉️ <b>Email:</b> "+esc(d.email):"")+"\n💼 <b>Item/Service:</b> "+esc(d.service)+"\n🕒 <b>Slot/Location:</b> "+esc(m)+"\n\nOur team will contact <b>"+esc(d.phone)+"</b>"+(d.email?" and email details & invoice to <b>"+esc(d.email)+"</b>.":" to confirm.")+"\n\n👉 <a href='"+wa+"' target='_blank' rel='noopener'>💬 Confirm on WhatsApp</a> · <a href='"+PHONE_HREF+"'>📞 "+esc(PHONE_DISP)+"</a>"+calHtml+"<br>👉 <a href='feedback.html?ref="+esc(b.id)+"'>⭐ After your visit, rate us</a>\nReference: "+esc(lead.id);
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
      try{ if(window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("bulk",lb); }catch(e){}
      state.mode="idle"; state.step=0; state.data={};
      log("ai_bulk",lb.id);
      var wab=waLink("Hello Prixna! Bulk enquiry "+lb.id+" — "+nm+" ("+phb+") ["+d.biz+"] List: "+d.items.slice(0,250));
      return ne
        ? "📦 <b>होलसेल अनुरोध दर्ता भयो!</b> ID <b>"+esc(lb.id)+"</b>\n🏢 "+esc(d.biz)+"\n📋 "+esc(d.items)+"\nहाम्रो टिमले आइत–शुक्र विस्तृत NPR कोटेसन पठाउनेछ।\n\n👉 <a href='"+wab+"' target='_blank' rel='noopener'>💬 ह्वाट्सएपमा पठाउनुहोस्</a> · <a href='bulk-quote.html'>पूरा फाराम हेर्नुहोस्</a>"
        : "📦 <b>Bulk request received!</b> ID <b>"+esc(lb.id)+"</b>\n🏢 "+esc(d.biz)+"\n📋 "+esc(d.items)+"\nTeam replies Sun–Fri with one itemised NPR quotation.\n\n👉 <a href='"+wab+"' target='_blank' rel='noopener'>💬 Send list on WhatsApp</a> · <a href='bulk-quote.html'>Full bulk form</a>";
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
function showTyping(){ var t=document.createElement("div"); t.className="prixna-ai-typing"; t.id="prixna-ai-typing"; t.textContent="Prixna AI is typing…"; msgsEl.appendChild(t); msgsEl.scrollTop=msgsEl.scrollHeight; }
function hideTyping(){ var t=$("#prixna-ai-typing"); if(t) t.remove(); }
function setQuick(list){
  quickEl.innerHTML="";
  list.forEach(function(q){ var b=document.createElement("button"); b.type="button"; b.textContent=q; b.onclick=function(){ sendUser(q); }; quickEl.appendChild(b); });
}
function defaultQuick(){
  if(state.lang === "ne"){
    return ["💼 सफ्टवेयर","🎥 CCTV","🖥️ ल्यापटप","🛠️ मर्मत","📅 भिजिट बुक","📞 प्रतिनिधि"];
  }
  return ["💼 Software","🎥 CCTV","🖥️ Laptop","🛠️ Repair","📅 Book visit","📞 Human"];
}

function botReply(userText){
  showTyping();
  var flow = handleFlow(userText);
  if(flow){ setTimeout(function(){ hideTyping(); pushMsg("bot",flow); speak(stripTags(flow)); setQuick(defaultQuick()); },600); return; }
  var ne = isNepali(userText) || state.lang==="ne";
  var contextual = getContextualAnswer(userText, ne);
  var intent = detectIntent(userText);
  // frustration / repeat → escalate smartly
  if(/bakwas|stupid|useless|idiot|complaint/i.test(userText)){ intent="human"; }
  var local = contextual || ((intent==="human") ? handoff("escalation trigger", userText) : answerFor(intent, userText));
  var convo = history.slice(-10).map(function(m){return {role:m.who==="bot"?"assistant":"user",content:stripTags(m.html)};});
  convo.push({role:"user",content:userText});
  backendReply(convo, function(bReply){
    setTimeout(function(){
      hideTyping();
      pushMsg("bot", bReply || local);
      speak(stripTags(bReply || local), function(){
        if(voiceChatActive && panel && panel.classList.contains("open")){
          var vBtn = $("#prixna-ai-voice");
          setTimeout(function(){
            if(voiceChatActive && panel && panel.classList.contains("open")){
              startListening(vBtn);
            }
          }, 600);
        }
      });
      if(intent==="general"||intent==="greet") setQuick(defaultQuick());
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
    "<div class='ph-x'><button id='prixna-ai-ne' title='Nepali / English'>ने/EN</button><button id='prixna-ai-close' aria-label='Close'>✕</button></div></div>"+
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
  tickets:function(){ return loadJSON(LS_TICKETS,[]); },
  bookings:function(){ return loadJSON(LS_BOOKINGS,[]); },
  escalate:function(reason){ pushMsg("bot", handoff(reason||"manual", "staff escalation")); },
  _internal:{
    getState:function(){ return state; },
    resetState:function(lang){ state.mode="idle"; state.step=0; state.data={}; if(lang) state.lang=lang; },
    handleFlow:handleFlow,
    answerFor:answerFor,
    getContextualAnswer:getContextualAnswer
  }
};
})();
