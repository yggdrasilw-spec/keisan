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
  if (bar) {
    if (sessMode === 'shinsoku' || sessMode === 'mugen') bar.style.width = '100%';
    else bar.style.width = Math.round(sess.idx / tot * 100) + '%';
  }
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
  if (sessMode === 'shinsoku' || sessMode === 'mugen') {
    startSpecialModeTimer();
  }
  tIv = setInterval(function() {
    var el = document.getElementById('ptimer');
    if (!el) return;
    if (sessMode === 'shinsoku' || sessMode === 'mugen') {
      if (specialModeLimitMs) {
        var remain = Math.max(0, specialModeLimitMs - (Date.now() - specialModeStartMs));
        el.textContent = '⏱ のこり ' + (remain / 1000).toFixed(1) + ' びょう';
      }
    } else {
      el.textContent = '⏱ ' + ((Date.now() - sess.startTime) / 1000).toFixed(1) + ' びょう';
    }
  }, 100);
}




function clearSpecialModeTimer() {
  if (specialModeTimerIv) {
    clearInterval(specialModeTimerIv);
    specialModeTimerIv = null;
  }
  specialModeLimitMs = 0;
  specialModeStartMs = 0;
}

function getSpecialModeLimitMs() {
  if (sessMode === 'shinsoku') return 2000;
  if (sessMode === 'mugen') {
    var base = 4600 - ((sess && typeof sess.idx === 'number') ? sess.idx * 3 : 0);
    return Math.max(2500, base);
  }
  return 0;
}

function updateSpecialModeTimerUI() {
  var bar = document.getElementById('pgbar');
  var pt = document.getElementById('ptimer');
  if (!bar || !specialModeLimitMs) return;
  var elapsed = Date.now() - specialModeStartMs;
  var remain = Math.max(0, specialModeLimitMs - elapsed);
  var ratio = remain / specialModeLimitMs;
  bar.style.width = Math.max(0, Math.min(100, ratio * 100)) + '%';
  if (pt) pt.textContent = '⏱ のこり ' + (remain / 1000).toFixed(1) + ' びょう';
}

function handleSpecialModeTimeout() {
  if (sess && sess._specialOver) return;
  if (sess) sess._specialOver = true;
  clearSpecialModeTimer();
  if (tIv) { clearInterval(tIv); tIv = null; }
  setTimeout(function() {
    finish(false);
  }, 180);
}

function startSpecialModeTimer() {
  clearSpecialModeTimer();
  if (sessMode !== 'shinsoku' && sessMode !== 'mugen') return;
  specialModeLimitMs = getSpecialModeLimitMs();
  specialModeStartMs = Date.now();
  updateSpecialModeTimerUI();
  specialModeTimerIv = setInterval(function() {
    var elapsed = Date.now() - specialModeStartMs;
    if (elapsed >= specialModeLimitMs) {
      updateSpecialModeTimerUI();
      handleSpecialModeTimeout();
      return;
    }
    updateSpecialModeTimerUI();
  }, 40);
}
