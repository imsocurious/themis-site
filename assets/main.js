// Themis Expert – interacțiuni minime, fără biblioteci externe.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  var an = document.getElementById('an');
  if (an) an.textContent = new Date().getFullYear();

  // Marcaj de timp pentru filtrul anti-spam (formularele trimise în <3 secunde sunt respinse).
  var t = document.getElementById('form-t');
  if (t) t.value = String(Math.floor(Date.now() / 1000));

  // Mesaj după trimiterea formularului (contact.php redirecționează cu ?trimis=ok / eroare).
  var status = document.getElementById('form-status');
  var p = new URLSearchParams(location.search).get('trimis');
  if (status && p) {
    var ok = p === 'ok';
    status.className = 'notice ' + (ok ? 'ok' : 'err');
    status.textContent = ok
      ? 'Mulțumim! Mesajul a fost trimis. Vă răspundem în cel mult o zi lucrătoare.'
      : 'Mesajul nu a putut fi trimis. Verificați câmpurile obligatorii sau scrieți-ne direct pe e-mail.';
    var c = document.getElementById('contact');
    if (c) c.scrollIntoView();
  }
})();
