// 05-hint-layout.js
// ======================================================
// ヒント共通レイアウト補助
// ======================================================

function hMakeDot(brd, lx, ty, color, id, dotPx) {
  var d = document.createElement("div");
  d.id = id;
  d.style.cssText = 'width:'+dotPx+'px;height:'+dotPx+'px;border-radius:50%;position:absolute;'
    +'left:'+lx+'px;top:'+ty+'px;transition:left 0.8s ease,top 0.8s ease,background 0.4s;z-index:2;';
  d.style.background = color;
  brd.appendChild(d);
  return d;
}

function hMakeLbl(brd, lx, ty, text, color, id, fs) {
  var d = document.createElement("div");
  if (id) d.id = id;
  d.style.cssText = 'position:absolute;font-weight:800;font-family:Nunito,sans-serif;'
    +'left:'+lx+'px;top:'+ty+'px;font-size:'+fs+'px;color:'+color
    +';transition:left 0.8s ease,top 0.8s ease,opacity 0.4s;line-height:1;z-index:3;white-space:nowrap;';
  d.textContent = text;
  brd.appendChild(d);
  return d;
}

function hDotPositions(n, ox, oy, dotPx, gap) {
  var step = dotPx + gap;
  var positions = [];
  for (var i = 0; i < n; i++) {
    var col = i % 5;
    var row = Math.floor(i / 5);
    positions.push({ x: ox + col * step, y: oy + row * step });
  }
  return positions;
}
