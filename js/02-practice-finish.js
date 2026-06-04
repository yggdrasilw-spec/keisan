// 02-practice-finish.js
// ======================================================
// 終了処理・結果画面・解放処理
// ======================================================

function endSess() {
  if (tIv){clearInterval(tIv);tIv=null;}
  console.log('[DBG] endSess', {
    mode: sessMode,
    resultsLen: sess && sess.results ? sess.results.length : '(none)',
    idx: sess && typeof sess.idx === 'number' ? sess.idx : '(none)',
    queueLen: sess && sess.queue ? sess.queue.length : '(none)'
  });
  if (!sess.results||!sess.results.length){show(sessMode==='kotsu'?'kotsu-sub':'course-select');return;}
  finish();
}

function renderFinishOutcome(summary, completed) {
  var tot = summary.tot;
  var cor = summary.cor;
  var acc = summary.acc;
  console.log('[DBG] renderFinishOutcome', {
    completed: !!completed,
    tot: tot,
    cor: cor,
    acc: acc,
    fxPerfect: (typeof getFx === 'function') ? getFx('fx_perfect') : '(no getFx)'
  });

  if (acc===100 && completed) {
    document.getElementById('rbi').textContent='🎉';
    document.getElementById('rt2').textContent='かんぺき！すごい！';
    document.getElementById('rs2').textContent=tot+'もんちゅう '+cor+'もん せいかい';
    show('result');

    var unlocks = collectFinishUnlockRewards();
    console.log('[DBG] perfect branch', {
      gems: unlocks && unlocks.gems ? unlocks.gems.length : '(none)',
      badge: !!(unlocks && unlocks.badge),
      hasShowPerfectEffect: typeof showPerfectEffect,
      hasShowGemUnlockEffect: typeof showGemUnlockEffect,
      hasShowBadgeUnlockEffect: typeof showBadgeUnlockEffect
    });
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
  var summary = computeSessionSummary();
  console.log('[DBG] finish', {
    completed: !!completed,
    tot: summary && summary.tot,
    cor: summary && summary.cor,
    acc: summary && summary.acc
  });
  renderFinishSummaryToResultPage(summary, completed);
  renderFinishOutcome(summary, completed);
}
