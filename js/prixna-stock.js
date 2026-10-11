/* Prixna Stock — local-first inventory (tested in Node).
   Catalog seeds come from js/data.js (p.qty / p.lowAt optional).
   Staff overrides live in prixna_stock_v1 {id: qty}; null = untracked.
   Quote rows match catalog by significant-word overlap. */
(function () {
"use strict";
var LS_QTY = "prixna_stock_v1";
var LS_MOVES = "prixna_stock_moves_v1";
function store(){ try { return localStorage; } catch (e) { return { getItem: function(){return null;}, setItem: function(){} }; } }
function loadQty(){ try { return JSON.parse(store().getItem(LS_QTY) || "{}"); } catch (e) { return {}; } }
function saveQty(o){ try { store().setItem(LS_QTY, JSON.stringify(o)); } catch (e) {} }
function loadMoves(){ try { return JSON.parse(store().getItem(LS_MOVES) || "[]"); } catch (e) { return []; } }
function saveMoves(a){ try { store().setItem(LS_MOVES, JSON.stringify(a.slice(0, 200))); } catch (e) {} }
function catalog(){ return ((window && window.PRIXNA_DATA && window.PRIXNA_DATA.products) || []); }
function words(s){
  return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(function (w) { return w.length > 2 && ["with", "and", "for", "the", "pcs", "set"].indexOf(w) === -1; });
}
function effectiveQty(p, ov){
  if (ov && ov[p.id] != null) return +ov[p.id];
  return p.qty != null ? +p.qty : null;
}
function effectiveLow(p){ return p.lowAt != null ? +p.lowAt : 3; }
/** Best catalog match for a free-text quote row desc, or null. */
function matchProduct(desc){
  var dw = words(desc);
  if (!dw.length) return null;
  var best = null, bestScore = 0;
  catalog().forEach(function (p) {
    var pw = words(p.name);
    if (!pw.length) return;
    var hit = pw.filter(function (w) { return dw.indexOf(w) > -1; }).length;
    var score = hit / pw.length;
    if (hit === pw.length) score += 0.5; // all words present = strong match
    if (score > bestScore) { bestScore = score; best = p; }
  });
  // require at least half the product words (or 2+ words) to match
  if (!best) return null;
  var need = Math.max(2, Math.ceil(words(best.name).length / 2));
  var hitN = words(best.name).filter(function (w) { return dw.indexOf(w) > -1; }).length;
  return hitN >= need ? best : null;
}
function getStock(){
  var ov = loadQty();
  return catalog().map(function (p) {
    var q = effectiveQty(p, ov);
    return { id: p.id, name: p.name, price: p.price, qty: q, lowAt: effectiveLow(p), tracked: q != null, low: q != null && q <= effectiveLow(p) };
  });
}
function setQty(id, qty){
  var ov = loadQty();
  ov[id] = Math.max(0, Math.round(+qty || 0));
  saveQty(ov);
  return ov[id];
}
function adjust(id, delta){
  var ov = loadQty();
  var p = catalog().filter(function (x) { return x.id === id; })[0];
  var cur = effectiveQty(p || { id: id }, ov);
  if (cur == null) cur = 0;
  ov[id] = Math.max(0, cur + delta);
  saveQty(ov);
  return ov[id];
}
/** Decrement stock for a paid quote's rows. Returns {moved, lows}. */
function decrementFromQuote(quote){
  var ov = loadQty();
  var moves = loadMoves();
  var moved = [], lows = [];
  (quote.rows || []).forEach(function (r) {
    var p = matchProduct(r.desc);
    if (!p) return;
    var q = effectiveQty(p, ov);
    if (q == null) return; // untracked — skip silently
    var take = Math.max(0, Math.round(+r.qty || 0));
    var after = Math.max(0, q - take);
    ov[p.id] = after;
    moves.unshift({ ts: new Date().toISOString(), productId: p.id, name: p.name, delta: -take, after: after, ref: quote.id });
    moved.push({ id: p.id, name: p.name, took: take, left: after });
    if (after <= effectiveLow(p)) lows.push({ id: p.id, name: p.name, left: after, lowAt: effectiveLow(p) });
  });
  saveQty(ov);
  saveMoves(moves);
  return { moved: moved, lows: lows };
}
var api = { getStock: getStock, setQty: setQty, adjust: adjust, matchProduct: matchProduct, decrementFromQuote: decrementFromQuote, moves: loadMoves };
if (typeof window !== "undefined") window.PRIXNA_STOCK = api;
if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
