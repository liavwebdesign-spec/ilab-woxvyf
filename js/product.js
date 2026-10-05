/* iLab Diamonds · product page. Runs after site.js (header, menus, reveal, cards and the loupe come from there, through ILAB_UI).
   Here: sizes and the size sheet, metal, add to cart, delivery dates, the gallery (loupe, swipe count, video), the buy box at eye
   level, the buy bar, more products, and the signature: a close look through a round glass (approved 5.10.2026). */
(function () {
  "use strict";
  var U = window.ILAB_UI, D = window.ILAB; if (!U) return;
  var reduced = U.reduced, doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  $$(".box .rv").forEach(function (el, i) { el.style.setProperty("--i", i); });

  /* ---------- sizes: the store sells 3 to 24, where size n fits a finger of 40+n mm around ---------- */
  var sel = $("#size"), err = $("#size-err"), rows = [];
  for (var n = 3; n <= 24; n++) {
    var c = 40 + n;
    sel.insertAdjacentHTML("beforeend", '<option value="' + n + '">' + n + " (היקף " + c + " מ״מ)</option>");
    rows.push("<tr><td>" + n + "</td><td>" + c + "</td><td>" + (c / Math.PI).toFixed(1) + "</td></tr>");
  }
  sel.insertAdjacentHTML("beforeend", '<option value="later">עוד לא יודעים, נתאים אחרי הקנייה</option>');
  $("[data-sizes]").innerHTML = rows.join("");
  sel.addEventListener("change", function () { if (sel.value) { sel.removeAttribute("aria-invalid"); err.textContent = ""; } summary(); });

  var sheet = $("#sizes");
  $$("[data-open-sizes]").forEach(function (b) { b.addEventListener("click", function () { if (sheet.showModal) sheet.showModal(); else sheet.setAttribute("open", ""); }); });
  sheet.addEventListener("click", function (e) { if (e.target === sheet || e.target.closest("[data-close]")) sheet.close(); });

  /* ---------- metal ---------- */
  var metalName = $("[data-metal-name]"), metalNote = $("[data-metal-note]");
  function metal() { return $('input[name="metal"]:checked'); }
  /* one choice of gold for the whole page: the stage, the box, the gallery and the bar. The photos are rose gold;
     yellow and white are the same photos with the metal recoloured, and the page says so */
  var stageBtns = $$(".sm"), simNote = $("[data-sim-note]"), sweep = null;
  function setMetal(m, animate) {
    var r = $('input[name="metal"][value="' + m + '"]'); if (!r) return;
    r.checked = true;
    metalName.innerHTML = r.dataset.name + ' <span class="lat">14K</span>';
    metalNote.hidden = m === "r";
    if (simNote) simNote.textContent = m === "r" ? "הצילום בזהב אדום" : "הדמיה על הצילום, שצולם בזהב אדום";
    stageBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.m === m)); });
    $$("img[data-base]").forEach(function (img) { img.src = img.dataset.base + (m === "r" ? "" : "-" + m) + ".webp"; });
    if (sweep) sweep(m, animate);
    summary();
  }
  $$('input[name="metal"]').forEach(function (r) { r.addEventListener("change", function () { setMetal(r.value, true); }); });
  stageBtns.forEach(function (b) { b.addEventListener("click", function () { setMetal(b.dataset.m, true); }); });
  var barSum = $("[data-bar-sum]");
  function sizeText() { return sel.value === "later" ? "מידה אחרי הקנייה" : sel.value ? "מידה " + sel.value : ""; }
  function summary() { barSum.textContent = [metal().dataset.name + " 14K", sizeText()].filter(Boolean).join(" · "); }

  /* ---------- add to cart (a sketch: the count in the header and a line that says what went in) ---------- */
  var cart = $(".cart"), cartN = cart && $(".cart-n", cart), msg = $(".buy-msg"), count = 0, box = $(".box");
  function add() {
    if (!sel.value) {
      sel.setAttribute("aria-invalid", "true");
      err.textContent = "בחרו מידה, או \"עוד לא יודעים\" אם הטבעת היא הפתעה.";
      var r = sel.getBoundingClientRect();
      if (r.top < 120 || r.bottom > innerHeight) sel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      sel.focus({ preventScroll: true }); return;
    }
    count++;
    if (cartN) { cartN.hidden = false; cartN.textContent = count; cart.setAttribute("aria-label", "סל הקניות, " + count + (count === 1 ? " פריט" : " פריטים")); }
    msg.textContent = "נוספה לסל: ROYAL, " + metal().dataset.name + " 14K, " + sizeText() + ".";
  }
  $$("[data-add]").forEach(function (b) { b.addEventListener("click", add); });
  var fav = $(".buy-fav");
  fav.addEventListener("click", function () { var on = fav.getAttribute("aria-pressed") !== "true"; fav.setAttribute("aria-pressed", String(on)); fav.setAttribute("aria-label", on ? "הסרה מהמועדפים" : "הוספה למועדפים"); });

  /* ---------- delivery: 3 to 5 business days (Sunday to Thursday), counted from tomorrow ---------- */
  (function eta() {
    var DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
    function plus(k) { var d = new Date(); while (k > 0) { d.setDate(d.getDate() + 1); if (d.getDay() <= 4) k--; } return d; }
    function fmt(d) { return "יום " + DAYS[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1); }
    $("[data-eta]").textContent = "מזמינים היום, ומקבלים בין " + fmt(plus(3)) + " ל" + fmt(plus(5)) + ".";
  })();

  /* ---------- the gallery: the loupe on every photo (a real mouse, desktop), the count while swiping, the video on request ---------- */
  var gal = $(".gal"), track = $(".gal-track", gal);
  (function gallery() {
    var mq = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    $$(".gal-item", gal).forEach(function (item) {
      var lens = $(".loupe", item), img = $("img", item), raf = 0, last = null; if (!lens) return;
      function draw() { raf = 0; if (last) U.lensAt(lens, img, last.x, last.y, 2.4); }
      item.addEventListener("pointermove", function (e) {
        if (!mq.matches || e.pointerType !== "mouse") return;
        item.classList.add("has-loupe", "is-looking"); gal.classList.add("was-used"); last = { x: e.clientX, y: e.clientY };
        if (!raf) raf = requestAnimationFrame(draw);
      });
      item.addEventListener("pointerleave", function () { item.classList.remove("is-looking"); });
    });
    addEventListener("scroll", function () { $$(".gal-item.is-looking", gal).forEach(function (i) { i.classList.remove("is-looking"); }); }, { passive: true });
    var now = $("[data-gal-now]", gal), items = $$(".gal-item", gal);
    track.addEventListener("scroll", function () {
      var w = items[0].offsetWidth + 8, i = Math.min(items.length - 1, Math.round(Math.abs(track.scrollLeft) / w));
      now.textContent = i + 1;
    }, { passive: true });
    var v = $(".gal-video video", gal), play = $(".gal-play", gal);
    play.insertAdjacentHTML("afterbegin", '<span class="sr">ניגון הסרטון: </span>');
    play.addEventListener("click", function () {
      if (v.paused) { v.play(); play.setAttribute("aria-pressed", "true"); } else { v.pause(); play.setAttribute("aria-pressed", "false"); }
    });
  })();

  /* ---------- the buy box at eye level: a box taller than the screen sticks by its bottom, so nothing in it is out of reach ---------- */
  var hdBody = $(".hd-body");
  function fitBox() {
    if (innerWidth < 1024) { box.style.top = ""; return; }
    var top = (hdBody ? hdBody.offsetHeight : 112) + 24;
    box.style.top = Math.min(top, innerHeight - box.offsetHeight - 24) + "px";
  }
  fitBox(); addEventListener("resize", fitBox); addEventListener("load", fitBox);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitBox);

  /* ---------- the buy bar: shown while the box's button is out of sight and the footer is not on screen ---------- */
  (function buyBar() {
    var bar = $(".buybar"), btn = $(".buy-btn"), ft = $(".ft"); if (!bar || !("IntersectionObserver" in window)) return;
    // the stage has its own price and button, so the bar waits until the stage has gone
    var btnSeen = true, ftSeen = false, stageSeen = true, stg = $(".stage");
    function set() {
      var on = !btnSeen && !ftSeen && !stageSeen;
      bar.classList.toggle("is-on", on); bar.inert = !on; doc.classList.toggle("has-buybar", on);
    }
    new IntersectionObserver(function (es) { btnSeen = es[0].isIntersecting; set(); }).observe(btn);
    new IntersectionObserver(function (es) { ftSeen = es[0].isIntersecting; set(); }).observe(ft);
    if (stg) new IntersectionObserver(function (es) { stageSeen = es[0].intersectionRatio >= .35; set(); }, { threshold: [0, .35, 1] }).observe(stg); else stageSeen = false;
  })();
  summary();

  /* ---------- more from the catalogue: the homepage cards ---------- */
  var more = $("[data-more]");
  if (more) {
    more.innerHTML = more.dataset.more.split(",").map(function (id) { return U.card(+id); }).join("");
    var cards = $$(".card", more); cards.forEach(function (c, i) { c.style.setProperty("--i", i); });
    if (reduced) cards.forEach(function (c) { c.classList.add("is-in"); });
    else U.inView(more, function () { cards.forEach(function (c) { c.classList.add("is-in"); }); });
    U.snapSoon();
  }

  /* ---------- the stage (approved 5.10.2026): the gold changes under a passing light, the ring leans toward the mouse,
     and on a desktop with motion it travels on scroll and lands on the first photo of the gallery ---------- */
  (function stage() {
    var st = $(".stage"); if (!st) return;
    var ring = $(".stage-ring", st), layers = $$(".sr-img", ring), sheen = $(".sr-sheen", ring);
    function layer(m) { return layers.filter(function (l) { return l.dataset.m === m; })[0]; }
    sweep = function (m, animate) {
      var cur = layers.filter(function (l) { return l.classList.contains("is-on"); })[0], nx = layer(m);
      if (!nx || nx === cur) return;
      layers.forEach(function (l) { l.getAnimations && l.getAnimations().forEach(function (a) { a.finish(); }); });
      if (reduced || !animate || !nx.animate) { layers.forEach(function (l) { l.classList.toggle("is-on", l === nx); }); return; }
      // the new metal is uncovered from the start side while a band of light crosses with the edge (25% to 75% keeps it on it)
      // a full address: inside a custom property a relative url would resolve against the stylesheet, not the page
      ring.style.setProperty("--mask", 'url("' + nx.src + '")');
      nx.classList.add("is-on"); nx.style.zIndex = 2;
      var ease = "cubic-bezier(.76,0,.24,1)";
      var a = nx.animate([{ clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)" }], { duration: 900, easing: ease });
      sheen.animate([{ opacity: 0, backgroundPosition: "25% 0" }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85 }, { opacity: 0, backgroundPosition: "75% 0" }], { duration: 900, easing: ease });
      a.onfinish = function () { layers.forEach(function (l) { if (l !== nx) l.classList.remove("is-on"); }); nx.style.zIndex = ""; };
    };
    // "choose a size" takes the visitor to the box and puts them in the size field
    $$("[data-to-size]").forEach(function (l) { l.addEventListener("click", function () { setTimeout(function () { sel.focus({ preventScroll: true }); }, reduced ? 50 : 750); }); });
    if (reduced) return;
    // the lean: a few degrees toward the mouse, eased, back to rest when it leaves
    var fine = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)"), aim = { x: 0, y: 0 }, now = { x: 0, y: 0 }, raf = 0;
    function tick() {
      now.x += (aim.x - now.x) * .08; now.y += (aim.y - now.y) * .08;
      ring.style.setProperty("--ry", (now.x * 8).toFixed(2) + "deg"); ring.style.setProperty("--rx", (-now.y * 6).toFixed(2) + "deg");
      raf = Math.abs(aim.x - now.x) > .002 || Math.abs(aim.y - now.y) > .002 ? requestAnimationFrame(tick) : 0;
    }
    st.addEventListener("pointermove", function (e) {
      if (!fine.matches || e.pointerType !== "mouse") return;
      var b = st.getBoundingClientRect(); aim.x = (e.clientX - b.left) / b.width - .5; aim.y = (e.clientY - b.top) / b.height - .5;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    st.addEventListener("pointerleave", function () { aim.x = aim.y = 0; if (!raf) raf = requestAnimationFrame(tick); });
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var gimg = $(".gal-main img"), words = [".stage-title", ".stage-metal", ".stage-buy"].map(function (q) { return $(q, st); });
    // the travel: from the ring's place on the stage to the square the first photo is drawn in. Both boxes are measured at rest
    // (the transforms live on the images, never on .stage-ring), so the difference is the same at every scroll position
    function geo() {
      var r = ring.getBoundingClientRect(), g = gimg.getBoundingClientRect(), side = Math.min(g.width, g.height);
      return { dx: g.left + g.width / 2 - (r.left + r.width / 2), dy: g.top + g.height / 2 - (r.top + r.height / 2), s: side / r.width };
    }
    gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      gal.classList.add("is-landing");
      var tl = gsap.timeline({ scrollTrigger: { trigger: gimg, start: 0, end: "center center", scrub: .6, invalidateOnRefresh: true } });
      tl.fromTo(ring, { "--tx": "0px", "--ty": "0px", "--s": 1 },
          { "--tx": function () { return geo().dx + "px"; }, "--ty": function () { return geo().dy + "px"; }, "--s": function () { return geo().s; }, ease: "power1.inOut", duration: 1 }, 0)
        // the stage's words step back first, so the ring never passes over them
        .to(words, { autoAlpha: 0, y: -16, duration: .25, ease: "power1.in" }, 0)
        .to(gimg, { opacity: 1, duration: .06 }, .94)
        .to(ring, { autoAlpha: 0, duration: .06 }, .94);
      return function () { gal.classList.remove("is-landing"); gsap.set([gimg, ring].concat(words), { clearProps: "all" }); };
    });
    // the opening moves and scales .stage-ring for a moment; measure again once it has settled
    if (doc.classList.contains("open-anim")) setTimeout(function () { ScrollTrigger.refresh(); }, 1900);
  })();

  /* ---------- the signature: a close look (approved 5.10.2026). One round glass; the camera travels over the photo to four
     stops while the line beside it changes. Pinned on desktop with motion; elsewhere the four round close-ups stay as they are ---------- */
  (function tour() {
    var sec = $(".tour"); if (!sec || !window.gsap || !window.ScrollTrigger || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    var steps = $$(".tour-step", sec), cam = $(".tour-cam", sec), dots = $$(".tour-dots li", sec);
    var stops = steps.map(function (s) { var cs = getComputedStyle(s); return { x: +cs.getPropertyValue("--x"), y: +cs.getPropertyValue("--y"), z: +cs.getPropertyValue("--z") }; });
    var S = { x: stops[0].x, y: stops[0].y, z: stops[0].z }, marks = [];
    // the point (x, y) of the photo, zoomed z times, lands in the middle of the glass
    function render() {
      var G = cam.offsetWidth, W = G * S.z;
      cam.style.backgroundSize = W.toFixed(1) + "px " + W.toFixed(1) + "px";
      cam.style.backgroundPosition = (G / 2 - S.x * W).toFixed(1) + "px " + (G / 2 - S.y * W).toFixed(1) + "px";
    }
    function dot(t) { var k = 0; marks.forEach(function (m, i) { if (t >= m) k = i; }); dots.forEach(function (d, i) { d.classList.toggle("on", i === k); }); }
    gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      sec.classList.add("is-stage");
      // the stops ride on one cell and change by opacity; the reveal layer would hold them visible, so it steps aside
      steps.forEach(function (s, i) { s.classList.remove("reveal"); gsap.set(s, { autoAlpha: i ? 0 : 1, y: i ? 16 : 0 }); });
      S.x = stops[0].x; S.y = stops[0].y; S.z = stops[0].z; render();
      var tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onUpdate: function () { dot(tl.time()); },
        scrollTrigger: { trigger: sec, start: "top top", end: "+=1500", scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onRefresh: render } });
      marks = [0];
      tl.to({}, { duration: .5 });
      for (var i = 1; i < steps.length; i++) {
        tl.addLabel("s" + i)
          .to(S, { x: stops[i].x, y: stops[i].y, z: stops[i].z, duration: 1, onUpdate: render }, "s" + i)
          .to(steps[i - 1], { autoAlpha: 0, y: -16, duration: .35, ease: "power2.in" }, "s" + i)
          .to(steps[i], { autoAlpha: 1, y: 0, duration: .45, ease: "power2.out" }, "s" + i + "+=.4")
          .to({}, { duration: .6 });
        marks.push(tl.labels["s" + i] + .5);
      }
      dot(0);
      return function () {
        sec.classList.remove("is-stage"); cam.style.backgroundSize = ""; cam.style.backgroundPosition = "";
        steps.forEach(function (s) { gsap.set(s, { clearProps: "all" }); s.classList.add("reveal", "is-in"); });
        dots.forEach(function (d) { d.classList.remove("on"); });
      };
    });
  })();
})();
