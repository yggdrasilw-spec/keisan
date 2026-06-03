// 02-practice-finish.js
// ======================================================
// 終了処理・結果画面・解放処理
// ======================================================

function endSess() {
  if (tIv){clearInterval(tIv);tIv=null;}
  if (typeof nextQuestionTimer !== 'undefined' && nextQuestionTimer) { clearTimeout(nextQuestionTimer); nextQuestionTimer = null; }
  if (sess) sess._answerLocked = false;
  if (!sess.results||!sess.results.length){show(sessMode==='kotsu'?'kotsu-sub':'course-select');return;}
  finish();
}

function renderFinishOutcome(summary, completed) {
  var tot = summary.tot;
  var cor = summary.cor;
  var acc = summary.acc;

  if (acc===100 && completed) {
    document.getElementById('rbi').textContent='🎉';
    document.getElementById('rt2').textContent='かんぺき！すごい！';
    document.getElementById('rs2').textContent=tot+'もんちゅう '+cor+'もん せいかい';
    show('result');

    var unlocks = collectFinishUnlockRewards();
    playFinishUnlockSequence(unlocks.gems, unlocks.badge);
    return;
  } else if (acc===100 || acc>=70) {
    sndGoodFinish();
    var isFullAcc = (acc===100);
    document.getElementById('rbi').textContent = isFullAcc ? '🎉' : '😊';
    document.getElementById('rt2').textContent = isFullAcc ? 'ぜんぶ せいかい！さいごまで やってみよう！' : 'よくできました！';
  } else {
    sndTryAgain();
    document.getElementById('rbi').textContent='💪';
    document.getElementById('rt2').textContent='もう少し！がんばれ！';
  }
  document.getElementById('rs2').textContent=tot+'もんちゅう '+cor+'もん せいかい';
  show('result');
}

function finish(completed) {
  if (tIv){clearInterval(tIv);tIv=null;}
  if (typeof nextQuestionTimer !== 'undefined' && nextQuestionTimer) { clearTimeout(nextQuestionTimer); nextQuestionTimer = null; }
  if (sess) sess._answerLocked = false;
  var summary = computeSessionSummary();
  renderFinishSummaryToResultPage(summary, completed);
  renderFinishOutcome(summary, completed);
}
