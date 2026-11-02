/* Site UI: sticky nav, mobile menu, project galleries in a lightbox. The intro film lives in film.js. */
(function () {
  'use strict';
  var doc = document;
  var capture = doc.documentElement.classList.contains('capture');
  if (capture) Array.prototype.forEach.call(doc.images, function (im) { im.loading = 'eager'; });

  // ---- nav: border once it sticks, mobile menu ----
  var nav = doc.getElementById('nav');
  var menuBtn = doc.getElementById('menu-btn');
  if (nav && 'IntersectionObserver' in window && !capture) {
    var sentinel = doc.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
    nav.parentNode.insertBefore(sentinel, nav);
    new IntersectionObserver(function (e) {
      nav.classList.toggle('stuck', !e[0].isIntersecting && e[0].boundingClientRect.top < 0);
    }).observe(sentinel);
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    var closeMenu = function (focusBtn) {
      if (!nav.classList.contains('open')) return;
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Mở menu');
      if (focusBtn) menuBtn.focus();
    };
    doc.getElementById('links').addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    doc.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeMenu(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(true); });
    window.addEventListener('scroll', function () { closeMenu(); }, { passive: true });
  }

  // ---- floating Zalo and back-to-top: shown once the page has been scrolled ----
  var fabGroup = doc.getElementById('fab-group'), fabTop = doc.getElementById('fab-top');
  if (fabGroup && !capture) {
    var siteTop = doc.getElementById('site');
    var checkFab = function () {
      var y = window.scrollY || doc.documentElement.scrollTop || 0;
      var start = siteTop ? siteTop.offsetTop : 0;
      fabGroup.classList.toggle('fab-hidden', y < start + 350);
    };
    window.addEventListener('scroll', checkFab, { passive: true });
    window.addEventListener('resize', checkFab);
    checkFab();
    if (fabTop) fabTop.addEventListener('click', function () {
      if (siteTop) siteTop.scrollIntoView({ behavior: 'smooth' }); else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- projects: each card opens its own gallery (photos and videos) in the lightbox ----
  // Photos are fetched and decoded before they are shown (neighbours ahead of time), so "next" always
  // answers at once: the old photo slides out, a spinner shows if the new one is still on its way.
  var lb = doc.getElementById('lb'), lbImg = doc.getElementById('lb-img'), lbVid = doc.getElementById('lb-vid');
  var lbFig = lb ? lb.querySelector('figure') : null;
  var lbT = doc.getElementById('lb-t'), lbD = doc.getElementById('lb-d'), lbC = doc.getElementById('lb-c');
  var lbP = doc.getElementById('lb-p'), lbN = doc.getElementById('lb-n');
  var set = [], setTitle = '', cur = 0, lastFocus = null, token = 0, loadTimer = 0;
  var cache = {};
  if (lb) { var spin = doc.createElement('span'); spin.className = 'lb-spin'; spin.setAttribute('aria-hidden', 'true'); lb.appendChild(spin); }
  function preload(src) {
    if (!src) return Promise.resolve(null);
    if (!cache[src]) cache[src] = new Promise(function (res) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).then(function () { res(im); }, function () { res(im); }); };
      im.onerror = function () { res(null); };
      im.src = src;
    });
    return cache[src];
  }
  function stopVideo() {
    if (!lbVid || lbVid.hidden) return;
    lbVid.pause(); lbVid.removeAttribute('src'); lbVid.load(); lbVid.hidden = true;
  }
  function caption(it) {
    lbT.textContent = it.t; lbD.textContent = it.d;
    lbC.textContent = setTitle + (set.length > 1 ? ' · ' + (cur + 1) + '/' + set.length : '');
  }
  function settle(dir) {
    // slide the figure in from the side it was asked from
    lbFig.classList.remove('go-l', 'go-r', 'drag');
    if (dir) {
      lbFig.classList.add(dir > 0 ? 'from-r' : 'from-l');
      void lbFig.offsetWidth;
      lbFig.classList.remove('from-r', 'from-l');
    }
    lbFig.style.transform = '';
  }
  function show(i, dir) {
    if (!set.length) return;
    cur = (i + set.length) % set.length;
    var it = set[cur], my = ++token;
    clearTimeout(loadTimer);
    lb.classList.remove('is-loading');
    if (it.video && lbVid) {
      lbImg.hidden = true; lbImg.removeAttribute('src');
      lbVid.hidden = false; lbVid.poster = it.poster || ''; lbVid.src = it.src;
      var pl = lbVid.play(); if (pl && pl.catch) pl.catch(function () {});
      caption(it); settle(dir);
    } else {
      stopVideo();
      if (dir && !lbImg.hidden && lbImg.getAttribute('src')) lbFig.classList.add(dir > 0 ? 'go-l' : 'go-r');
      loadTimer = setTimeout(function () { if (my === token) lb.classList.add('is-loading'); }, 140);
      preload(it.src).then(function () {
        if (my !== token) return;
        clearTimeout(loadTimer);
        lb.classList.remove('is-loading');
        lbImg.hidden = false; lbImg.src = it.src; lbImg.alt = it.t;
        caption(it); settle(dir);
      });
    }
    // fetch the neighbours now, the rest of the album after
    if (set.length > 1) {
      [cur + 1, cur - 1, cur + 2].forEach(function (k) { var n = set[(k + set.length) % set.length]; if (!n.video) preload(n.src); });
    }
  }
  function openSet(card) {
    set = Array.prototype.map.call(card.querySelectorAll('.pf-items li'), function (li) {
      return { src: li.getAttribute('data-src'), t: li.getAttribute('data-t'), d: li.getAttribute('data-d'),
               video: li.getAttribute('data-type') === 'video', poster: li.getAttribute('data-poster') };
    });
    if (!set.length) return;
    setTitle = card.querySelector('h4').textContent;
    lastFocus = doc.activeElement;
    lbP.hidden = lbN.hidden = set.length < 2;
    lbImg.removeAttribute('src'); lbImg.hidden = true;
    show(0, 0);
    lb.hidden = false;
    doc.body.style.overflow = 'hidden';
    doc.getElementById('lb-x').focus();
    doc.dispatchEvent(new CustomEvent('npt:lightbox', { detail: true }));
  }
  function close() {
    token++; clearTimeout(loadTimer); lb.classList.remove('is-loading');
    stopVideo();
    lb.hidden = true; doc.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
    doc.dispatchEvent(new CustomEvent('npt:lightbox', { detail: false }));
  }
  // albums opened from elsewhere (the Video & Motion service: three real-estate clips)
  Array.prototype.forEach.call(doc.querySelectorAll('[data-album]'), function (b) {
    b.addEventListener('click', function () { var a = doc.getElementById(b.getAttribute('data-album')); if (a) openSet(a); });
  });
  // the service clip plays (muted, looping) only while it is on screen
  Array.prototype.forEach.call(doc.querySelectorAll('video.svc-loop'), function (v) {
    if (capture || !('IntersectionObserver' in window)) return;
    var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting && !rm) {
        if (!v.getAttribute('src')) { v.src = v.getAttribute('data-src'); }
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      } else if (!v.paused) v.pause();
    }, { threshold: 0.3 }).observe(v);
    v.addEventListener('click', function () { var a = doc.getElementById('album-bds'); if (a) openSet(a); });
  });
  function firstSrc(card) { var li = card && card.querySelector('.pf-items li:not([data-type="video"])'); return li && li.getAttribute('data-src'); }
  Array.prototype.forEach.call(doc.querySelectorAll('[data-pf]'), function (b) {
    var card = b.closest('.pf-card');
    b.addEventListener('click', function () { openSet(card); });
    // warm the first photo while the visitor is about to tap
    b.addEventListener('pointerenter', function () { preload(firstSrc(card)); }, { passive: true });
    b.addEventListener('touchstart', function () { preload(firstSrc(card)); }, { passive: true });
  });
  // ---- fanned deck: turns on its own, the caption names the group in front; arrows, dots, a tap or a swipe turn it ----
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fanBox = doc.querySelector('.fan'), deck = doc.querySelector('.fan-deck');
  if (deck && fanBox) {
    var fan = Array.prototype.slice.call(deck.querySelectorAll('.fan-card')), nf = fan.length, front = Math.floor(nf / 2);
    var cap = fanBox.querySelector('.fan-cap'), capN = fanBox.querySelector('.fan-n'), capG = fanBox.querySelector('.fan-g'),
        capC = fanBox.querySelector('.fan-c'), capT = fanBox.querySelector('.fan-t span'), dots = Array.prototype.slice.call(fanBox.querySelectorAll('.fan-dot'));
    var FAN_MS = 3800, timer = 0, inView = false, hold = 0, hover = false;
    fanBox.style.setProperty('--fan-ms', FAN_MS + 'ms');
    var layFan = function (animate) {
      fan.forEach(function (c, i) {
        var k = ((i - front) % nf + nf) % nf; if (k > nf / 2) k -= nf;
        var old = c._k;
        if (animate && old != null && Math.abs(k - old) > 1) c.classList.add('fan-wrap');   // the card going round the back fades instead of sweeping across
        c.style.setProperty('--k', k); c.style.setProperty('--a', Math.abs(k)); c.setAttribute('data-k', k); c._k = k;
        c.tabIndex = k === 0 ? 0 : -1;
      });
      if (animate) requestAnimationFrame(function () { requestAnimationFrame(function () { fan.forEach(function (c) { c.classList.remove('fan-wrap'); }); }); });
      var f = fan[front];
      if (cap) {
        capN.textContent = (front + 1 < 10 ? '0' : '') + (front + 1);
        capG.textContent = f.getAttribute('data-g') || '';
        capC.textContent = f.getAttribute('data-n') || '';
        capT.textContent = (f.getAttribute('aria-label') || '').split(',')[0];
        if (animate) { cap.classList.remove('swap'); void cap.offsetWidth; cap.classList.add('swap'); }
      }
      dots.forEach(function (d, i) { if (i === front) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    };
    var restartBar = function () { var d = dots[front]; if (!d) return; fanBox.classList.remove('playing'); void d.offsetWidth; };
    var schedule = function () {
      clearTimeout(timer);
      var play = !reduceMotion && !/[?&]noauto\b/.test(location.search) && inView && !hover && !doc.hidden && Date.now() > hold && (!lb || lb.hidden);
      restartBar();
      if (!play) { if (Date.now() <= hold && inView) timer = setTimeout(schedule, hold - Date.now() + 30); return; }
      fanBox.classList.add('playing');
      timer = setTimeout(function () { turn(1, true); }, FAN_MS);
    };
    var turn = function (step, auto) {
      front = (front + step + nf) % nf;
      layFan(true);
      if (!auto) hold = Date.now() + 7000;      // a visitor's own turn pauses the autoplay for a while
      schedule();
    };
    layFan(false);
    Array.prototype.forEach.call(fanBox.querySelectorAll('.fan-nav'), function (b) {
      b.addEventListener('click', function () { turn(Number(b.getAttribute('data-step'))); });
    });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { turn(i - front); }); });
    var openFront = function () { var card = doc.getElementById(fan[front].getAttribute('data-open')); if (card) openSet(card); };
    fan.forEach(function (c, i) {
      c.addEventListener('click', function () {
        if (c.getAttribute('data-k') !== '0') { turn(i - front); return; }
        openFront();
      });
    });
    if (fanBox.querySelector('.fan-t')) fanBox.querySelector('.fan-t').addEventListener('click', openFront);
    // swipe the deck on phones
    var fx0 = null;
    deck.addEventListener('touchstart', function (e) { fx0 = e.touches[0].clientX; hold = Date.now() + 7000; schedule(); }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      if (fx0 === null) return;
      var dx = e.changedTouches[0].clientX - fx0; fx0 = null;
      if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1);
    });
    if (window.matchMedia && matchMedia('(hover: hover)').matches) {
      fanBox.addEventListener('mouseenter', function () { hover = true; schedule(); });
      fanBox.addEventListener('mouseleave', function () { hover = false; schedule(); });
    }
    fanBox.addEventListener('focusin', function () { hold = Date.now() + 7000; schedule(); });
    doc.addEventListener('visibilitychange', schedule);
    doc.addEventListener('npt:lightbox', schedule);
    // warm the front group's first photo
    fan.forEach(function (c) { c.addEventListener('pointerenter', function () { preload(firstSrc(doc.getElementById(c.getAttribute('data-open')))); }, { passive: true }); });
    if ('IntersectionObserver' in window && !capture) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(fanBox);
    }
  }

  // ---- project tabs: one group at a time ----
  var tabs = Array.prototype.slice.call(doc.querySelectorAll('.pf-tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = doc.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    var grid = doc.querySelector('#' + tab.getAttribute('aria-controls') + ' .pf-grid');
    if (grid) grid.scrollLeft = 0;
    var bar = tab.parentNode;   // phones: the tab row scrolls sideways, keep the chosen tab in view
    if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: tab.offsetLeft - bar.offsetLeft - 16, behavior: 'smooth' });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (k) { e.preventDefault(); selectTab(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
  });

  // ---- grading palette: the sliders settle into place once the section is in view ----
  var grade = doc.getElementById('grade');
  if (grade && !capture && !reduceMotion && 'IntersectionObserver' in window) {
    doc.documentElement.classList.add('js-anim');
    var gradeIO = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return;
      setTimeout(function () { grade.classList.add('go'); }, 250);
      gradeIO.disconnect();
    }, { threshold: 0.35 });
    gradeIO.observe(grade);
  }

  if (lb) {
    doc.getElementById('lb-x').addEventListener('click', close);
    doc.getElementById('lb-p').addEventListener('click', function () { show(cur - 1, -1); });
    doc.getElementById('lb-n').addEventListener('click', function () { show(cur + 1, 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    doc.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.target === lbVid) return;  // arrows seek inside the video
      else if (e.key === 'ArrowLeft') show(cur - 1, -1);
      else if (e.key === 'ArrowRight') show(cur + 1, 1);
    });
    // the photo follows the finger, and lets go to the next one past a short distance
    var sx = null, sy = 0, dxl = 0;
    lb.addEventListener('touchstart', function (e) {
      if (e.target === lbVid || set.length < 2 || e.touches.length > 1) { sx = null; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; dxl = 0; lbFig.classList.add('drag');
    }, { passive: true });
    lb.addEventListener('touchmove', function (e) {
      if (sx === null) return;
      dxl = e.touches[0].clientX - sx;
      if (Math.abs(e.touches[0].clientY - sy) > Math.abs(dxl) * 1.2) return;
      lbFig.style.transform = 'translateX(' + (dxl * 0.85).toFixed(1) + 'px)';
    }, { passive: true });
    lb.addEventListener('touchend', function () {
      if (sx === null) return;
      sx = null; lbFig.classList.remove('drag');
      if (Math.abs(dxl) > 50) { lbFig.style.transform = ''; show(cur + (dxl < 0 ? 1 : -1), dxl < 0 ? 1 : -1); }
      else lbFig.style.transform = '';
    });
  }

  // ---- 3D glass panels: tilt toward the cursor with a moving glare (mouse); a light sweep on phones ----
  var panels = doc.querySelectorAll('.skill,.pf-card,.xp-card,.stack-card,.svc');
  var finePtr = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!capture && !reduceMotion && panels.length) {
    if (finePtr) {
      Array.prototype.forEach.call(panels, function (el) {
        el.classList.add('tilt');
        var r = null, raf = 0, px = 0.5, py = 0.5;
        var apply = function () {
          raf = 0;
          var rx = (0.5 - py) * 9, ry = (px - 0.5) * 11;
          el.style.setProperty('--rx', rx.toFixed(2) + 'deg'); el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          el.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
          el.style.setProperty('--tx', ((px - 0.5) * 2).toFixed(3)); el.style.setProperty('--ty', ((py - 0.5) * 2).toFixed(3));
          el.style.setProperty('--rim-a', (Math.atan2(py - 0.5, px - 0.5) * 180 / Math.PI + 225).toFixed(0) + 'deg');
        };
        el.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; r = el.getBoundingClientRect(); el.classList.add('is-tilt'); });
        el.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse') return;
          if (!r) r = el.getBoundingClientRect();
          px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
          if (!raf) raf = requestAnimationFrame(apply);
        }, { passive: true });
        el.addEventListener('pointerleave', function () {
          r = null; el.classList.remove('is-tilt');
          ['--rx', '--ry', '--tx', '--ty', '--rim-a'].forEach(function (k) { el.style.removeProperty(k); });
        });
      });
      window.addEventListener('scroll', function () { Array.prototype.forEach.call(doc.querySelectorAll('.is-tilt'), function (el) { el.dispatchEvent(new Event('pointerleave')); }); }, { passive: true });
    } else if ('IntersectionObserver' in window) {
      var shineIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('shine');
          shineIO.unobserve(e.target);
          setTimeout(function () { e.target.classList.remove('shine'); }, 1800);
        });
      }, { threshold: 0.55 });
      Array.prototype.forEach.call(panels, function (el) { shineIO.observe(el); });
    }
  }
})();
