// 02-practice-feedback.js
// ======================================================
// 回答フィードバック・演出・UI反映
// ======================================================

function getFeedbackText(ok, isFast, streak, ans) {
  if (!ok) return '✗ こたえは ' + ans + ' だよ';
  if (streak >= 10) return '🌟 ' + streak + 'れんぞく！ にんじゃマスター！！';
  if (streak >= 5)  return '⚡🔥 ' + streak + 'れんぞく！ すごい！！';
  if (streak >= 3)  return '🔥 ' + streak + 'れんぞく！ せいかい！';
  if (isFast)       return '⚡ はやい！ せいかい！';
  return '✓ せいかい！';
}

function buildAnswerFeedbackSpec(ok, el, btn, p) {
  if (ok) {
    var isFast = el < 3000;
    var shuriOrigin = (btn && btn._calcOrigin) ? btn._calcOrigin : btn;
    return {
      ok: true,
      text: getFeedbackText(true, isFast, sess.streak, p.ans),
      cls: 'fbl fbok',
      delay: 600,
      isFast: isFast,
      shuriOrigin: shuriOrigin,
      shuriCount: sess.streak >= 10 ? 10 : sess.streak >= 5 ? 5 : sess.streak >= 3 ? 3 : 1
    };
  }
  return {
    ok: false,
    text: getFeedbackText(false, false, 0, p.ans),
    cls: 'fbl fbng',
    delay: 1400
  };
}

function disableAnswerButtons() {
  var abtns = document.querySelectorAll('.abtn');
  for (var i = 0; i < abtns.length; i++) abtns[i].onclick = null;
  return abtns;
}

function markAnswerButtons(btn, ok, p) {
  var abtns = disableAnswerButtons();
  if (btn && btn.classList && abtns.length > 0) {
    btn.classList.add(ok ? 'correct' : 'wrong');
    if (!ok) {
      for (var i = 0; i < abtns.length; i++) {
        if (parseInt(abtns[i].textContent, 10) === p.ans) abtns[i].classList.add('correct');
      }
    }
  }
}

function playAnswerFeedback(ok, el, btn, p) {
  var spec = buildAnswerFeedbackSpec(ok, el, btn, p);
  if (spec.ok) {
    sess.streak++;
    showImg('seikai', 600);
    if (sess.streak >= 3) {
      sndStreak(sess.streak);
    } else if (spec.isFast) {
      sndFast();
    } else {
      sndCorrect();
    }
    var sec = el / 1000;
    hSpeak(getPraiseMsg(sec));
    if (spec.shuriOrigin) {
      throwShurikenBurst(spec.shuriOrigin, spec.shuriCount);
    }
    return { text: spec.text, cls: spec.cls, delay: spec.delay };
  }
  sess.streak = 0;
  showImg('fuseikai', 1200);
  sndWrong();
  return { text: spec.text, cls: spec.cls, delay: spec.delay };
}

function renderAnswerFeedbackToUI(fx) {
  var fbl = document.getElementById('fbl');
  if (!fbl || !fx) return;
  fbl.textContent = fx.text;
  fbl.className = fx.cls;
}

function queueNextQuestion(delay) {
  console.log('[DBG] queueNextQuestion', {
    delay: delay || 0,
    idx: sess && sess.idx,
    queueLen: sess && sess.queue ? sess.queue.length : '(none)',
    resultsLen: sess && sess.results ? sess.results.length : '(none)'
  });
  setTimeout(function(){
    console.log('[DBG] queueNextQuestion->showP(before)', {
      idx: sess && sess.idx,
      queueLen: sess && sess.queue ? sess.queue.length : '(none)'
    });
    sess.idx++;
    console.log('[DBG] queueNextQuestion->showP(after)', {
      idx: sess && sess.idx,
      queueLen: sess && sess.queue ? sess.queue.length : '(none)'
    });
    showP();
  }, delay || 0);
}

function recordAndFeedbackAnswer(v, btn, p, el) {
  var ok = v === p.ans;
  fitEq(p.a + ' ＋ ' + p.b + ' ＝ ' + p.ans);
  recordAnswerResult(p, ok, el);
  markAnswerButtons(btn, ok, p);
  return ok;
}
