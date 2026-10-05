/* iLab Diamonds · homepage v2. Page opening (header, then hero), header (MV:hd6 + MV:b65 + drawer), reveal base layer,
   word reveal of the monologue (S16), product tabs (C4), and the signature: the arc of shapes (MV:g151) that filters the jewellery under it. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var D = window.ILAB;
  var IMG = function (id) { return "images/products/" + id + ".webp"; };
  var money = function (n) { return n.toLocaleString("he-IL") + " ₪"; };
  document.querySelectorAll("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- in view: measured directly, an observer does not fire in a throttled tab ---------- */
  function inView(el, f) {
    function chk() { var r = el.getBoundingClientRect(); if (r.top < innerHeight * .9 && r.bottom > 0) { off(); f(); } }
    function off() { removeEventListener("scroll", chk); removeEventListener("resize", chk); }
    addEventListener("scroll", chk, { passive: true }); addEventListener("resize", chk);
    requestAnimationFrame(chk); setTimeout(chk, 300);
  }

  /* ---------- header: height, announcement bar, headroom ---------- */
  var hd = document.getElementById("hd"), bar = hd.querySelector(".hd-bar");

  /* ---------- page opening (engine/motion.md 2): the header comes down first, then the hero, once ---------- */
  if (doc.classList.contains("open-anim")) {
    var opened = false, openNow = function () {
      if (opened) return; opened = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add("is-open"); }); });
      // open-anim and is-open leave together, after the last transition, so nothing drops back to the hidden state
      setTimeout(function () { doc.classList.remove("open-anim", "is-open"); }, 1700);
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(openNow);
    setTimeout(openNow, 600);
  }
  function measure() {
    hd.style.setProperty("--ub", bar.offsetHeight + "px");
    doc.style.setProperty("--hdr", hd.offsetHeight + "px");
  }
  measure(); addEventListener("resize", measure); addEventListener("load", measure);
  var KEY = "ilab-bar-v1";
  try { if (localStorage.getItem(KEY)) { hd.classList.add("is-dismissed"); bar.inert = true; } } catch (e) {}
  hd.querySelector(".hd-close").addEventListener("click", function () {
    hd.classList.add("is-dismissed"); bar.inert = true; try { localStorage.setItem(KEY, "1"); } catch (e) {}
    hd.querySelector(".logo").focus({ preventScroll: true });
  });
  var msgs = [].slice.call(hd.querySelectorAll(".hd-msg")), mi = 0, barPaused = false;
  bar.addEventListener("mouseenter", function () { barPaused = true; }); bar.addEventListener("mouseleave", function () { barPaused = false; });
  bar.addEventListener("focusin", function () { barPaused = true; }); bar.addEventListener("focusout", function () { barPaused = false; });
  if (msgs.length > 1 && !reduced) setInterval(function () {
    if (barPaused || hd.classList.contains("is-dismissed") || doc.classList.contains("a11y-still")) return;
    var cur = msgs[mi], nx = msgs[(mi + 1) % msgs.length];
    cur.classList.remove("on"); cur.classList.add("out"); cur.inert = true;
    nx.classList.remove("out"); nx.classList.add("on"); nx.inert = false;
    setTimeout(function () { cur.classList.remove("out"); }, 450);
    mi = (mi + 1) % msgs.length;
  }, 5000);
  (function headroom() {
    var last = scrollY, raf = 0;
    function upd() {
      raf = 0;
      var y = scrollY, d = y - last, top = hd.offsetHeight + 24;
      hd.classList.toggle("is-scrolled", y > 8);
      var hold = hd.classList.contains("menu-open") || !!hd.querySelector(":focus-visible");
      if (y <= top || hold) { hd.classList.remove("is-hidden"); last = y; return; }
      if (Math.abs(d) < 6) return;
      hd.classList.toggle("is-hidden", d > 0);
      last = y;
    }
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    hd.addEventListener("focusin", upd); upd();
  })();

  /* ---------- mega menus (MV:b65): hover intent, click, keyboard ---------- */
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var megas = [].slice.call(document.querySelectorAll(".mega"));
  function setMega(li, v, focusFirst) {
    var trig = li.querySelector(".nav-trig"), links = li.querySelectorAll(".mg a");
    if (v) megas.forEach(function (o) { if (o !== li) setMega(o, false); });
    li.classList.toggle("open", v); trig.setAttribute("aria-expanded", String(v));
    links.forEach(function (a) { a.tabIndex = v ? 0 : -1; });
    hd.classList.toggle("menu-open", megas.some(function (o) { return o.classList.contains("open"); }));
    if (v && focusFirst && links[0]) setTimeout(function () { links[0].focus(); }, 60);
  }
  megas.forEach(function (li, i) {
    var trig = li.querySelector(".nav-trig"), tOpen, tClose;
    li.querySelectorAll(".mg a").forEach(function (a, j) { a.style.setProperty("--i", j); });
    setMega(li, false);
    trig.addEventListener("click", function () { setMega(li, !li.classList.contains("open")); });
    if (fine) {
      li.addEventListener("mouseenter", function () { clearTimeout(tClose); tOpen = setTimeout(function () { setMega(li, true); }, 80); });
      li.addEventListener("mouseleave", function () { clearTimeout(tOpen); tClose = setTimeout(function () { setMega(li, false); }, 180); });
    }
    trig.addEventListener("keydown", function (e) { if (e.key === "ArrowDown") { e.preventDefault(); setMega(li, true, true); } });
    li.addEventListener("keydown", function (e) { if (e.key === "Escape" && li.classList.contains("open")) { setMega(li, false); trig.focus(); } });
    li.addEventListener("focusout", function (e) { if (!li.contains(e.relatedTarget)) setMega(li, false); });
    li.querySelectorAll(".mg a").forEach(function (a) { a.addEventListener("click", function () { setMega(li, false); }); });
  });
  document.addEventListener("click", function (e) { megas.forEach(function (li) { if (!li.contains(e.target)) setMega(li, false); }); });

  /* ---------- mobile drawer ---------- */
  (function drawer() {
    var root = document.getElementById("md"), burger = hd.querySelector(".burger");
    var panel = root.querySelector(".md-panel"), last = null;
    root.querySelectorAll(".md-item").forEach(function (el, i) { el.style.setProperty("--i", i); });
    panel.inert = true;
    function toggleSub(btn, force) {
      var sub = btn.nextElementSibling, open = force !== undefined ? force : !sub.classList.contains("open");
      sub.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open));
      sub.inert = !open;
    }
    function set(open) {
      root.classList.toggle("open", open); panel.inert = !open;
      burger.setAttribute("aria-expanded", String(open)); hd.classList.toggle("menu-open", open);
      doc.classList.toggle("md-open", open);
      doc.style.scrollbarGutter = open ? "stable" : ""; doc.style.overflow = open ? "hidden" : "";
      if (open) { last = document.activeElement; setTimeout(function () { root.querySelector(".md-close").focus(); }, 180); }
      else { root.querySelectorAll(".md-acc").forEach(function (b) { toggleSub(b, false); }); (last && last !== document.body && last.offsetParent ? last : burger).focus(); }
    }
    root.querySelectorAll(".md-acc").forEach(function (b) { toggleSub(b, false); b.addEventListener("click", function () { toggleSub(b); }); });
    burger.addEventListener("click", function () { set(!root.classList.contains("open")); });
    root.querySelector(".md-close").addEventListener("click", function () { set(false); });
    root.querySelector(".md-scrim").addEventListener("click", function () { set(false); });
    root.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    addEventListener("keydown", function (e) {
      if (!root.classList.contains("open")) return;
      if (e.key === "Escape") { set(false); return; }
      if (e.key !== "Tab") return;
      var f = [].slice.call(panel.querySelectorAll("a,button")).filter(function (x) { return !x.closest("[inert]") && x.offsetParent !== null; });
      var i = f.indexOf(document.activeElement);
      var n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i === f.length - 1 ? 0 : i + 1);
      e.preventDefault(); f[n].focus();
    });
  })();

  document.querySelectorAll("#hero .rv").forEach(function (el, i) { el.style.setProperty("--i", i); });

  /* ---------- the monologue comes in word by word (library/sections.md S16) ---------- */
  document.querySelectorAll(".words").forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--w:' + i + '">' + w + "</span></span>"; }).join(" ");
    inView(h, function () { h.classList.add("is-in"); });
  });

  /* ---------- reveal base layer ---------- */
  function revealAll(scope) {
    var els = (scope || document).querySelectorAll(".reveal:not(.is-in)");
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } }); }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
    // a block reached by Tab is shown at once: the trigger may never fire at the edge of the screen
    document.addEventListener("focusin", function (e) { var r = e.target.closest && e.target.closest(".reveal"); if (r) r.classList.add("is-in"); });
  }

  /* ---------- product cards ---------- */
  function swatches(g) {
    return '<span class="swatches" aria-hidden="true">' + ["w", "y", "r"].map(function (k) { return '<i class="' + k + (k === g ? " on" : "") + '"></i>'; }).join("") + "</span>";
  }
  function card(id) {
    var p = D.products[id]; if (!p) return "";
    var label = (p.m ? p.m + ", " : "") + p.t;
    // a product without a surface: image, name, price, then the metals, all on one centred axis (library/sections.md S4)
    return '<article class="card reveal">' +
      '<a class="card-a" href="' + (D.pages && D.pages[id] || "#picks") + '" aria-label="' + label + ", " + money(p.p) + '">' +
      '<span class="card-img"><img src="' + IMG(id) + '" alt="" width="1000" height="1000" loading="lazy"></span>' +
      '<span class="card-model">' + (p.m || "&nbsp;") + '</span><span class="card-title">' + p.t + '</span><span class="price">' + money(p.p) + "</span>" +
      swatches(p.g) + "</a>" +
      '<button class="card-fav" type="button" aria-pressed="false" aria-label="הוספה למועדפים: ' + label + '"><svg class="ic" aria-hidden="true"><use href="#i-heart"/></svg></button></article>';
  }
  function mini(id) {
    var p = D.products[id]; if (!p) return "";
    return '<a class="mini" href="#picks"><span class="mini-img"><img src="' + IMG(id) + '" alt="" width="1000" height="1000" loading="lazy"></span>' +
      (p.m ? '<span class="mini-m">' + p.m + "</span>" : "") + '<span class="mini-t">' + p.t + '</span><span class="price">' + money(p.p) + "</span></a>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".card-fav"); if (!b) return;
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
  });

  /* ---------- tabs (C4) ---------- */
  var grid = document.querySelector("[data-grid]"), tabs = grid ? [].slice.call(document.querySelectorAll(".tab")) : [];
  function show(key, animate) {
    var paint = function () {
      grid.innerHTML = D.tabs[key].map(card).join("");
      grid.querySelectorAll(".card").forEach(function (c, i) { c.style.setProperty("--i", i); });
      if (animate) grid.querySelectorAll(".card").forEach(function (c) { c.classList.add("is-in"); });
      grid.classList.remove("fading");
      snapSoon();
    };
    if (animate && !reduced) { grid.classList.add("fading"); setTimeout(paint, 220); } else paint();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      tabs.forEach(function (o) { var on = o === t; o.setAttribute("aria-selected", String(on)); o.tabIndex = on ? 0 : -1; });
      grid.setAttribute("aria-labelledby", t.id); show(t.dataset.tab, true);
    });
    t.addEventListener("keydown", function (e) {
      // RTL: the next tab sits to the left
      var d = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0; if (!d) return;
      e.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); n.click();
    });
  });
  if (grid) show("picks", false);

  /* ---------- the signature: arc of shapes (MV:g151), filtering the jewellery below ---------- */
  var arc = document.querySelector(".ac") && (function () {
    var root = document.querySelector(".ac"), stage = root.querySelector(".ac-stage"), cards = [].slice.call(root.querySelectorAll(".ac-card")), n = cards.length;
    var cap = root.querySelector(".ac-cap"), capT = root.querySelector(".ac-t"), capM = root.querySelector(".ac-m");
    var row = root.querySelector("[data-mini]"), nameEl = root.querySelector("[data-shape-name]"), allLink = root.querySelector("[data-shape-all]");
    var coarse = matchMedia("(pointer: coarse)").matches;
    var S = { pos: 0 }, R = 900, step = .2, vis = 2.6, active = -1, tween = null, auto = null, userPaused = true, hover = false, seen = false, shopT = 0;
    var wrap = function (v) { v = ((v % n) + n) % n; return v > n / 2 ? v - n : v; };
    function measureArc() {
      var W = stage.offsetWidth, cw = cards[0].offsetWidth;
      R = Math.max(W * .95, cw * 4.2); step = (cw + Math.max(16, cw * .16)) / R; vis = W < 768 ? 1.7 : 2.6; render();
    }
    function paintShop(i) {
      var c = cards[i], ids = D.shapes[c.dataset.k] || [];
      nameEl.textContent = c.dataset.t;
      allLink.firstChild.nodeValue = "לכל התכשיטים בחיתוך " + c.dataset.t;
      row.innerHTML = ids.length ? ids.map(mini).join("") :
        '<div class="mini-empty">חיתוך ' + c.dataset.t + ' משובץ אצלנו בהזמנה אישית. ספרו לנו מה אתם מחפשים, ונחזור עם אבנים שמתאימות.<a class="btn btn-primary" href="#visit">לתיאום פגישה</a></div>';
      row.classList.remove("fading");
    }
    function shop(i) {
      clearTimeout(shopT);
      if (reduced) { paintShop(i); return; }
      row.classList.add("fading");
      shopT = setTimeout(function () { paintShop(i); }, 240);
    }
    function render() {
      cards.forEach(function (c, i) {
        var rel = wrap(i - S.pos), a = rel * step, far = Math.abs(rel);
        gsap.set(c, { x: -Math.sin(a) * R, y: R * (1 - Math.cos(a)), rotation: -a * 57.2958, scale: 1 + .07 * Math.max(0, 1 - far),
          opacity: far > vis ? 0 : Math.min(1, vis - far + .35), zIndex: 100 - Math.round(far * 10) });
      });
      var i = ((Math.round(S.pos) % n) + n) % n;
      if (i !== active) {
        var first = active === -1; active = i;
        cards.forEach(function (c, k) { c.classList.toggle("on", k === i); c.setAttribute("aria-hidden", k === i ? "false" : "true"); });
        capT.textContent = cards[i].dataset.t; capM.textContent = cards[i].dataset.m;
        if (!reduced && !first) { cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap"); }
        if (first) paintShop(i); else shop(i);
      }
    }
    function go(target, dur) {
      if (tween) tween.kill();
      tween = gsap.to(S, { pos: target, duration: reduced ? .01 : (dur || .9), ease: dur ? "power3.out" : "power3.inOut", onUpdate: render, onComplete: schedule });
    }
    var step1 = function (d) { go(Math.round(S.pos) + d); };
    function schedule() {
      if (auto) auto.kill(); auto = null;
      if (userPaused || hover || !seen || document.hidden || root.contains(document.activeElement) || doc.classList.contains("a11y-still")) return;
      auto = gsap.delayedCall(3.6, function () { step1(1); });
    }
    function stop() { if (auto) auto.kill(); auto = null; }
    root.querySelector(".ac-next").addEventListener("click", function () { stop(); step1(1); });
    root.querySelector(".ac-prev").addEventListener("click", function () { stop(); step1(-1); });
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); stop(); step1(1); }
      if (e.key === "ArrowRight") { e.preventDefault(); stop(); step1(-1); }
    });
    root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hover = true; stop(); } });
    root.addEventListener("pointerleave", function () { hover = false; schedule(); });
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function () { setTimeout(schedule, 0); });
    var drag = null;
    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return; stop(); if (tween) tween.kill();
      drag = { x0: e.clientX, y0: e.clientY, p0: S.pos, lx: e.clientX, lt: performance.now(), v: 0, moved: false, card: e.target.closest(".ac-card") };
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener("pointermove", function (e) {
      if (!drag) return; var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { drag = null; schedule(); return; }
      if (Math.abs(dx) > 4) drag.moved = true;
      var now = performance.now(); drag.v = (e.clientX - drag.lx) / Math.max(1, now - drag.lt); drag.lx = e.clientX; drag.lt = now;
      S.pos = drag.p0 + dx / (step * R); render();
    });
    function release() {
      if (!drag) return; var d = drag; drag = null;
      if (!d.moved) { if (d.card) { var i = cards.indexOf(d.card); go(Math.round(S.pos + wrap(i - S.pos))); } else schedule(); return; }
      go(Math.round(S.pos + d.v * 260 / (step * R)), .7);
    }
    stage.addEventListener("pointerup", release); stage.addEventListener("pointercancel", release);
    new ResizeObserver(measureArc).observe(stage);
    new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (seen) schedule(); else stop(); }, { threshold: .4 }).observe(stage);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else schedule(); });
    // the arc moves only when the visitor moves it: no auto-advance, so no play/pause button (Liav, 5.10.2026; WCAG 2.2.2)
    measureArc();
    return { to: function (i) { stop(); go(Math.round(S.pos + wrap(i - S.pos))); } };
  })();
  // the shape links in the mega menu turn the arc to that shape
  document.querySelectorAll("[data-shape]").forEach(function (a) {
    if (arc) a.addEventListener("click", function () { var i = +a.dataset.shape; setTimeout(function () { arc.to(i); }, 500); });
  });

  /* ---------- newsletter ---------- */
  (function () {
    var f = document.querySelector(".ft-form"), i = f.querySelector("input"), m = f.querySelector(".ft-msg");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim())) { m.className = "ft-msg err"; m.textContent = "נראה שחסר משהו בכתובת. אפשר לבדוק שוב?"; i.setAttribute("aria-invalid", "true"); i.focus(); return; }
      i.removeAttribute("aria-invalid"); m.className = "ft-msg"; m.textContent = "נרשמתם. הדגמים החדשים יגיעו אליכם למייל."; f.reset();
    });
  })();
  document.querySelector(".hd-search").addEventListener("submit", function (e) { e.preventDefault(); });


  /* ---------- the loupe (MV:G11, approved 4.10.2026): the glass shows the photo under it, enlarged ---------- */
  // where the picture really is inside its box (object-fit cover/contain and object-position), in client pixels
  function shownRect(img) {
    var b = img.getBoundingClientRect(), cs = getComputedStyle(img), nw = img.naturalWidth || b.width, nh = img.naturalHeight || b.height;
    var fit = cs.objectFit, k = fit === "contain" ? Math.min(b.width / nw, b.height / nh) : fit === "cover" ? Math.max(b.width / nw, b.height / nh) : 0;
    if (!k) return { x: b.left, y: b.top, w: b.width, h: b.height };
    var pos = cs.objectPosition.split(" ").map(parseFloat), w = nw * k, h = nh * k;
    return { x: b.left + (b.width - w) * (pos[0] || 50) / 100, y: b.top + (b.height - h) * (pos[1] || 50) / 100, w: w, h: h };
  }
  // put the lens with its centre on client point (px, py) over img, inside its positioned box
  function lensAt(lens, img, px, py, zoom) {
    var box = lens.offsetParent.getBoundingClientRect(), L = lens.offsetWidth, r = shownRect(img), inner = lens.firstElementChild;
    lens.style.transform = "translate(" + (px - box.left - L / 2).toFixed(1) + "px," + (py - box.top - L / 2).toFixed(1) + "px)";
    var src = img.currentSrc || img.src; if (inner.dataset.src !== src) { inner.style.backgroundImage = 'url("' + src + '")'; inner.dataset.src = src; }
    inner.style.backgroundSize = (r.w * zoom).toFixed(1) + "px " + (r.h * zoom).toFixed(1) + "px";
    inner.style.backgroundPosition = (L / 2 - (px - r.x) * zoom).toFixed(1) + "px " + (L / 2 - (py - r.y) * zoom).toFixed(1) + "px";
  }
  (function heroLoupe() {
    var vis = document.querySelector(".hero-vis"); if (!vis) return;
    var img = vis.querySelector("img"), lens = vis.querySelector(".loupe"), notes = [].slice.call(vis.querySelectorAll(".gem-note"));
    // the notes sit on a point of the jewellery, given as a fraction of the photo, whatever the crop
    function placeNotes() {
      var r = shownRect(img), box = vis.getBoundingClientRect();
      notes.forEach(function (n) {
        var x = r.x - box.left + r.w * +n.dataset.ix, y = r.y - box.top + r.h * +n.dataset.iy, dot = n.querySelector("i");
        // RTL: the dot is the first item, at the right end of the note; its centre lands on the point.
        // A note that would leave the photo on the left turns around and opens to the right of its dot
        // the note opens to the side that has room for it, and stays hidden when neither side does
        n.classList.remove("flip"); n.hidden = false;
        var need = n.offsetWidth + 16;
        if (x < need) { if (box.width - x >= need) n.classList.add("flip"); else n.hidden = true; }
        if (n.hidden) return;
        var dx = dot.offsetLeft + dot.offsetWidth / 2, dy = n.offsetHeight / 2;
        n.style.transform = "translate(" + Math.round(x - dx) + "px," + Math.round(y - dy) + "px)";
      });
    }
    placeNotes(); img.addEventListener("load", placeNotes); addEventListener("resize", placeNotes);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeNotes);
    var mq = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)"), raf = 0, last = null;
    function draw() { raf = 0; if (last) lensAt(lens, img, last.x, last.y, 2.2); }
    vis.addEventListener("pointermove", function (e) {
      if (!mq.matches || e.pointerType !== "mouse") return;
      vis.classList.add("has-loupe", "is-looking", "was-used"); last = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(draw);
    });
    vis.addEventListener("pointerleave", function () { vis.classList.remove("is-looking"); });
    addEventListener("scroll", function () { if (vis.classList.contains("is-looking")) vis.classList.remove("is-looking"); }, { passive: true });
  })();

  /* ---------- the same diamond (MV:G18, approved 4.10.2026): pinned on desktop, scrubbed without a pin on the phone ---------- */
  (function sameDiamond() {
    var scene = document.querySelector(".scene"); if (!scene || !window.gsap || !window.ScrollTrigger || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    var stage = scene.querySelector(".scene-stage"), gems = [].slice.call(scene.querySelectorAll(".gem")), imgs = gems.map(function (g) { return g.querySelector("img"); });
    var caps = scene.querySelectorAll(".gem figcaption"), t1 = scene.querySelector(".scene-t1"), t2 = scene.querySelector(".scene-t2"), end = scene.querySelector(".scene-end");
    var lens = scene.querySelector(".scene-lens"), S = { p: 0, a: 0 };
    function centre(i) { var r = imgs[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .46 }; }
    function render() {
      lens.style.opacity = S.a; if (S.a <= 0) return;
      var a = centre(0), b = centre(1), x = a.x + (b.x - a.x) * S.p, y = a.y + (b.y - a.y) * S.p - Math.sin(S.p * Math.PI) * 28;
      var i = Math.abs(x - a.x) < Math.abs(x - b.x) ? 0 : 1;   // the glass shows the stone it is over
      lensAt(lens, imgs[i], x, y, 1.9);
    }
    function settle() { if (window.ILAB_SNAP) window.ILAB_SNAP(scene); }
    function scenes(pinned) {
      var tl = gsap.timeline({ defaults: { ease: "power2.out" }, onUpdate: render, scrollTrigger: pinned
        ? { trigger: scene, start: "top top", end: "+=1500", scrub: 1, pin: true, anticipatePin: 1, onRefresh: render, onLeave: settle, onLeaveBack: settle }
        : { trigger: stage, start: "top 80%", end: "bottom 30%", scrub: 1, onRefresh: render, onLeave: settle } });
      tl.eventCallback("onComplete", settle);
      tl.to(gems, { autoAlpha: 1, y: 0, stagger: .15, duration: .6 })
        .to(S, { a: 1, duration: .2 })
        // the glass rests on the first stone, crosses the gap quickly, rests on the second
        .to(S, { p: 0, duration: .5 })
        .to(S, { p: 1, duration: .5, ease: "none" })
        .to(S, { p: 1, duration: .5 });
      if (pinned) tl.to(t1, { autoAlpha: 0, y: -16, duration: .4 }).to(t2, { autoAlpha: 1, y: 0, duration: .5 });
      tl.to(S, { a: 0, duration: .3 }, pinned ? "<" : ">")
        .to(caps, { autoAlpha: 1, y: 0, stagger: .15, duration: .5 });
      if (pinned) tl.to(end, { autoAlpha: 1, y: 0, duration: .5 });
      return tl;
    }
    var mm = gsap.matchMedia();
    mm.add({ desk: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)", mob: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)" }, function (ctx) {
      var desk = ctx.conditions.desk;
      if (desk) { scene.classList.add("is-stage"); gsap.set(t1, { autoAlpha: 1, y: 0 }); gsap.set(t2, { autoAlpha: 0, y: 16 }); gsap.set(end, { autoAlpha: 0, y: 16 }); }
      gsap.set(gems, { autoAlpha: 0, y: 24 }); gsap.set(caps, { autoAlpha: 0, y: 12 }); S.p = 0; S.a = 0;
      scenes(desk);
      return function () { scene.classList.remove("is-stage"); gsap.set([t1, t2, end, gems, caps], { clearProps: "all" }); lens.style.opacity = 0; };
    });
  })();

  /* ---------- the reviews wall (approved 5.10.2026): columns travel with the scroll at their own speed, the middle one the
     other way. Only with motion allowed and GSAP present; otherwise the wall stays whole and still ---------- */
  (function reviewsWall() {
    var wall = document.querySelector(".rw:not(.rw-still)"); if (!wall || !window.gsap || !window.ScrollTrigger || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    var cols = [].slice.call(wall.querySelectorAll(".rw-col"));
    // per width: the third column is hidden on narrow screens, and a hidden column must not get a tween that never moves
    gsap.matchMedia().add({ wide: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)", narrow: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)" }, function () {
      wall.classList.add("is-moving");
      var live = cols.filter(function (c) { return c.offsetParent !== null; });
      live.forEach(function (c) {
        var sp = +c.dataset.speed || 1, k = Math.min(1, Math.abs(sp));
        // how far the column can travel inside the window of the wall; never less than a little, so every column lives
        var room = function () { return Math.max(48, c.offsetHeight - wall.clientHeight); };
        gsap.fromTo(c, { y: function () { return sp > 0 ? 0 : -room() * k; } }, { y: function () { return sp > 0 ? -room() * k : 0; }, ease: "none",
          // whole device pixels only: the stars and pictures inside stay sharp while the column travels
          modifiers: { y: function (v) { var d = window.devicePixelRatio || 1; return (Math.round(parseFloat(v) * d) / d) + "px"; } },
          scrollTrigger: { trigger: wall, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });
      });
      return function () { wall.classList.remove("is-moving"); gsap.set(cols, { clearProps: "transform" }); };
    });
  })();

  /* ---------- anatomy of a certificate (approved 4.10.2026): each line of the report, told in plain words ---------- */
  (function certificate() {
    var rows = [].slice.call(document.querySelectorAll(".report-row")), box = document.getElementById("cert-explain"); if (!rows.length || !box) return;
    var t = box.querySelector(".cert-ex-t"), m = box.querySelector(".cert-ex-m");
    var fine = matchMedia("(hover: hover) and (pointer: fine)");
    // Latin letters inside the Hebrew text get the Latin face, like everywhere else on the page
    function rich(s) { return s.replace(/[A-Za-z][A-Za-z0-9./×]*(?:\s[A-Z][A-Za-z]*)*/g, function (w) { return '<span class="lat">' + w + "</span>"; }); }
    function pick(row) {
      if (row.classList.contains("is-on")) return;
      rows.forEach(function (r) { var on = r === row; r.classList.toggle("is-on", on); r.setAttribute("aria-pressed", String(on)); });
      t.textContent = row.dataset.t; m.innerHTML = rich(row.dataset.m);
      if (!reduced) { box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap"); }
    }
    rows.forEach(function (r, i) {
      r.addEventListener("click", function () { pick(r); });
      r.addEventListener("focus", function () { pick(r); });
      r.addEventListener("pointerenter", function (e) { if (fine.matches && e.pointerType === "mouse") pick(r); });
      r.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0; if (!d) return;
        e.preventDefault(); rows[(i + d + rows.length) % rows.length].focus();
      });
    });
  })();

  /* ---------- the guides index (approved 4.10.2026): a picture floats by the pointer over the row ---------- */
  (function guidesIndex() {
    var sec = document.querySelector(".guides"), list = sec && sec.querySelector(".gl"); if (!list) return;
    var fl = sec.querySelector(".gl-float"), img = fl.querySelector("img");
    var mq = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    var pos = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, raf = 0, on = false;
    function tick() {
      // eases toward the pointer (no lag under reduced motion)
      var k = reduced ? 1 : .18; pos.x += (aim.x - pos.x) * k; pos.y += (aim.y - pos.y) * k;
      fl.style.transform = "translate(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px)";
      raf = on && (Math.abs(aim.x - pos.x) > .3 || Math.abs(aim.y - pos.y) > .3) ? requestAnimationFrame(tick) : 0;
    }
    list.addEventListener("pointermove", function (e) {
      if (!mq.matches || e.pointerType !== "mouse") return;
      var row = e.target.closest(".gl-row"); if (!row) return;
      var b = sec.getBoundingClientRect(), w = fl.offsetWidth, h = fl.offsetHeight;
      // the picture sits beside the pointer, on the side of the list away from the text, and never leaves the section
      aim.x = Math.min(Math.max(e.clientX - b.left - w - 32, 0), b.width - w); aim.y = e.clientY - b.top - h / 2;
      if (!on) { pos.x = aim.x; pos.y = aim.y; on = true; sec.classList.add("is-floating"); }
      if (img.getAttribute("src") !== row.dataset.img) img.setAttribute("src", row.dataset.img);
      if (!raf) raf = requestAnimationFrame(tick);
    });
    list.addEventListener("pointerleave", function () { on = false; sec.classList.remove("is-floating"); });
  })();

  /* ---------- anchors glide (no CSS smooth scroll: it breaks a ScrollTrigger refresh mid-page) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented) return;
    var id = a.getAttribute("href"); if (id.length < 2) return;
    var t = document.querySelector(id); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", id);
    if (t.matches("main")) t.focus({ preventScroll: true });
  });

  /* ---------- icons on whole pixels (1.10.2026): an icon that lands on x.42 is drawn across two pixel rows and looks soft.
     Each icon is nudged by its own fraction of a device pixel with the translate property (hover transforms stay free).
     Runs after layout changes: load, fonts, resize, every finished entrance, and new cards. ---------- */
  var snapT = 0;
  function snapIcons(scope) {
    var dpr = window.devicePixelRatio || 1;
    (scope || document).querySelectorAll("svg.ic, svg.arr").forEach(function (el) {
      el.style.translate = "";
      var r = el.getBoundingClientRect(); if (!r.width) return;
      // page coordinates, not screen ones: a fraction of the scroll position must not leak into the snap
      var x = r.left + scrollX, y = r.top + scrollY;
      if (getComputedStyle(el.closest(".hd-wrap, .fabs, .md") || document.body).position === "fixed") { x = r.left; y = r.top; }
      var dx = Math.round(x * dpr) / dpr - x, dy = Math.round(y * dpr) / dpr - y;
      if (Math.abs(dx) > .01 || Math.abs(dy) > .01) el.style.translate = dx.toFixed(3) + "px " + dy.toFixed(3) + "px";
    });
  }
  function snapSoon() { clearTimeout(snapT); snapT = setTimeout(function () { snapIcons(); }, 120); }
  window.ILAB_SNAP = snapIcons;
  // shared with the inner pages (js/product.js)
  window.ILAB_UI = { card: card, money: money, lensAt: lensAt, shownRect: shownRect, inView: inView, snapSoon: snapSoon, reduced: reduced };
  addEventListener("load", snapSoon); addEventListener("resize", snapSoon);
  // any change of layout (a lazy image arriving, a tab repainting, text scaled by the a11y toolbar) moves what is below it
  if (window.ResizeObserver) new ResizeObserver(snapSoon).observe(document.body);
  document.addEventListener("load", function (e) { if (e.target.tagName === "IMG") snapSoon(); }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(snapSoon);
  document.addEventListener("animationend", function (e) { if (e.target.querySelector) snapIcons(e.target); });
  document.addEventListener("transitionend", function (e) { if (e.propertyName === "translate" || e.propertyName === "transform") { if (e.target.querySelector && !e.target.closest(".hd")) snapIcons(e.target); } });
  revealAll();
})();
