/* Slide-out mini cart: lets visitors review and change their cart without leaving the page */
(function () {
  if (/cart\.html|checkout\.html/.test(location.pathname)) return;
  var KEY = 'sweetlips_cart';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    document.dispatchEvent(new Event('sl-cart-change'));
  }
  function el(tag, text, cls) { var e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }

  var fab = el('button', '', 'mc-fab'); fab.type = 'button'; fab.setAttribute('aria-label', 'Open cart');
  var overlay = el('div', '', 'mc-overlay');
  var drawer = el('aside', '', 'mc-drawer'); drawer.setAttribute('aria-label', 'Your cart'); drawer.setAttribute('aria-hidden', 'true');
  document.body.append(fab, overlay, drawer);

  function open(o) {
    drawer.classList.toggle('open', o); overlay.classList.toggle('open', o);
    drawer.setAttribute('aria-hidden', !o);
    if (o) { var b = drawer.querySelector('button,a'); if (b) b.focus(); } else { fab.focus(); }
  }

  function render() {
    var cart = load(), n = 0, total = 0;
    cart.forEach(function (i) { n += i.qty; total += i.price * i.qty; });
    fab.textContent = 'Cart (' + n + ') · R' + total;
    fab.style.display = n ? '' : 'none';
    drawer.innerHTML = '';
    var head = el('div', '', 'mc-head');
    head.appendChild(el('h2', 'Your Cart'));
    var close = el('button', '×', 'mc-close'); close.type = 'button'; close.setAttribute('aria-label', 'Close cart'); close.onclick = function () { open(false); };
    head.appendChild(close); drawer.appendChild(head);

    var list = el('div', '', 'mc-list');
    if (!cart.length) list.appendChild(el('p', 'Your cart is empty.'));
    cart.forEach(function (item, idx) {
      var row = el('div', '', 'mc-row');
      var info = el('div'); info.appendChild(el('strong', item.name));
      if (item.variant) info.appendChild(el('small', item.variant));
      info.appendChild(el('small', 'R' + item.price + ' each'));
      var ctl = el('div', '', 'mc-ctl');
      var minus = el('button', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Decrease quantity');
      var plus = el('button', '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'Increase quantity');
      minus.onclick = function () { item.qty -= 1; if (item.qty < 1) cart.splice(idx, 1); save(cart); };
      plus.onclick = function () { item.qty += 1; save(cart); };
      ctl.append(minus, el('span', String(item.qty)), plus);
      row.append(info, ctl, el('b', 'R' + item.price * item.qty));
      list.appendChild(row);
    });
    drawer.appendChild(list);

    var foot = el('div', '', 'mc-foot');
    foot.appendChild(el('div', 'Total: R' + total, 'mc-total'));
    var keep = el('button', 'Keep Shopping', 'mc-keep'); keep.type = 'button'; keep.onclick = function () { open(false); };
    var view = el('a', 'View Cart'); view.href = 'cart.html';
    var pay = el('a', 'Checkout'); pay.href = 'checkout.html';
    if (cart.length) foot.append(pay, view);
    foot.appendChild(keep);
    drawer.appendChild(foot);
  }

  fab.onclick = function () { open(true); };
  overlay.onclick = function () { open(false); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
  document.addEventListener('sl-cart-change', function () { render(); fab.classList.add('pulse'); setTimeout(function () { fab.classList.remove('pulse'); }, 500); });
  window.addEventListener('storage', render);
  render();
})();
