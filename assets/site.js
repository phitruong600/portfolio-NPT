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
  var lb = doc.getElementById('lb'), lbImg = doc.getElementById('lb-img'), lbVid = doc.getElementById('lb-vid');
  var lbT = doc.getElementById('lb-t'), lbD = doc.getElementById('lb-d'), lbC = doc.getElementById('lb-c');
  var lbP = doc.getElementById('lb-p'), lbN = doc.getElementById('lb-n');
  var set = [], setTitle = '', cur = 0, lastFocus = null;
  function stopVideo() {
    if (!lbVid || lbVid.hidden) return;
    lbVid.pause(); lbVid.removeAttribute('src'); lbVid.load(); lbVid.hidden = true;
  }
  function show(i) {
    if (!set.length) return;
    cur = (i + set.length) % set.length;
    var it = set[cur];
    if (it.video && lbVid) {
      lbImg.hidden = true; lbImg.removeAttribute('src');
      lbVid.hidden = false; lbVid.poster = it.poster || ''; lbVid.src = it.src;
      var pl = lbVid.play(); if (pl && pl.catch) pl.catch(function () {});
    } else {
      stopVideo();
      lbImg.hidden = false; lbImg.src = it.src; lbImg.alt = it.t;
    }
    lbT.textContent = it.t; lbD.textContent = it.d;
    lbC.textContent = setTitle + (set.length > 1 ? ' · ' + (cur + 1) + '/' + set.length : '');
    var nxt = set[(cur + 1) % set.length];
    if (set.length > 1 && !nxt.video) { var nx = new Image(); nx.src = nxt.src; }
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
    show(0);
    lb.hidden = false;
    doc.body.style.overflow = 'hidden';
    doc.getElementById('lb-x').focus();
  }
  function close() {
    stopVideo();
    lb.hidden = true; doc.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  Array.prototype.forEach.call(doc.querySelectorAll('[data-pf]'), function (b) {
    b.addEventListener('click', function () { openSet(b.closest('.pf-card')); });
  });
  // ---- fanned deck: arrows turn it, the front card opens its category ----
  var deck = doc.querySelector('.fan-deck');
  if (deck) {
    var fan = Array.prototype.slice.call(deck.querySelectorAll('.fan-card')), nf = fan.length, front = Math.floor(nf / 2);
    var layFan = function () {
      fan.forEach(function (c, i) {
        var k = ((i - front) % nf + nf) % nf; if (k > nf / 2) k -= nf;
        c.style.setProperty('--k', k); c.style.setProperty('--a', Math.abs(k)); c.setAttribute('data-k', k);
      });
    };
    layFan();
    Array.prototype.forEach.call(doc.querySelectorAll('.fan-nav'), function (b) {
      b.addEventListener('click', function () { front = (front + Number(b.getAttribute('data-step')) + nf) % nf; layFan(); });
    });
    fan.forEach(function (c, i) {
      c.addEventListener('click', function () {
        if (c.getAttribute('data-k') !== '0') { front = i; layFan(); return; }
        var card = doc.getElementById(c.getAttribute('data-open'));
        if (card) openSet(card);
      });
    });
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
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    doc.getElementById('lb-p').addEventListener('click', function () { show(cur - 1); });
    doc.getElementById('lb-n').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    doc.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.target === lbVid) return;  // arrows seek inside the video
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.target === lbVid ? null : e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
  }
})();
