// 05-hint-render.js
// ======================================================
// ヒント初期描画
// ======================================================

function hintDraw() {
  var brd = document.getElementById('hint-board');
  var msg = document.getElementById('hint-msg');
  if (!brd || !hintP) return;
  brd.innerHTML = '';
  msg.textContent = '';

  var W = hintBoardW();
  var dotPx = Math.max(14, Math.round(W / 22));
  var gap   = Math.max(3,  Math.round(dotPx * 0.25));
  var step  = dotPx + gap;
  var fs    = Math.max(12, Math.round(dotPx * 0.9));

  var A = hintP.a, B = hintP.b;
  var nearIsB = (10 - B) <= (10 - A);
  var near    = nearIsB ? B : A;
  var other   = nearIsB ? A : B;
  var move    = 10 - near;
  var remain  = other - move;

  var Aox = Math.round(W * 0.04);
  var Box = Math.round(W * 0.54);
  var Lox = nearIsB ? Aox : Box;
  var Rox = nearIsB ? Box : Aox;
  var topMargin = Math.round(fs * 2.0);
  var oy  = Math.round(dotPx * 0.6) + topMargin;

  var otherPos = hDotPositions(other, Lox, oy, dotPx, gap);
  var nearPos  = hDotPositions(near,  Rox, oy, dotPx, gap);

  var Acolor = '#3ea6ff'; var ATc = '#1a7fc0';
  var Bcolor = '#ff5a5a'; var BTc = '#cc2222';
  var otherColor = nearIsB ? Acolor : Bcolor;
  var nearColor  = nearIsB ? Bcolor : Acolor;
  var otherTc    = nearIsB ? ATc    : BTc;
  var nearTc     = nearIsB ? BTc    : ATc;

  for (var i = 0; i < other; i++) hMakeDot(brd, otherPos[i].x, otherPos[i].y, otherColor, 'hOt'+i, dotPx);
  for (var i = 0; i < near; i++) hMakeDot(brd, nearPos[i].x, nearPos[i].y, nearColor, 'hNt'+i, dotPx);

  var lblY = oy + step * 2 + Math.round(gap * 1.5);
  hMakeLbl(brd, Lox, lblY, other, otherTc, 'hOL', fs);
  hMakeLbl(brd, Rox, lblY, near,  nearTc,  'hNL', fs);

  window._hCtx = {
    A: A, B: B,
    nearIsB: nearIsB, near: near, other: other,
    move: move, remain: remain,
    Lox: Lox, Rox: Rox, oy: oy,
    dotPx: dotPx, gap: gap, step: step, fs: fs, lblY: lblY,
    topMargin: topMargin,
    otherColor: otherColor, nearColor: nearColor,
    otherTc: otherTc, nearTc: nearTc,
    otherPos: otherPos, nearPos: nearPos
  };
}
