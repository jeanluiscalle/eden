(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var PHONE = data.whatsapp || "51981042390";
  var fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }
  function waLink(msg) { return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg); }

  /* ---------- WhatsApp links (rebuild with proper encoding) ---------- */
  function initWhatsApp() {
    $$("[data-wa-msg]").forEach(function (a) {
      a.setAttribute("href", waLink(a.getAttribute("data-wa-msg")));
    });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var toggle = $("[data-nav-toggle]", nav);
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 20); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      });
      $$(".nav-links a", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    // Sliding underline on desktop links
    var links = $("[data-nav-links]");
    var line = $(".nav-underline", links || document);
    if (!links || !line || !fineHover) return;
    $$("a", links).forEach(function (a) {
      a.addEventListener("mouseover", function () {
        line.style.width = (a.offsetWidth - 28) + "px";
        line.style.transform = "translateX(" + (a.offsetLeft + 14) + "px)";
        line.style.opacity = "1";
      });
    });
    links.addEventListener("mouseout", function (e) {
      if (!links.contains(e.relatedTarget)) line.style.opacity = "0";
    });
  }

  /* ---------- Reveals (IO + safety net) ---------- */
  function initReveals() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    // Stagger siblings inside the same parent
    var groups = new Map();
    items.forEach(function (el) {
      var p = el.parentElement;
      var i = groups.get(p) || 0;
      el.style.setProperty("--d", Math.min(i * 0.08, 0.48) + "s");
      groups.set(p, i + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("is-visible");
        io.unobserve(el);
        setTimeout(function () { el.style.removeProperty("--d"); }, 1600);
      });
    }, { threshold: 0.02, rootMargin: "0px 0px -4% 0px" });
    items.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Card tilt + glare ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$("[data-tilt]").forEach(function (card) {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", ((x - 0.5) * 7).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
        card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      });
      card.addEventListener("mouseout", function (e) {
        if (card.contains(e.relatedTarget)) return;
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$(".btn-magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.setProperty("--mx", x.toFixed(1) + "px");
        btn.style.setProperty("--my", y.toFixed(1) + "px");
      });
      btn.addEventListener("mouseout", function (e) {
        if (btn.contains(e.relatedTarget)) return;
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- Hero stack parallax (mouse) ---------- */
  function initStackParallax() {
    var stack = $("[data-stack]");
    if (!stack || !fineHover) return;
    var cards = $$(".float-card", stack);
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      cards.forEach(function (c) {
        var d = parseFloat(c.getAttribute("data-depth")) || 1;
        c.style.setProperty("--px", (cx * d * 18).toFixed(2) + "px");
        c.style.setProperty("--py", (cy * d * 14).toFixed(2) + "px");
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    window.addEventListener("mousemove", function (e) {
      tx = (e.clientX / window.innerWidth) - 0.5;
      ty = (e.clientY / window.innerHeight) - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ---------- Hero scroll drift (GSAP) ---------- */
  function initHeroScroll() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".hero-stack", {
      yPercent: -8, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  /* ---------- Customizer: live preview + WhatsApp ---------- */
  function initCustomizer() {
    var form = $("[data-custom-form]");
    if (!form) return;
    var inName = $("[data-input-name]", form);
    var inVerse = $("[data-input-verse]", form);
    var inOcc = $("[data-input-occasion]", form);
    var inStyle = $("[data-input-style]", form);
    var outName = $("[data-preview-name]");
    var outVerse = $("[data-preview-verse]");
    var outOcc = $("[data-preview-occasion]");
    var DEF_NAME = "Para ti";
    var DEF_VERSE = "Todo lo puedo en Cristo que me fortalece";

    function update() {
      if (outName) outName.textContent = inName.value.trim() || DEF_NAME;
      if (outVerse) outVerse.textContent = inVerse.value.trim() || DEF_VERSE;
      if (outOcc) outOcc.textContent = inOcc.value;
    }
    [inName, inVerse, inOcc].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", update);
      el.addEventListener("change", update);
    });
    update();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lines = ["Hola EDÉN, quiero una taza personalizada 🤍"];
      if (inName.value.trim()) lines.push("• Para: " + inName.value.trim());
      lines.push("• Ocasión: " + inOcc.value);
      lines.push("• Versículo o frase: " + (inVerse.value.trim() || "Quiero que me recomienden"));
      lines.push("• Estilo: " + inStyle.value);
      window.open(waLink(lines.join("\n")), "_blank", "noopener");
    });
  }

  function initYear() {
    var y = $("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function boot() {
    safe(initWhatsApp, "initWhatsApp");
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initStackParallax, "initStackParallax");
    safe(initHeroScroll, "initHeroScroll");
    safe(initCustomizer, "initCustomizer");
    safe(initYear, "initYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
