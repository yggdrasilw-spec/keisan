// 02-practice-answer.js
// ======================================================
// 回答受付の入口
// ======================================================

function submitPracticeAnswer(v, btn, p) {
  if (tIv){clearInterval(tIv);tIv=null;}
  var el = Date.now() - sess.startTime;
  var ok = recordAndFeedbackAnswer(v, btn, p, el);
  return { ok: ok, elapsed: el };
}

function resolvePracticeAnswer(v, btn, p, submitted) {
  var fx = playAnswerFeedback(submitted.ok, submitted.elapsed, btn, p);
  renderAnswerFeedbackToUI(fx);
  if (!submitted.ok && sessMode === 'mugen') {
    if (sess) sess._specialOver = true;
    clearSpecialModeTimer();
    if (tIv) { clearInterval(tIv); tIv = null; }
    setTimeout(function() {
      finish(false);
    }, fx && fx.delay ? fx.delay : 900);
    return;
  }
  queueNextQuestion(fx.delay);
}

function chk(v,btn,p) {
  var submitted = submitPracticeAnswer(v, btn, p);
  resolvePracticeAnswer(v, btn, p, submitted);
}
