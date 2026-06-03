// 05-hint-animate.js
function hintAnimate() {
  var brd = document.getElementById('hint-board');
  var msg = document.getElementById('hint-msg');
  if (!brd || !hintP || !window._hCtx) return;

  var c = window._hCtx;
  var A = c.A;
  var B = c.B;
  var near = c.near;
  var other = c.other;
  var move = c.move;
  var remain = c.remain;
  var Lox = c.Lox;
  var Rox = c.Rox;
  var oy = c.oy;
  var dotPx = c.dotPx;
  var gap = c.gap;
  var step = c.step;
  var fs = c.fs;
  var lblY = c.lblY;
  var topMargin = c.topMargin;

  // ── step1: 「nearは10にちかいね！」 ──────────────────
  if (hintStep === 1) {
    msg.textContent = near + ' は 10 に ちかいね！';
    hSpeak(toHira(near) + ' は じゅう に ちかいね！');
  }
  else if (hintStep === 2) {
    hHintStep2(brd, msg, c, other, move, remain, step, fs, lblY, topMargin, Lox);
  }
  else if (hintStep === 3) {
    hHintStep3(brd, msg, c, near, other, move, step, fs, topMargin, Rox, oy, dotPx, gap);
  }
  else if (hintStep === 4) {
    hHintStep4(brd, msg, c, near, move, remain, fs, lblY, Rox, oy, dotPx, gap, step);
  }
  else if (hintStep === 5) {
    hHintStep5(brd, msg, A, B, fs);
  }
  else {
    hintStep = 0;
    hintDraw();
  }
}
