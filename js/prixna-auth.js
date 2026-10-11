/* Prixna Staff Gate — honest front-door PIN for admin/quote pages (local-first).
   Auto-locks any page whose <html> tag has data-staff="1".
   NOTE: front-end PIN is a deterrent against curious customers, not bank security.
   For real secrecy, put admin behind server auth. Salted djb2 hash, sync + testable. */
(function () {
"use strict";
var LS_HASH = "prixna_staff_hash_v1";
var SES_KEY = "prixna_staff_ok_v1";
function store(){ try { return localStorage; } catch (e) { return { getItem: function(){return null;}, setItem: function(){}, removeItem: function(){} }; } }
function ses(){ try { return sessionStorage; } catch (e) { return { getItem: function(){return null;}, setItem: function(){}, removeItem: function(){} }; } }
function hash(pin){
  var h1 = 5381, h2 = 52711, s = "prixna::" + pin;
  for (var i = 0; i < s.length; i++) {
    h1 = ((h1 << 5) + h1 + s.charCodeAt(i)) | 0;
    h2 = ((h2 << 5) + h2 + s.charCodeAt(i * 7 % s.length)) | 0;
  }
  return "d" + (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}
function hasPin(){ return !!store().getItem(LS_HASH); }
function unlocked(){ try { return ses().getItem(SES_KEY) === "1"; } catch (e) { return false; } }
function css(){
  return "<style>#prixna-gate{position:fixed;inset:0;z-index:100000;background:#060F24;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif;padding:20px}"
  + "#prixna-gate .box{background:#101F3D;border:1px solid #1E335F;border-radius:18px;padding:30px;width:min(360px,100%);text-align:center}"
  + "#prixna-gate .dots{font-size:26px;letter-spacing:8px;min-height:40px;margin:10px 0}"
  + "#prixna-gate .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}"
  + "#prixna-gate button{border:0;border-radius:12px;padding:14px;font-size:18px;font-weight:800;background:#1E335F;color:#fff;cursor:pointer}"
  + "#prixna-gate button:hover{background:#1D6FF2}#prixna-gate .err{color:#FDA4AF;min-height:22px;font-size:13px}"
  + "#prixna-gate a{color:#9DACD2;font-size:12px}</style>";
}
function mount(){
  if (!document.documentElement.getAttribute("data-staff")) return;
  if (unlocked()) return;
  var setup = !hasPin();
  var div = document.createElement("div");
  div.id = "prixna-gate";
  div.innerHTML = css() + "<div class='box'><div style='font-size:40px'>🔐</div><b>Staff area</b>"
    + "<p style='color:#9DACD2;font-size:13px;margin:6px 0'>" + (setup ? "First run — set a staff PIN (4+ digits)." : "Enter staff PIN to continue.") + "</p>"
    + "<div class='dots' id='pg-dots'></div><div class='err' id='pg-err'></div><div class='pad' id='pg-pad'></div>"
    + "<p style='margin:14px 0 0'><a href='index.html'>← Back to site</a>"
    + (!setup ? " · <a href='#' id='pg-reset'>Forgot PIN?</a>" : "") + "</p></div>";
  document.body.appendChild(div);
  var entry = "", first = null;
  var dots = document.getElementById("pg-dots"), err = document.getElementById("pg-err");
  function paint(){ dots.textContent = "●".repeat(entry.length) || "–"; }
  paint();
  document.getElementById("pg-pad").innerHTML = ["1","2","3","4","5","6","7","8","9","C","0","✓"].map(function (k) {
    return "<button data-k='" + k + "'>" + k + "</button>";
  }).join("");
  document.getElementById("pg-pad").addEventListener("click", function (e) {
    var k = (e.target.getAttribute && e.target.getAttribute("data-k")) || "";
    if (!k) return;
    err.textContent = "";
    if (k === "C") { entry = ""; paint(); return; }
    if (k === "✓") { submit(); return; }
    if (entry.length >= 12) return;
    entry += k; paint();
    if (!setup && entry.length === 4) setTimeout(submit, 250);
  });
  function submit(){
    if (setup) {
      if (entry.length < 4) { err.textContent = "Use at least 4 digits."; return; }
      if (first === null) { first = entry; entry = ""; paint(); err.textContent = "Repeat the PIN to confirm."; return; }
      if (entry !== first) { first = null; entry = ""; paint(); err.textContent = "Mismatch — start over."; return; }
      store().setItem(LS_HASH, hash(entry));
      return unlock();
    }
    if (hash(entry) === store().getItem(LS_HASH)) return unlock();
    err.textContent = "Wrong PIN. Try again.";
    entry = ""; setTimeout(paint, 150);
  }
  function unlock(){ try { ses().setItem(SES_KEY, "1"); } catch (e) {} div.remove(); }
  var rs = document.getElementById("pg-reset");
  if (rs) rs.onclick = function (ev) {
    ev.preventDefault();
    if (confirm("Reset staff PIN on THIS device only? (Others devices unaffected.)") && confirm("Really reset?")) {
      store().removeItem(LS_HASH);
      location.reload();
    }
  };
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
var api = { hash: hash, hasPin: hasPin, unlocked: unlocked, lock: function(){ try { ses().removeItem(SES_KEY); } catch (e) {} location.reload(); } };
if (typeof window !== "undefined") window.PRIXNA_AUTH = api;
if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
