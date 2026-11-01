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
    doc.getElementById('links').addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Mở menu'); }
    });
    doc.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Mở menu');
      }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Mở menu');
        menuBtn.focus();
      }
    });
    window.addEventListener('scroll', function () {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Mở menu');
      }
    }, { passive: true });
  }

  // ---- floating action button (zalo + back to top) ----
  var fabGroup = doc.getElementById('fab-group');
  var fabTop = doc.getElementById('fab-top');
  if (fabGroup && !capture) {
    var checkScroll = function () {
      var y = window.scrollY || doc.documentElement.scrollTop || 0;
      fabGroup.classList.toggle('fab-hidden', y < 350);
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    if (fabTop) {
      fabTop.addEventListener('click', function () {
        var site = doc.getElementById('site');
        if (site) site.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ---- projects: each category card opens its own gallery in the lightbox ----
  var lb = doc.getElementById('lb'), lbImg = doc.getElementById('lb-img');
  var lbT = doc.getElementById('lb-t'), lbD = doc.getElementById('lb-d'), lbC = doc.getElementById('lb-c');
  var lbP = doc.getElementById('lb-p'), lbN = doc.getElementById('lb-n');
  var set = [], setTitle = '', cur = 0, lastFocus = null;
  function show(i) {
    if (!set.length) return;
    cur = (i + set.length) % set.length;
    var it = set[cur];
    lbImg.src = it.src; lbImg.alt = it.t;
    lbT.textContent = it.t; lbD.textContent = it.d;
    lbC.textContent = setTitle + (set.length > 1 ? ' · ' + (cur + 1) + '/' + set.length : '');
    if (set.length > 1) { var nx = new Image(); nx.src = set[(cur + 1) % set.length].src; }
  }
  function openSet(card) {
    set = Array.prototype.map.call(card.querySelectorAll('.pf-items li'), function (li) {
      return { src: li.getAttribute('data-src'), t: li.getAttribute('data-t'), d: li.getAttribute('data-d') };
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
    lb.hidden = true; doc.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  Array.prototype.forEach.call(doc.querySelectorAll('[data-pf]'), function (b) {
    b.addEventListener('click', function () { openSet(b.closest('.pf-card')); });
  });
  if (lb) {
    doc.getElementById('lb-x').addEventListener('click', close);
    doc.getElementById('lb-p').addEventListener('click', function () { show(cur - 1); });
    doc.getElementById('lb-n').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    doc.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
  }
})();
