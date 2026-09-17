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
  if (!submitted.ok && recitationEnabled('immediate')) {
    startRecitation([p], function() { queueNextQuestion(0); });
    return;
  }
  queueNextQuestion(fx.delay);
}

function chk(v,btn,p) {
  if (!sess || sess._answerSubmitted || sess._sessionEnding || recitationActive() || !sess.queue || sess.queue[sess.idx] !== p || _currentScreen !== 'practice') return;
  sess._answerSubmitted = true;
  sess._calcDone = true;
  var submitted = submitPracticeAnswer(v, btn, p);
  if (!submitted || submitted.gameOver) return;
  resolvePracticeAnswer(v, btn, p, submitted);
}
