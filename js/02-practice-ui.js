// 02-practice-ui.js
// ======================================================
// 練習画面の表示・時間表示
// ======================================================

function fitEq(text) {
  var el = document.getElementById('peq');
  if (!el) return;
  el.textContent = text;
  var parent = el.parentElement;
  if (!parent) return;
  var maxW = parent.clientWidth - 32;
  var fs = 46;
  el.style.fontSize = fs + 'px';
  while (el.scrollWidth > maxW && fs > 22) {
    fs -= 1;
    el.style.fontSize = fs + 'px';
  }
}

function renderPracticeTop(p, tot) {
  var ctr = document.getElementById('pctr');
  var bar = document.getElementById('pgbar');
  if (ctr) ctr.textContent = (sess.idx + 1) + '/' + tot;
  if (bar) bar.style.width = Math.round(sess.idx / tot * 100) + '%';
  fitEq(p.a + ' ＋ ' + p.b + ' ＝ ？');

  var fbl = document.getElementById('fbl');
  if (fbl) {
    fbl.textContent = '';
    fbl.className = 'fbl';
  }

  var stk = document.getElementById('stk');
  if (stk) stk.textContent = sess.streak >= 3 ? '🔥 ' + sess.streak + 'れんぞく！' : '';
}

function renderPracticeHint(p) {
  var ha = document.getElementById('hint-area');
  if (!ha) return;
  var isCarry = (p.a + p.b >= 11);
  ha.style.display = isCarry ? 'block' : 'none';
  if (isCarry) hintSetProblem(p);
}

function startPracticeTimer() {
  sess.startTime = Date.now();
  if (tIv) clearInterval(tIv);
  tIv = setInterval(function() {
    var el = document.getElementById('ptimer');
    if (el) el.textContent = '⏱ ' + ((Date.now() - sess.startTime) / 1000).toFixed(1) + ' びょう';
  }, 100);
}


