(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Form validation ---------- */
  function setErr(f, msg) {
    var e = f.parentNode.querySelector('.error[data-for="' + f.id + '"]');
    if (!e) { e = document.createElement('span'); e.className = 'error'; e.dataset.for = f.id; e.setAttribute('role', 'alert'); f.after(e); }
    e.textContent = msg; f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function validCard(v) {
    var d = v.replace(/\s/g, ''); if (!/^\d{13,19}$/.test(d)) return false;
    var sum = 0, alt = false;
    for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
    return sum % 10 === 0;
  }
  function validExpiry(v) {
    var m = v.match(/^(0[1-9]|1[0-2])\/(\d{2})$/); if (!m) return false;
    var now = new Date(), y = 2000 + +m[2];
    return y > now.getFullYear() || (y === now.getFullYear() && +m[1] >= now.getMonth() + 1);
  }
  function check(f) {
    var v = f.value.trim(), m = '';
    if (f.required && !v) m = 'This field is required.';
    else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = 'Enter a valid email address.';
    else if (f.dataset.type === 'phone' && v && !/^(\+27|0)[6-8]\d{8}$/.test(v.replace(/\s/g, ''))) m = 'Enter a valid SA number, e.g. 067 144 8554.';
    else if (f.dataset.type === 'card' && v && !validCard(v)) m = 'Enter a valid card number.';
    else if (f.dataset.type === 'expiry' && v && !validExpiry(v)) m = 'Enter a valid future expiry date (MM/YY).';
    else if (f.dataset.type === 'cvv' && v && !/^\d{3,4}$/.test(v)) m = 'CVV must be 3 or 4 digits.';
    else if (f.dataset.type === 'postal' && v && !/^\d{4}$/.test(v)) m = 'Enter a 4-digit postal code.';
    else if (f.minLength > 0 && v && v.length < f.minLength) m = 'Please enter at least ' + f.minLength + ' characters.';
    else if (f.type === 'number' && v && (+v < +f.min || +v > +f.max)) m = 'Enter a number between ' + f.min + ' and ' + f.max + '.';
    return setErr(f, m);
  }
  function validate(form) {
    return $$('input:not([type=checkbox]):not([type=radio]),select,textarea', form).map(check).every(Boolean);
  }
  window.SL = { validate: validate, check: check };
  $$('.sl-form').forEach(function (form) {
    form.noValidate = true;
    form.addEventListener('input', function (e) { if (e.target.id) check(e.target); });
    form.addEventListener('focusout', function (e) { if (e.target.id && e.target.tagName !== 'BUTTON') check(e.target); });
  });

  /* Enquiry: processed response with cost + availability */
  var enq = $('#enquiry-form');
  if (enq) enq.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('#enquiry-result');
    if (!validate(enq)) { out.hidden = false; out.textContent = 'Please fix the highlighted fields and try again.'; return; }
    var opt = $('#product').selectedOptions[0], qty = +$('#quantity').value;
    var total = qty * +opt.dataset.price, ltd = opt.dataset.ltd === '1';
    var msg = 'Thanks ' + $('#name').value.trim() + '! ' + qty + ' x ' + opt.dataset.name + ' = R' + total + '. ' +
      (ltd ? 'Limited edition: stock is limited, so order soon. ' : 'Currently in stock. ') +
      'Delivery to ' + $('#province').value + ' takes 3-5 business days. ' +
      ($('#gift').checked ? 'Gift wrapping noted. ' : '') +
      'Reply via ' + document.querySelector('input[name=reply]:checked').value + ' to ' + $('#email').value.trim() + '.';
    out.hidden = false; out.textContent = msg;
    enq.reset();
  });

  /* Contact: validated message compiled into an email */
  var con = $('#contact-form');
  if (con) con.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('#contact-result');
    if (!validate(con)) { out.hidden = false; out.textContent = 'Please fix the highlighted fields and try again.'; return; }
    var body = 'Name: ' + $('#c-name').value.trim() + '\nEmail: ' + $('#c-email').value.trim() +
      '\nPhone: ' + ($('#c-phone').value.trim() || 'n/a') + '\n\n' + $('#c-message').value.trim();
    var url = 'mailto:hello@sweetlips.co.za?subject=' + encodeURIComponent($('#c-type').value + ' - Sweet Lips website') + '&body=' + encodeURIComponent(body);
    out.hidden = false; out.textContent = 'Opening your email app to send this to hello@sweetlips.co.za...';
    window.location.href = url;
  });

  /* ---------- Products: search + sort ---------- */
  var cards = $$('.product-card');
  if (cards.length && /products/.test(location.pathname + 'products')) {
    var first = cards[0], tools = document.createElement('div');
    if ($('h2', first.parentNode) && document.title.indexOf('Products') > -1) {
      tools.className = 'tools';
      tools.innerHTML = '<input id="search" type="search" placeholder="Search products..." aria-label="Search products">' +
        '<select id="sort" aria-label="Sort products"><option value="">Sort: default</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select>' +
        '<span id="count" aria-live="polite"></span>';
      first.parentNode.insertBefore(tools, first);
      var price = function (c) { var m = c.textContent.match(/R(\d+)/); return m ? +m[1] : 0; };
      var order = cards.slice();
      var apply = function () {
        var q = $('#search').value.toLowerCase().trim(), s = $('#sort').value, shown = 0;
        var list = order.slice();
        if (s) list.sort(function (a, b) { return s === 'asc' ? price(a) - price(b) : price(b) - price(a); });
        list.forEach(function (c) {
          var ok = c.textContent.toLowerCase().indexOf(q) > -1;
          c.style.display = ok ? '' : 'none'; if (ok) shown++;
          c.parentNode.appendChild(c);
        });
        $('#count').textContent = shown ? shown + ' result(s)' : 'No products match your search.';
      };
      $('#search').addEventListener('input', apply); $('#sort').addEventListener('change', apply);
    }
  }

  /* ---------- Reviews: loaded dynamically, visitors can add their own ---------- */
  function store(key, arr) { try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {} }
  function stored(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } }
  var rv = $('#reviews-list');
  if (rv) {
    var saved = stored('sl_reviews');
    var reviews = [
      { n: 'Thando M.', s: 5, t: 'The lip gloss is so shiny and lasts all day! Love the affordable prices.' },
      { n: 'Sipho K.', s: 4, t: 'Fast delivery in Durban. The lip balm saved my dry lips.' }
    ].concat(saved);
    var draw = function () {
      var min = +$('#min-rating').value; rv.innerHTML = '';
      reviews.filter(function (r) { return r.s >= min; }).forEach(function (r) {
        var d = document.createElement('div'); d.className = 'review';
        var h = document.createElement('h3'); h.textContent = r.n + ' - ' + '★'.repeat(r.s) + '☆'.repeat(5 - r.s);
        var p = document.createElement('p'); p.textContent = '"' + r.t + '"';
        d.append(h, p); rv.appendChild(d);
      });
    };
    $('#min-rating').addEventListener('change', draw); draw();
    var rf = $('#review-form');
    if (rf) rf.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = $('#review-result');
      if (!validate(rf)) { out.hidden = false; out.textContent = 'Please fix the highlighted fields.'; return; }
      var r = { n: $('#r-name').value.trim(), s: +$('#r-rating').value, t: $('#r-text').value.trim() };
      saved.push(r); store('sl_reviews', saved); reviews.push(r); draw(); rf.reset();
      out.hidden = false; out.textContent = 'Thank you! Your review has been added.';
    });
  }

  /* ---------- FAQ accordion ---------- */
  if (document.body.classList.contains('faq-page')) {
    $$('main h3').forEach(function (h) {
      var p = h.nextElementSibling; if (!p || p.tagName !== 'P') return;
      var d = document.createElement('details'), s = document.createElement('summary');
      s.textContent = h.textContent; h.before(d); d.append(s, p); h.remove();
    });
  }

  /* ---------- FAQ: visitors can ask a question ---------- */
  var qf = $('#question-form'), ql = $('#user-questions');
  if (qf && ql) {
    var qs = stored('sl_questions');
    var drawQ = function () {
      ql.innerHTML = '';
      qs.forEach(function (q) {
        var d = document.createElement('details'), sm = document.createElement('summary'), p = document.createElement('p');
        sm.textContent = q.q + ' (asked by ' + q.n + ')';
        p.textContent = 'Thanks for asking! We have received your question and will answer it soon. You can also WhatsApp us on 067 144 8554.';
        d.append(sm, p); ql.appendChild(d);
      });
    };
    drawQ();
    qf.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = $('#question-result');
      if (!validate(qf)) { out.hidden = false; out.textContent = 'Please fix the highlighted fields.'; return; }
      qs.push({ n: $('#q-name').value.trim(), q: $('#q-text').value.trim() }); store('sl_questions', qs); drawQ(); qf.reset();
      out.hidden = false; out.textContent = 'Your question has been added below.';
    });
  }

  /* ---------- Home page: rotating word ---------- */
  var rot = $('#rotator');
  if (rot && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var words = ['gloss', 'balm', 'tint', 'oil', 'lipstick'], wi = 0;
    setInterval(function () {
      rot.style.opacity = 0;
      setTimeout(function () { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.style.opacity = 1; }, 300);
    }, 2200);
  }

  /* ---------- Lightbox ---------- */
  var imgs = $$('main img:not(.about-pic):not(.home-pic):not(.tile-img)');
  if (imgs.length) {
    var lb = document.createElement('div'); lb.id = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<button id="lb-close" aria-label="Close">×</button><button id="lb-prev" aria-label="Previous">‹</button><img alt=""><button id="lb-next" aria-label="Next">›</button>';
    document.body.appendChild(lb);
    var cur = 0, big = $('img', lb);
    var show = function (i) { cur = (i + imgs.length) % imgs.length; big.src = imgs[cur].currentSrc || imgs[cur].src; big.alt = imgs[cur].alt; lb.classList.add('open'); };
    imgs.forEach(function (im, i) { im.addEventListener('click', function () { show(i); }); });
    $('#lb-close').onclick = function () { lb.classList.remove('open'); };
    $('#lb-prev').onclick = function (e) { e.stopPropagation(); show(cur - 1); };
    $('#lb-next').onclick = function (e) { e.stopPropagation(); show(cur + 1); };
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- Map (Leaflet) ---------- */
  if ($('#map') && window.L) {
    var map = L.map('map').setView([-29.8587, 31.0218], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    L.marker([-29.8587, 31.0218]).addTo(map).bindPopup('<b>Sweet Lips</b><br>Durban, KwaZulu-Natal').openPopup();
  }
  /* ---------- Mobile navigation toggle ---------- */
  var tg = $('.nav-toggle'), nv = $('#site-nav');
  if (tg && nv) {
    var setNav = function (open) {
      nv.classList.toggle('open', open); tg.classList.toggle('open', open);
      tg.setAttribute('aria-expanded', open); tg.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    tg.addEventListener('click', function () { setNav(!nv.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setNav(false); });
  }
})();
