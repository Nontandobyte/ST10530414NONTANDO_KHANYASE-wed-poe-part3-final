(function () {
  var root = document.getElementById('checkout-root');
  if (!root) return;

  /* ---- Shop settings: change these to suit the business ---- */
  var DELIVERY_FEE = 0; // rand; set to e.g. 60 to charge delivery
  var BANK_DETAILS = 'Banking details will be confirmed to you on WhatsApp (067 144 8554) after you place the order.';

  var CART_KEY = 'sweetlips_cart', ORDER_KEY = 'sl_orders';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) {}

  function el(tag, text, cls) { var e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
  function subtotal() { return cart.reduce(function (n, i) { return n + i.price * i.qty; }, 0); }
  function grand() { return subtotal() + DELIVERY_FEE; }

  if (!cart.length) {
    root.appendChild(el('p', 'Your cart is empty.'));
    var p = el('p'), a = el('a', 'Continue Shopping'); a.href = 'products.html'; p.appendChild(a); root.appendChild(p);
    return;
  }

  var provinces = ['KwaZulu-Natal', 'Gauteng', 'Western Cape', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];
  root.innerHTML =
    '<p class="result" style="max-width:none">Demo checkout: no real payment is taken, and card details are never stored or sent anywhere.</p>' +
    '<div class="co-grid">' +
    '<form id="co-form" class="sl-form" novalidate>' +
      '<ol class="steps"><li class="on">1. Delivery</li><li>2. Payment</li><li>3. Review</li></ol>' +
      '<section data-step="1">' +
        '<label for="co-name">Full name *</label><input id="co-name" type="text" required minlength="2" autocomplete="name">' +
        '<label for="co-email">Email *</label><input id="co-email" type="email" required autocomplete="email">' +
        '<label for="co-phone">Phone *</label><input id="co-phone" type="tel" data-type="phone" required placeholder="067 144 8554">' +
        '<label for="co-address">Street address *</label><textarea id="co-address" rows="2" required minlength="6" autocomplete="street-address"></textarea>' +
        '<label for="co-city">City / Town *</label><input id="co-city" type="text" required minlength="2">' +
        '<label for="co-province">Province *</label><select id="co-province" required><option value="">Choose...</option>' + provinces.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select>' +
        '<label for="co-postal">Postal code *</label><input id="co-postal" type="text" data-type="postal" required inputmode="numeric" maxlength="4">' +
      '</section>' +
      '<section data-step="2" hidden>' +
        '<fieldset><legend>Payment method</legend>' +
          '<label class="inline"><input type="radio" name="pay" value="Card" checked> Card</label>' +
          '<label class="inline"><input type="radio" name="pay" value="EFT"> EFT</label>' +
          '<label class="inline"><input type="radio" name="pay" value="Cash on Delivery"> Cash on Delivery</label></fieldset>' +
        '<div id="pay-Card">' +
          '<label for="cc-name">Name on card *</label><input id="cc-name" type="text" required minlength="2" autocomplete="cc-name">' +
          '<label for="cc-number">Card number *</label><input id="cc-number" type="text" data-type="card" required inputmode="numeric" maxlength="23" placeholder="4242 4242 4242 4242" autocomplete="cc-number">' +
          '<label for="cc-exp">Expiry (MM/YY) *</label><input id="cc-exp" type="text" data-type="expiry" required maxlength="5" placeholder="08/28" autocomplete="cc-exp">' +
          '<label for="cc-cvv">CVV *</label><input id="cc-cvv" type="password" data-type="cvv" required inputmode="numeric" maxlength="4" autocomplete="cc-csc">' +
        '</div>' +
        '<p id="pay-EFT" hidden></p><p id="pay-Cash" hidden>Pay in cash when your order arrives.</p>' +
      '</section>' +
      '<section data-step="3" hidden><div id="review"></div></section>' +
      '<div class="co-nav"><button type="button" id="co-back" hidden>Back</button> <button type="button" id="co-next">Continue</button></div>' +
    '</form>' +
    '<aside class="co-summary"><h3>Order Summary</h3><div id="sum"></div></aside></div>';

  /* summary */
  var sum = document.getElementById('sum');
  cart.forEach(function (i) {
    var row = el('div', '', 'sum-row');
    row.appendChild(el('span', i.qty + ' x ' + i.name + (i.variant ? ' (' + i.variant + ')' : '')));
    row.appendChild(el('b', 'R' + i.price * i.qty));
    sum.appendChild(row);
  });
  var d = el('div', '', 'sum-row'); d.append(el('span', 'Delivery'), el('b', DELIVERY_FEE ? 'R' + DELIVERY_FEE : 'Free')); sum.appendChild(d);
  var t = el('div', '', 'sum-row sum-total'); t.append(el('span', 'Total'), el('b', 'R' + grand())); sum.appendChild(t);

  var form = document.getElementById('co-form'), step = 1;
  var sections = [].slice.call(form.querySelectorAll('section'));
  var steps = [].slice.call(form.querySelectorAll('.steps li'));
  var back = document.getElementById('co-back'), next = document.getElementById('co-next');
  var $ = function (id) { return document.getElementById(id); };
  function pay() { return form.querySelector('input[name=pay]:checked').value; }
  $('pay-EFT').textContent = BANK_DETAILS;

  form.addEventListener('input', function (e) { if (e.target.id && window.SL && e.target.type !== 'radio') SL.check(e.target); });
  $('cc-number').addEventListener('input', function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim(); });
  $('cc-exp').addEventListener('input', function (e) {
    var v = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  });
  form.addEventListener('change', function (e) {
    if (e.target.name !== 'pay') return;
    $('pay-Card').hidden = pay() !== 'Card';
    $('pay-EFT').hidden = pay() !== 'EFT';
    $('pay-Cash').hidden = pay() !== 'Cash on Delivery';
  });

  function stepValid() {
    var sec = sections[step - 1];
    var fields = [].slice.call(sec.querySelectorAll('input:not([type=radio]),select,textarea')).filter(function (f) { return !f.closest('[hidden]'); });
    return fields.map(function (f) { return SL.check(f); }).every(Boolean);
  }
  function show() {
    sections.forEach(function (s, i) { s.hidden = i !== step - 1; });
    steps.forEach(function (s, i) { s.className = i === step - 1 ? 'on' : (i < step - 1 ? 'done' : ''); });
    back.hidden = step === 1;
    next.textContent = step === 3 ? 'Place Order' : 'Continue';
    if (step === 3) buildReview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function details() {
    return { name: $('co-name').value.trim(), email: $('co-email').value.trim(), phone: $('co-phone').value.trim(),
      address: $('co-address').value.trim() + ', ' + $('co-city').value.trim() + ', ' + $('co-province').value + ', ' + $('co-postal').value.trim() };
  }
  function buildReview() {
    var r = $('review'), x = details(); r.innerHTML = '';
    [['Name', x.name], ['Email', x.email], ['Phone', x.phone], ['Deliver to', x.address], ['Payment', pay() === 'Card' ? 'Card ending ' + $('cc-number').value.replace(/\s/g, '').slice(-4) : pay()], ['Total', 'R' + grand()]]
      .forEach(function (p) { var row = el('div', '', 'sum-row'); row.append(el('span', p[0]), el('b', p[1])); r.appendChild(row); });
    r.appendChild(el('p', 'Check everything above, then place your order.'));
  }

  back.addEventListener('click', function () { if (step > 1) { step--; show(); } });
  next.addEventListener('click', function () {
    if (!stepValid()) return;
    if (step < 3) { step++; show(); return; }
    placeOrder();
  });

  function placeOrder() {
    var x = details(), ref = 'SL-' + Date.now().toString().slice(-6);
    var order = { ref: ref, date: new Date().toLocaleString('en-ZA'), items: cart, total: grand(), customer: x, payment: pay(),
      cardLast4: pay() === 'Card' ? $('cc-number').value.replace(/\s/g, '').slice(-4) : null };
    var all = []; try { all = JSON.parse(localStorage.getItem(ORDER_KEY)) || []; } catch (e) {}
    all.push(order);
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(all)); localStorage.setItem(CART_KEY, '[]'); } catch (e) {}

    root.innerHTML = '';
    var box = el('div', '', 'receipt');
    box.appendChild(el('h3', 'Thank you, ' + x.name + '! Your order is confirmed.'));
    box.appendChild(el('p', 'Order reference: ' + ref + ' | ' + order.date));
    order.items.forEach(function (i) {
      var row = el('div', '', 'sum-row');
      row.append(el('span', i.qty + ' x ' + i.name + (i.variant ? ' (' + i.variant + ')' : '')), el('b', 'R' + i.price * i.qty));
      box.appendChild(row);
    });
    var tot = el('div', '', 'sum-row sum-total'); tot.append(el('span', 'Total'), el('b', 'R' + order.total)); box.appendChild(tot);
    box.appendChild(el('p', 'Deliver to: ' + x.address));
    var note = order.payment === 'Card' ? 'Paid by card ending ' + order.cardLast4 + ' (demo: no money was taken).'
      : order.payment === 'EFT' ? 'Please pay R' + order.total + ' by EFT using reference ' + ref + '. ' + BANK_DETAILS
      : 'Please have R' + order.total + ' ready in cash when your order arrives.';
    box.appendChild(el('p', note));
    box.appendChild(el('p', 'Delivery takes 3-5 business days. A copy was saved on this device.'));
    root.appendChild(box);
    var pr = el('button', 'Print Receipt'); pr.type = 'button'; pr.onclick = function () { window.print(); };
    var cont = el('a', 'Continue Shopping'); cont.href = 'products.html';
    root.append(pr, document.createTextNode(' '), cont);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
})();
