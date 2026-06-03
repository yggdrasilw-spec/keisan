// 02-practice-answer.js
// ======================================================
// 回答受付の入口
// ======================================================

function submitPracticeAnswer(v, btn, p) {
  if (sess._answerLocked) return null;
  sess._answerLocked = true;
  if (tIv){clearInterval(tIv);tIv=null;}
  var el = Date.now() - sess.startTime;
  var ok = recordAndFeedbackAnswer(v, btn, p, el);
  return { ok: ok, elapsed: el };
}

function resolvePracticeAnswer(v, btn, p, submitted) {
  if (!submitted) return;
  var fx = playAnswerFeedback(submitted.ok, submitted.elapsed, btn, p);
  renderAnswerFeedbackToUI(fx);
  queueNextQuestion(fx.delay);
}

function chk(v,btn,p) {
  var submitted = submitPracticeAnswer(v, btn, p);
  resolvePracticeAnswer(v, btn, p, submitted);
}
