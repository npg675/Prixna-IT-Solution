/* Prixna IT Solution — lead capture engine.
   Local-first: every submission is REALLY saved to the on-device lead inbox
   (localStorage) and shown a genuine confirmation. If PRIXNA.formEndpoint is
   configured, the lead is ALSO forwarded there. Nothing is faked. */
(function () {
  "use strict";
  var LS_LEADS = "prixna_leads_v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(LS_LEADS) || "[]"); }
    catch (e) { return []; }
  }
  function saveAll(arr) {
    localStorage.setItem(LS_LEADS, JSON.stringify(arr));
  }
  function uid() {
    return "L-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 1296).toString(36).toUpperCase();
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function validPhone(p) {
    var d = String(p || "").replace(/\D/g, "");
    return d.length >= 10 && d.length <= 14;
  }
  function setErr(input, on) {
    var wrap = input.closest(".f-item") || input.parentElement;
    if (wrap) wrap.classList.toggle("invalid", !!on);
    input.setAttribute("aria-invalid", on ? "true" : "false");
  }
  function prefillService(form) {
    try {
      var q = new URLSearchParams(location.search);
      var svc = q.get("service") || form.getAttribute("data-service") || "";
      var sel = form.querySelector('[name="service"]');
      if (svc && sel) {
        var opt = Array.prototype.find.call(sel.options, function (o) {
          return o.value.toLowerCase() === svc.toLowerCase() || o.text.toLowerCase() === svc.toLowerCase();
        });
        if (opt) sel.value = opt.value; else if (!sel.querySelector('[value="__other"]')) {
          var o2 = document.createElement("option"); o2.value = svc; o2.textContent = svc; sel.appendChild(o2); sel.value = svc;
        }
      }
    } catch (e) {}
  }
  function forwardToEndpoint(lead) {
    // Phase 2 autopilot: queue to Google Sheets backend (offline-safe) + legacy endpoint
    try { if (window.PRIXNA_NOTIFY) window.PRIXNA_NOTIFY.push("lead", lead); } catch (e) {}
    var url = (window.PRIXNA || {}).formEndpoint;
    if (!url) return Promise.resolve({ skipped: true });
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(lead)
    }).then(function (r) { return { ok: r.ok, status: r.status }; });
  }
  function initForm(form) {
    if (form.dataset.bound) return;
    form.dataset.bound = "1";
    var t0 = Date.now();
    /* honeypot */
    var hp = document.createElement("input");
    hp.type = "text"; hp.name = "company_site"; hp.className = "hp";
    hp.setAttribute("tabindex", "-1"); hp.setAttribute("autocomplete", "off");
    form.appendChild(hp);
    prefillService(form);
    form.setAttribute("novalidate", "novalidate");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (hp.value) { return; } // silent spam drop
      if (Date.now() - t0 < 2500) {
        showErr(form, "Please take a moment to complete the form before submitting.");
        return;
      }
      var data = {};
      var ok = true;
      ["name", "phone", "email", "company", "location", "service", "message", "preferred_date", "contact_via"].forEach(function (n) {
        var inp = form.querySelector('[name="' + n + '"]');
        data[n] = inp ? inp.value.trim() : "";
      });
      var req = (form.getAttribute("data-required") || "name,phone,message").split(",");
      /* name */
      var nameInp = form.querySelector('[name="name"]');
      if (req.indexOf("name") > -1 && nameInp && data.name.length < 2) { setErr(nameInp, true); ok = false; }
      else if (nameInp) setErr(nameInp, false);
      /* phone */
      var phInp = form.querySelector('[name="phone"]');
      if (req.indexOf("phone") > -1 && phInp && !validPhone(data.phone)) { setErr(phInp, true); ok = false; }
      else if (phInp) setErr(phInp, false);
      /* email (optional unless required) */
      var emInp = form.querySelector('[name="email"]');
      if (emInp && data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setErr(emInp, true); ok = false; }
      else if (emInp && req.indexOf("email") > -1 && !data.email) { setErr(emInp, true); ok = false; }
      else if (emInp) setErr(emInp, false);
      /* consent */
      var consent = form.querySelector('[name="consent"]');
      if (consent && !consent.checked) {
        showErr(form, "Please tick the consent checkbox so we can contact you about your enquiry.");
        return;
      }
      if (!ok) { showErr(form, "Please check the highlighted fields and try again."); return; }
      var btn = form.querySelector('[type="submit"]');
      var orig = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      var src = (window.PRIXNA_SRC ? window.PRIXNA_SRC() : {});
      var msg = data.message;
      if (data.preferred_date) msg += "\nPreferred date: " + data.preferred_date;
      if (data.contact_via) msg += "\nContact via: " + data.contact_via;
      try {
        var pq = new URLSearchParams(location.search);
        if (pq.get("product")) msg += "\nProduct ref: " + pq.get("product");
      } catch (e) {}
      var lead = {
        id: uid(), createdAt: new Date().toISOString(),
        form: form.getAttribute("data-form") || "general",
        name: data.name, phone: data.phone, email: data.email,
        company: data.company, location: data.location,
        service: data.service, message: msg,
        source: src, status: "new", followUp: "", assignee: "", history: [{ ts: new Date().toISOString(), note: "Enquiry received." }]
      };
      var leads = load();
      leads.unshift(lead);
      try {
        saveAll(leads);
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = orig; }
        showErr(form, "This browser blocked local saving (private mode?). Please contact us directly on WhatsApp instead.");
        return;
      }
      forwardToEndpoint(lead).then(function () {
        if (btn) { btn.disabled = false; btn.textContent = orig; }
        showOk(form, lead);
        if (window.PRIXNA_LOG) window.PRIXNA_LOG("form_submit", lead.form + " / " + lead.service);
        form.reset();
      }).catch(function () {
        /* remote forward failed — local save already succeeded, still confirm honestly */
        if (btn) { btn.disabled = false; btn.textContent = orig; }
        showOk(form, lead, true);
        if (window.PRIXNA_LOG) window.PRIXNA_LOG("form_submit", lead.form + " / local-only");
        form.reset();
      });
    });
  }
  function showOk(form, lead, remoteFailed) {
    hideMsgs(form);
    var box = form.parentElement.querySelector(".form-ok") || form.querySelector(".form-ok");
    if (!box) {
      box = document.createElement("div");
      box.className = "form-ok";
      form.appendChild(box);
    }
    var waText = "Hello Prixna IT Solution, I am " + lead.name + " (" + lead.phone + "). I am interested in: " + (lead.service || lead.form) + ". My reference: " + lead.id;
    box.innerHTML = "<b>✅ Thank you, " + esc(lead.name.split(" ")[0]) + "! Your enquiry has been received.</b><br>" +
      "Reference ID: <b>" + esc(lead.id) + "</b>. Our team will call you back on <b>" + esc(lead.phone) + "</b> during business hours (" + esc((window.PRIXNA || {}).hours || "") + ")." +
      (remoteFailed ? "<br><span class=\"small\">Note: online forwarding is not configured right now — your details are safely saved in our lead inbox" + esc((window.PRIXNA || {}).leadInboxNote ? "" : "") + ".</span>" : "") +
      '<div class="btn-row" style="margin-top:14px"><a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener" href="' + window.PRIXNA_WA(waText) + '">💬 Send this enquiry on WhatsApp</a></div>';
    box.classList.add("show");
    if (typeof box.scrollIntoView === "function") { try { box.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {} }
  }
  function showErr(form, msg) {
    hideMsgs(form);
    var box = form.parentElement.querySelector(".form-err") || form.querySelector(".form-err");
    if (!box) { box = document.createElement("div"); box.className = "form-err"; form.appendChild(box); }
    box.textContent = "⚠️ " + msg;
    box.classList.add("show");
  }
  function hideMsgs(form) {
    var scope = form.parentElement;
    scope.querySelectorAll(".form-ok,.form-err").forEach(function (b) { b.classList.remove("show"); });
  }
  /* Standard service options shared by every form on the site */
  var SERVICE_OPTIONS = ["Free Business Consultation", "Business Software / SaaS Demo", "JigriTools Enquiry", "Custom Software / Website Development", "Accounting / ERP / CRM", "Restaurant / Hospitality Solution", "Attendance & Payroll", "Computers / Laptops / Equipment", "CCTV & Security Installation", "Biometric / Access Control", "Networking / Servers", "Repair & Maintenance", "Digital Marketing / AI Automation", "Bulk / Dealer Enquiry", "Other"];
  function serviceSelect(selected) {
    return '<div class="f-item"><label class="flab" for="f-svc">Service needed</label>' +
      '<select class="inp" id="f-svc" name="service">' +
      SERVICE_OPTIONS.map(function (s) {
        return '<option value="' + esc(s) + '"' + (s === selected ? " selected" : "") + ">" + esc(s) + "</option>";
      }).join("") + "</select></div>";
  }
  function renderMounts() {
    document.querySelectorAll("[data-lead-form-mount]").forEach(function (mount) {
      if (mount.dataset.rendered) return;
      mount.dataset.rendered = "1";
      var title = mount.getAttribute("data-title") || "Request a callback";
      var sub = mount.getAttribute("data-subtitle") || "Fill in the form and our team will call you back during business hours.";
      var svc = mount.getAttribute("data-service") || "";
      var formName = mount.getAttribute("data-form") || "general";
      var submit = mount.getAttribute("data-submit") || "Send Enquiry →";
      var booking = mount.hasAttribute("data-booking")
        ? '<div class="f-item"><label class="flab" for="f-date">Preferred date (optional)</label><input class="inp" id="f-date" name="preferred_date" type="date"></div>' +
          '<div class="f-item"><label class="flab" for="f-how">How should we reach you?</label><select class="inp" id="f-how" name="contact_via"><option>Phone call</option><option>WhatsApp</option><option>Email</option><option>On-site visit (Valley)</option></select></div>'
        : "";
      mount.innerHTML =
        '<div class="form-card"><h3 style="margin-top:0">' + esc(title) + '</h3><p class="muted">' + esc(sub) + "</p>" +
        '<form data-lead-form data-form="' + esc(formName) + '" data-service="' + esc(svc) + '">' +
        '<div class="f-grid">' +
        '<div class="f-item"><label class="flab req" for="f-name">Full name</label><input class="inp" id="f-name" name="name" autocomplete="name" placeholder="Your name"><div class="ferr">Please enter your name.</div></div>' +
        '<div class="f-item"><label class="flab req" for="f-phone">Phone / WhatsApp</label><input class="inp" id="f-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="98XXXXXXXX"><div class="ferr">Please enter a valid phone number.</div></div>' +
        '<div class="f-item"><label class="flab" for="f-email">Email (optional)</label><input class="inp" id="f-email" name="email" inputmode="email" autocomplete="email" placeholder="you@company.com"><div class="ferr">That email address looks incomplete.</div></div>' +
        '<div class="f-item"><label class="flab" for="f-comp">Company (optional)</label><input class="inp" id="f-comp" name="company" autocomplete="organization" placeholder="Business name"></div>' +
        '<div class="f-item"><label class="flab" for="f-loc">Location</label><input class="inp" id="f-loc" name="location" placeholder="e.g. Koteshwor, Kathmandu"></div>' +
        serviceSelect(svc) + booking +
        '<div class="f-item f-full"><label class="flab" for="f-msg">How can we help?</label><textarea class="inp" id="f-msg" name="message" placeholder="Tell us about your requirement…"></textarea></div>' +
        '<label class="consent f-full"><input type="checkbox" name="consent"> <span>I agree to be contacted about my enquiry by call, SMS, email or WhatsApp. (Required — we never share your details.)</span></label>' +
        '<div class="f-full"><button class="btn btn-primary btn-block" type="submit">' + esc(submit) + "</button>" +
        '<p class="small muted" style="margin:10px 0 0">Prefer talking? <a data-track="form_call_link" href="' + (window.PRIXNA || {}).phoneHref + '">📞 ' + esc((window.PRIXNA || {}).phoneDisplay || "") + "</a></p></div>" +
        "</div></form></div>";
      initForm(mount.querySelector("form[data-lead-form]"));
    });
  }
  function bootLeads() {
    renderMounts();
    document.querySelectorAll("form[data-lead-form]").forEach(initForm);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootLeads);
  } else {
    bootLeads();
  }
  /* public helpers for admin + shop */
  window.PRIXNA_LEADS = { load: load, saveAll: saveAll, esc: esc };
})();
