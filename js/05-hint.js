// 05-hint.js
// ======================================================
// ヒント表示 / ヒントアニメ
// ======================================================
// ======================================================
// ヒントアニメ
// ======================================================
// ======================================================
// ヒントアニメ
// ======================================================
var hintStep = 0;
var hintP = null;
var hintVisible = false;

function toggleHint() {
  var box = document.getElementById('hint-box');
  var btn = document.getElementById('hint-btn');
  hintVisible = !hintVisible;
  box.style.display = hintVisible ? 'block' : 'none';
  btn.textContent = hintVisible ? '💡 ヒントをかくす' : '💡 ヒントをみる';
  if (hintVisible && hintStep === 0) hintDraw();
}

function hintReset() {
  hintStep = 0;
  hintDraw();
}

function hintNext() {
  hintStep++;
  hintAnimate();
}

function hintSetProblem(p) {
  hintP = p;
  hintStep = 0;
  hintVisible = false;
  var box = document.getElementById('hint-box');
  var btn = document.getElementById('hint-btn');
  if (box) box.style.display = 'none';
  if (btn) btn.textContent = '💡 ヒントをみる';
}

function hintBoardW() {
  var b = document.getElementById('hint-board');
  return b ? b.offsetWidth : 320;
}

function hintEl(id) { return document.getElementById(id); }
