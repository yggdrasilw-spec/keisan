// 08-effects-shuriken.js
// ======================================================
// 手裏剣バースト演出
// ======================================================
function throwShurikenBurst(originEl, count) {
  if (!getFx('fx_shuriken')) return;
  var fxLayer = document.getElementById('fx-layer');
  if (!fxLayer) return;
  var rect = originEl && originEl.getBoundingClientRect ? originEl.getBoundingClientRect() : null;
  if (!rect) return;
  var x = (rect.width || rect.height) ? rect.left + rect.width * 0.5 : window.innerWidth * 0.5;
  var y = (rect.width || rect.height) ? rect.top + rect.height * 0.45 : window.innerHeight * 0.55;
  // 最大10枚分の軌道テーブル（放射状に広がる）
  var list = [
    {dx:  -30, dy:  -80, delay:   0, scale: 1.05},
    {dx:   14, dy: -100, delay:  70, scale: 1.10},
    {dx:   52, dy:  -64, delay: 140, scale: 1.00},
    {dx:  -62, dy:  -52, delay:  40, scale: 1.08},
    {dx:   30, dy:  -90, delay: 110, scale: 0.95},
    {dx:  -10, dy: -110, delay:  30, scale: 1.12},
    {dx:   68, dy:  -38, delay:  90, scale: 0.98},
    {dx:  -50, dy:  -78, delay:  60, scale: 1.06},
    {dx:   42, dy: -108, delay: 150, scale: 1.02},
    {dx:  -24, dy:  -58, delay:  20, scale: 1.08}
  ];
  var n = Math.max(1, Math.min(list.length, count || 1));
  for (var i = 0; i < n; i++) {
    (function(cfg){
      var s = document.createElement('span');
      s.className = 'fx-shuriken';
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', cfg.dx + 'px');
      s.style.setProperty('--dy', cfg.dy + 'px');
      s.style.transform = 'translate(-50%, -50%) scale(' + cfg.scale + ')';
      setTimeout(function(){
        fxLayer.appendChild(s);
        setTimeout(function(){
          if (s && s.parentNode) s.parentNode.removeChild(s);
        }, 1300);
      }, cfg.delay);
    })(list[i]);
  }
}
