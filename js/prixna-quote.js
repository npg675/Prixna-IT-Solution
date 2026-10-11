/* Prixna Quotations — shared math + storage (used by quote-pdf.html, tested in Node).
   NPR uses lakh/crore grouping (en-IN). Staff enters unit prices; nothing is invented. */
(function () {
"use strict";
function parseItems(text){
  var lines = String(text || "").replace(/^[\s\S]*?BULK LIST:\s*/i, "").split(/\n/);
  var out = [];
  lines.forEach(function (raw) {
    var line = String(raw || "").trim().replace(/^[•\-*]+\s*/, "").replace(/^\d+[.)]\s*/, "");
    if (!line) return;
    if (/^(bulouston|bulk list|preferred|contact via|product ref|my reference)/i.test(line)) return;
    var m = line.match(/^(\d+)\s*(?:x|×|\*|pcs?|units?|nos?|sets?|pics?)?\s*[-:–.]?\s*(.+)$/i);
    if (m) out.push({ qty: parseInt(m[1], 10), desc: m[2].trim(), price: 0 });
    else out.push({ qty: 1, desc: line, price: 0 });
  });
  return out;
}
function computeTotals(rows, discountNPR, vatPct, vatOn, advancePct){
  var sub = 0;
  (rows || []).forEach(function (r) {
    sub += (Math.max(0, +r.qty || 0)) * (Math.max(0, +r.price || 0));
  });
  var disc = Math.min(Math.max(0, +discountNPR || 0), sub);
  var taxable = sub - disc;
  var vat = vatOn ? taxable * (Math.max(0, +vatPct || 0)) / 100 : 0;
  var total = taxable + vat;
  var advance = total * (Math.max(0, +advancePct || 0)) / 100;
  function r(n){ return Math.round(n); }
  return { subtotal: r(sub), discount: r(disc), taxable: r(taxable), vat: r(vat), total: r(total), advance: r(advance) };
}
function formatNPR(n){
  try { return "Rs. " + Math.round(+n || 0).toLocaleString("en-IN"); }
  catch (e) { return "Rs. " + Math.round(+n || 0); }
}
function newQuoteId(){
  return "Q-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 1296).toString(36).toUpperCase();
}
function loadQuotes(){ try { return JSON.parse(localStorage.getItem("prixna_quotes_v1") || "[]"); } catch (e) { return []; } }
function saveQuotes(a){ try { localStorage.setItem("prixna_quotes_v1", JSON.stringify(a.slice(0, 200))); } catch (e) {} }
var api = { parseItems: parseItems, computeTotals: computeTotals, formatNPR: formatNPR, newQuoteId: newQuoteId, loadQuotes: loadQuotes, saveQuotes: saveQuotes };
if (typeof window !== "undefined") window.PRIXNA_QUOTE = api;
if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
