(function () {
  var KEY = 'sweetlips_cart';
  var WHATSAPP = '27671448554'; // 067 144 8554 in international format

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    updateBadge();
    document.dispatchEvent(new Event('sl-cart-change'));
  }
  function count(cart) {
    return cart.reduce(function (n, i) { return n + i.qty; }, 0);
  }
  function total(cart) {
    return cart.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
  }

  // Show "Cart (n)" in the navigation
  function updateBadge() {
    var n = count(load());
    document.querySelectorAll('nav a[href="cart.html"]').forEach(function (a) {
      a.textContent = n ? 'Cart (' + n + ')' : 'Cart';
    });
  }

  function addItem(name, variant, price) {
    var cart = load();
    var found = cart.find(function (i) { return i.name === name && i.variant === variant; });
    if (found) found.qty += 1;
    else cart.push({ name: name, variant: variant, price: price, qty: 1 });
    save(cart);
  }

  // ---------- Products page ----------
  function initProducts() {
    var main = document.querySelector('main');
    if (!main) return;
    var FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    var headings = Array.from(main.querySelectorAll('h3'));
    var selects = Array.from(main.querySelectorAll('select'));

    main.querySelectorAll('a[href="cart.html"]').forEach(function (link) {
      // nearest heading before this button
      var h = null;
      headings.forEach(function (x) {
        if (x.compareDocumentPosition(link) & FOLLOWING) h = x;
      });
      if (!h) return;

      // "3. Lipsticks - R45" -> name "Lipsticks", price 45
      var m = h.textContent.trim().match(/^(?:\d+\.\s*)?(.*?)\s*-\s*R(\d+)\s*$/);
      if (!m) return;
      var name = m[1], price = parseInt(m[2], 10);

      // the shade/flavour dropdown between the heading and the button (if any)
      var select = null;
      selects.forEach(function (s) {
        if ((h.compareDocumentPosition(s) & FOLLOWING) && (s.compareDocumentPosition(link) & FOLLOWING)) select = s;
      });

      link.addEventListener('click', function (e) {
        e.preventDefault();
        addItem(name, select ? select.value : '', price);
        var original = link.textContent;
        link.textContent = 'Added ✓';
        setTimeout(function () { link.textContent = original; }, 1200);
      });
    });
  }

  // ---------- Cart page ----------
  function el(tag, text, className) {
    var e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (className) e.className = className;
    return e;
  }

  function renderCart() {
    var root = document.getElementById('cart-root');
    if (!root) return;
    var cart = load();
    root.innerHTML = '';

    if (!cart.length) {
      root.appendChild(el('p', 'Your cart is currently empty.'));
      var p = el('p');
      var a = el('a', 'Continue Shopping');
      a.href = 'products.html';
      p.appendChild(a);
      root.appendChild(p);
      return;
    }

    cart.forEach(function (item, idx) {
      var row = el('div', '', 'cart-item');
      var info = el('div');
      info.appendChild(el('strong', item.name));
      if (item.variant) info.appendChild(el('div', item.variant));
      info.appendChild(el('div', 'R' + item.price + ' each'));
      row.appendChild(info);

      var controls = el('div', '', 'cart-controls');
      var minus = el('button', '−'); minus.type = 'button';
      var plus = el('button', '+'); plus.type = 'button';
      var remove = el('button', 'Remove'); remove.type = 'button';
      minus.onclick = function () {
        item.qty -= 1;
        if (item.qty < 1) cart.splice(idx, 1);
        save(cart); renderCart();
      };
      plus.onclick = function () { item.qty += 1; save(cart); renderCart(); };
      remove.onclick = function () { cart.splice(idx, 1); save(cart); renderCart(); };
      controls.append(minus, el('span', String(item.qty)), plus, remove);
      row.appendChild(controls);
      row.appendChild(el('div', 'R' + item.price * item.qty, 'cart-line-total'));
      root.appendChild(row);
    });

    root.appendChild(el('h3', 'Total: R' + total(cart)));

    var clear = el('button', 'Clear cart'); clear.type = 'button';
    clear.onclick = function () { save([]); renderCart(); };
    root.appendChild(clear);

    var more = el('a', 'Continue Shopping', 'ghost'); more.href = 'products.html';
    root.insertBefore(more, root.firstChild);
    var go = el('a', 'Proceed to Checkout'); go.href = 'checkout.html';
    root.appendChild(document.createTextNode(' '));
    root.appendChild(go);
  }

  // minimal styles so it looks fine even before you style it in style.css
  var style = document.createElement('style');
  style.textContent =
    '.cart-item{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 0;border-bottom:1px solid #ddd}' +
    '.cart-controls{display:flex;align-items:center;gap:8px}' +
    '.cart-controls button{cursor:pointer}';
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', function () {
    updateBadge();
    document.addEventListener('sl-cart-change', updateBadge);
    window.addEventListener('storage', function () { updateBadge(); renderCart(); });
    initProducts();
    renderCart();
  });
})();
