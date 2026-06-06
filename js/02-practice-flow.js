// 02-practice-flow.js
// ======================================================
// 練習問題の準備・表示切替
// ======================================================

function preparePracticeQuestion(p, tot) {
  renderPracticeTop(p, tot);
  calcInput = '';
  sess._calcDone = false;
  hwBeginQuestion();
  hwOnShowP();
  renderPracticeHint(p);
  startPracticeTimer();
}

function showP() {
  if (sess.idx >= sess.queue.length) { finish(true); return; }
  var p = sess.queue[sess.idx], tot = sess.queue.length;
  preparePracticeQuestion(p, tot);
}
