// Themis Expert – interacțiuni și animații, fără biblioteci externe.
// Compatibil cu CSP strict și Trusted Types: nu se folosește innerHTML sau eval.
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var mm = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mm('(prefers-reduced-motion: reduce)');
  var fin = mm('(hover: hover) and (pointer: fine)');

  // ---------- Meniu ----------
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  function inchideMeniu() {
    if (!nav) return;
    nav.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) inchideMeniu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { inchideMeniu(); toggle.focus(); }
    });
  }

  var an = document.getElementById('an');
  if (an) an.textContent = String(new Date().getFullYear());

  // ---------- Formular ----------
  var t = document.getElementById('form-t');
  if (t) t.value = String(Math.floor(Date.now() / 1000));
  var status = document.getElementById('form-status');
  var p = new URLSearchParams(location.search).get('trimis');
  if (status && p) {
    var ok = p === 'ok';
    status.className = 'notice ' + (ok ? 'ok' : 'err');
    status.textContent = ok
      ? 'Vă mulțumim. Mesajul a fost trimis, iar noi revenim în cel mult o zi lucrătoare.'
      : 'Mesajul nu a putut fi trimis. Verificați câmpurile obligatorii și încercați din nou.';
    var c = document.getElementById('contact');
    if (c) c.scrollIntoView();
    if (history.replaceState) history.replaceState(null, '', location.pathname + '#contact');
  }

  // ---------- Antet: se compactează, se ascunde la coborâre și reapare la urcare ----------
  var header = document.getElementById('antet');
  var bar = null;
  if (document.querySelector('main#continut')) {
    bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY || doc.scrollTop;
    if (header) {
      header.classList.toggle('scrolled', y > 24);
      var menuOpen = nav && nav.classList.contains('open');
      header.classList.toggle('ascuns-sus', !menuOpen && y > 400 && y > lastY + 2);
    }
    if (bar) {
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (header) header.addEventListener('focusin', function () { header.classList.remove('ascuns-sus'); });

  // ---------- Link activ în meniu ----------
  if ('IntersectionObserver' in window && nav) {
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('activ'); });
          a.classList.add('activ');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  // ---------- Apariție la derulare (doar elementele aflate încă sub ecran) ----------
  var vh = window.innerHeight;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.remove('ascuns');
        en.target.classList.add('vizibil');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
  // Titlurile ascunse prin clip-path nu au suprafață vizibilă, așa că urmărim un element „santinelă” de lângă ele.
  var santinele = new Map();
  var sio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = santinele.get(en.target);
      if (el) { el.classList.remove('ascuns'); el.classList.add('vizibil'); }
      sio.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv').forEach(function (el) {
    if (el.getBoundingClientRect().top < vh * 0.92) return;
    var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (x) { return x.classList.contains('rv'); }) : [el];
    el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 5) * 0.1) + 's');
    el.classList.add('ascuns');
    if (el.matches('.titlu-mare, .titlu-urias')) {
      var s = document.createElement('span');
      s.className = 'santinela';
      s.setAttribute('aria-hidden', 'true');
      el.parentNode.insertBefore(s, el);
      santinele.set(s, el);
      sio.observe(s);
    } else {
      io.observe(el);
    }
  });

  // Linia cronologiei se desenează la derulare
  var tl = document.querySelector('.timeline.rv-line');
  if (tl && tl.getBoundingClientRect().top > vh) {
    tl.classList.add('ascuns-linie');
    var tio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { tl.classList.remove('ascuns-linie'); tio.disconnect(); }
    }, { threshold: 0.15 });
    tio.observe(tl);
  }

  // Cardul de verificare pornește animația când apare pe ecran
  var card = document.querySelector('.pt-card');
  if (card) {
    var cio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { card.classList.add('porneste'); cio.disconnect(); }
    }, { threshold: 0.45 });
    cio.observe(card);
  }

  if (!fin) return;

  // ---------- Butoane „magnetice” ----------
  document.querySelectorAll('.magnetic').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * 0.22) + 'px');
      b.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * 0.3) + 'px');
    });
    b.addEventListener('pointerleave', function () { b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
  });

  // ---------- Paralaxă discretă a balanței din hero ----------
  var hero = document.querySelector('.hero');
  var bal = document.querySelector('.balanta');
  if (hero && bal) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      bal.style.setProperty('--px', (x * -18) + 'px');
      bal.style.setProperty('--py', (y * -14) + 'px');
    });
  }
})();
