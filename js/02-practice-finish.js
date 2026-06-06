// 02-practice-finish.js
// ======================================================
// 終了処理・結果画面・解放処理
// ======================================================

function endSess() {
  if (sess) sess._sessionEnding = true;
  if (typeof clearNextQuestionTimer === 'function') clearNextQuestionTimer();
  if (typeof clearSpecialFinishTimer === 'function') clearSpecialFinishTimer();
  if (tIv){clearInterval(tIv);tIv=null;}
  if (!sess.results||!sess.results.length){show(sessMode==='kotsu'?'kotsu-sub':'course-select');return;}
  finish(false);
}

function renderFinishOutcome(summary, completed) {
  var tot = summary.tot;
  var cor = summary.cor;
  var acc = summary.acc;

  if (sessMode === 'mugen' && !completed) {
    sndTryAgain();
    document.getElementById('rbi').textContent='💥';
    document.getElementById('rt2').textContent='ゲームオーバー';
    document.getElementById('rs2').textContent='きろく ' + tot + 'もん';
    show('result');
    return;
  }

  if (acc===100 && completed) {
    document.getElementById('rbi').textContent='🎉';
    document.getElementById('rt2').textContent = sessMode === 'mugen' ? '1000もん ぜんぶ せいかい！' : 'かんぺき！すごい！';
    document.getElementById('rs2').textContent = sessMode === 'mugen'
      ? '1000もん ぜんぶ せいかい！'
      : (tot+'もんちゅう '+cor+'もん せいかい');
    show('result');

    var unlocks = { gems: [], badge: null };
    try {
      unlocks = collectFinishUnlockRewards(completed) || unlocks;
    } catch (e) {
      console.error('[finish] collectFinishUnlockRewards failed', e);
    }
    playFinishUnlockSequence(unlocks.gems || [], unlocks.badge || null);
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
  document.getElementById('rs2').textContent = sessMode === 'mugen'
    ? 'きろく ' + tot + 'もん'
    : (tot+'もんちゅう '+cor+'もん せいかい');
  show('result');
}

function finish(completed) {
  if (sess) sess._sessionEnding = true;
  if (typeof clearNextQuestionTimer === 'function') clearNextQuestionTimer();
  if (typeof clearSpecialFinishTimer === 'function') clearSpecialFinishTimer();
  if (tIv){clearInterval(tIv);tIv=null;}
  var summary = computeSessionSummary();
  renderFinishSummaryToResultPage(summary, completed);
  renderFinishOutcome(summary, completed);
}
