// Themis Expert – interacțiuni și animații, fără biblioteci externe.
// Compatibil cu CSP strict și Trusted Types: nu se folosește innerHTML sau eval.
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Meniu mobil
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  }

  var an = document.getElementById('an');
  if (an) an.textContent = String(new Date().getFullYear());

  // Marcaj de timp pentru filtrul anti-spam
  var t = document.getElementById('form-t');
  if (t) t.value = String(Math.floor(Date.now() / 1000));

  // Mesaj după trimiterea formularului
  var status = document.getElementById('form-status');
  var p = new URLSearchParams(location.search).get('trimis');
  if (status && p) {
    var ok = p === 'ok';
    status.className = 'notice ' + (ok ? 'ok' : 'err');
    status.textContent = ok
      ? 'Mulțumim! Mesajul a fost trimis. Vă răspundem în cel mult o zi lucrătoare.'
      : 'Mesajul nu a putut fi trimis. Verificați câmpurile obligatorii și încercați din nou.';
    var c = document.getElementById('contact');
    if (c) c.scrollIntoView();
    if (history.replaceState) history.replaceState(null, '', location.pathname + '#contact');
  }

  // Antet compact + bară de progres a lecturii
  var header = document.getElementById('antet');
  var bar = null;
  if (document.querySelector('main#continut')) {
    bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || doc.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (bar) {
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Link activ în meniu, după secțiunea vizibilă
  if ('IntersectionObserver' in window && nav) {
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a && en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('activ'); });
          a.classList.add('activ');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  if (reduce || !('IntersectionObserver' in window)) return;

  // Apariție la derulare: ascundem doar elementele aflate încă sub ecran (fără „clipire” la încărcare)
  var items = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  var vh = window.innerHeight;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.remove('ascuns');
        en.target.classList.add('vizibil');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) {
    if (el.getBoundingClientRect().top < vh) return;
    // întârziere eșalonată între elementele vecine
    var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (x) { return x.classList.contains('rv'); }) : [el];
    var i = sibs.indexOf(el);
    el.style.setProperty('--d', (Math.min(i, 5) * 0.08) + 's');
    el.classList.add('ascuns');
    io.observe(el);
  });

  // Linia din „Drumul nostru” se desenează la derulare
  var tl = document.querySelector('.timeline.rv-line');
  if (tl && tl.getBoundingClientRect().top > vh) {
    tl.classList.add('ascuns-linie');
    var tio = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { tl.classList.remove('ascuns-linie'); tio.disconnect(); }
    }, { threshold: 0.2 });
    tio.observe(tl);
  }

  // Lumina din carduri urmărește cursorul (doar pe dispozitive cu mouse)
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();
