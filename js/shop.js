/* Prixna IT Solution — shop catalog: search, filter, sort, enquiry.
   Data source: PRIXNA_DATA.products in js/data.js (edit prices/stock there). */
(function () {
  "use strict";
  function npr(n) {
    if (!n) return "";
    return "Rs " + Number(n).toLocaleString("en-IN");
  }
  function stockMeta(p) {
    if (p.stock === "in") return { cls: "instock", label: "✅ In stock" };
    if (p.stock === "out") return { cls: "outstock", label: "❌ Out of stock" };
    if (p.stock === "low") return { cls: "lowstock", label: "⚠️ Low stock" };
    return { cls: "lowstock", label: "💬 Price on request" };
  }
  function card(p) {
    var s = stockMeta(p);
    var price = p.price
      ? '<p class="price">' + (p.mrp > p.price ? "<s>" + npr(p.mrp) + "</s>" : "") + npr(p.price) + '</p><p class="npr">NPR · VAT bill available</p>'
      : '<p class="price">On request</p><p class="npr">Quoted after free consultation</p>';
    var wa = window.PRIXNA_WA("Hello Prixna IT Solution, I want to enquire about: " + p.name + " (" + p.id + "). Is it available?");
    return '<article class="card shop-card rv vis">' +
      '<div class="shop-img" aria-hidden="true">' + p.icon + "</div>" +
      '<span class="cat-pill">' + p.category + "</span>" +
      "<h3>" + p.name + "</h3>" +
      '<p class="small muted">' + p.desc + "</p>" + price +
      '<p><span class="stock ' + s.cls + '">' + s.label + "</span></p>" +
      '<p class="small muted">Warranty: ' + p.warranty + "</p>" +
      '<div class="btn-row" style="margin-top:auto">' +
      (p.stock === "out"
        ? '<a class="btn btn-outline btn-sm" href="quote.html?service=' + encodeURIComponent("Computers / Laptops / Equipment") + "&product=" + encodeURIComponent(p.name) + '" data-track="shop_notify">Notify me when available</a>'
        : '<a class="btn btn-primary btn-sm" href="quote.html?service=' + encodeURIComponent("Computers / Laptops / Equipment") + "&product=" + encodeURIComponent(p.name) + '" data-track="shop_enquire">Enquire / Get price</a>') +
      '<a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="' + wa + '" data-track="shop_whatsapp">WhatsApp</a>' +
      "</div></article>";
  }
  function init() {
    var grid = document.getElementById("shop-grid");
    if (!grid) return;
    var q = document.getElementById("shop-q");
    var sort = document.getElementById("shop-sort");
    var chips = Array.prototype.slice.call(document.querySelectorAll("#shop-cats .chip"));
    var activeCat = "All";
    function render() {
      var term = (q.value || "").toLowerCase();
      var items = (window.PRIXNA_DATA.products || []).filter(function (p) {
        var okCat = activeCat === "All" || p.category === activeCat;
        var okQ = !term || (p.name + " " + p.desc + " " + p.category).toLowerCase().indexOf(term) > -1;
        return okCat && okQ;
      });
      var mode = sort.value;
      items.sort(function (a, b) {
        if (mode === "low") return (a.price || 1e12) - (b.price || 1e12);
        if (mode === "high") return (b.price || 0) - (a.price || 0);
        return 0;
      });
      document.getElementById("shop-count").textContent = items.length + " product" + (items.length === 1 ? "" : "s");
      grid.innerHTML = items.length ? items.map(card).join("")
        : '<div class="placeholder" style="grid-column:1/-1">No products match. Try a different search — or <a href="quote.html">ask us directly</a>, new stock arrives regularly.</div>';
      if (window.PRIXNA_LOG) window.PRIXNA_LOG("shop_view", term + " / " + activeCat);
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.classList.remove("on"); });
        c.classList.add("on");
        activeCat = c.getAttribute("data-cat");
        render();
      });
    });
    q.addEventListener("input", render);
    sort.addEventListener("change", render);
    render();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
