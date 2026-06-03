// 08-effects-button.js
// ======================================================
// ボタンFX初期化
// ======================================================
var _buttonFXInitialized = false;


function initButtonFX() {
  if (_buttonFXInitialized || !getFx('fx_button')) return;
  _buttonFXInitialized = true;
  var selector = 'button, [onclick], .mc, .kotsu-banner, .num-card, .abtn, .cbtn, .tab, .img-set-btn, .img-set-reset, .quit-btn, .snd-btn, .go-btn, .rbk, .rag';
  var fxLayer = document.getElementById('fx-layer');
  if (!fxLayer) {
    fxLayer = document.createElement('div');
    fxLayer.id = 'fx-layer';
    document.body.appendChild(fxLayer);
  }

  function addBurst(el, evt) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) return;

    var x = (evt && evt.clientX) ? evt.clientX : (rect.left + rect.width / 2);
    var y = (evt && evt.clientY) ? evt.clientY : (rect.top + rect.height / 2);
    var localX = x - rect.left;
    var localY = y - rect.top;

    el.classList.add('fx-pressing');
    setTimeout(function(){ el.classList.remove('fx-pressing'); }, 160);

    var ripple = document.createElement('span');
    ripple.className = 'fx-ripple';
    ripple.style.left = localX + 'px';
    ripple.style.top = localY + 'px';
    el.appendChild(ripple);
    setTimeout(function(){ if (ripple && ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 560);

    var sparks = [
      {dx: 18, dy: -10}, {dx: -18, dy: -14}, {dx: 10, dy: 18}, {dx: -8, dy: 18}
    ];
    for (var i = 0; i < sparks.length; i++) {
      (function(s) {
        var spark = document.createElement('span');
        spark.className = 'fx-spark';
        spark.style.left = localX + 'px';
        spark.style.top = localY + 'px';
        spark.style.setProperty('--dx', s.dx + 'px');
        spark.style.setProperty('--dy', s.dy + 'px');
        fxLayer.appendChild(spark);
        setTimeout(function(){ if (spark && spark.parentNode) spark.parentNode.removeChild(spark); }, 620);
      })(sparks[i]);
    }

    var star = document.createElement('span');
    star.className = 'fx-star';
    star.textContent = '✦';
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    star.style.setProperty('--dx', '0px');
    star.style.setProperty('--dy', '-42px');
    fxLayer.appendChild(star);
    setTimeout(function(){ if (star && star.parentNode) star.parentNode.removeChild(star); }, 740);

    try { if (navigator.vibrate) navigator.vibrate(10); } catch(e) {}
  }

  document.addEventListener('pointerdown', function(e) {
    var el = e.target && e.target.closest ? e.target.closest(selector) : null;
    if (!el) return;
    addBurst(el, e);
  }, {capture:true, passive:true});

  document.addEventListener('keydown', function(e) {
    var key = e.key;
    if (key !== 'Enter' && key !== ' ' && key !== 'Spacebar') return;
    var el = document.activeElement;
    if (!el) return;
    if (el.matches && el.matches(selector)) {
      addBurst(el, {clientX: el.getBoundingClientRect().left + el.offsetWidth / 2, clientY: el.getBoundingClientRect().top + el.offsetHeight / 2});
    }
  }, true);
}
