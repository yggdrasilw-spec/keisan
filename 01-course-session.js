// 01-course-session.js
// ======================================================
// コース開始 / セッション起動
// ======================================================
function startCourse(course) {
  setSessionField('curCourse', course);
  var built = buildCourseQueue(curLevel, course);
  if (built && built.ganbarePs) {
    if (built.ganbarePs.length > 0) {
      window._ganbarePs = built.ganbarePs;
      document.getElementById('ask-ganbare-dialog').style.display = 'flex';
    } else {
      showAllMasterPopup();
    }
    return;
  }

  var queue = built;
  if (!queue || !queue.length) { alert('もんだいがありません'); return; }
  launchSession(queue, 'normal');
}

function startEndMode(mode) {
  if (!hasUnlockedCoreBadges()) {
    showEndContentLock();
    return;
  }
  var queue = buildEndModeQueue(curLevel, mode);
  if (!queue || !queue.length) { alert('もんだいがありません'); return; }
  launchSession(queue, mode);
}

function launchSession(queue, mode) {
  if (typeof clearNextQuestionTimer === 'function') clearNextQuestionTimer();
  if (typeof clearSpecialFinishTimer === 'function') clearSpecialFinishTimer();
  try { var ac = getAC(); if (ac && ac.state === 'suspended') ac.resume(); } catch(e) {}

  var levelColors = {
    easy:  { bdg:'bno', pcardCls:'pcard', peqCls:'peq', pgCol:'#5AAA30', rcardCls:'rcard', rt2Cls:'rt2', ragCls:'rag' },
    hard:  { bdg:'bcy', pcardCls:'pcard pcard-p', peqCls:'peq peq-p', pgCol:'#7070D0', rcardCls:'rcard rcard-p', rt2Cls:'rt2 rt2-p', ragCls:'rag rag-p' },
    mix:   { bdg:'bno', pcardCls:'pcard', peqCls:'peq', pgCol:'#F5A623', rcardCls:'rcard', rt2Cls:'rt2', ragCls:'rag' },
  };
  var c = levelColors[curLevel] || levelColors.easy;
  var levelLabels = { easy:'かんたん', hard:'むずかしい', mix:'ばらばら' };
  var courseLabels = { '20':'20もん', all:'ぜんぶ', weak:'にがて' };
  var specialLabels = { shinsoku:'神速（しんそく）', mugen:'無限（むげん）' };

  var startAchievementTotal = (typeof getUnlockedAchievementCount === 'function') ? getUnlockedAchievementCount().totalOn : 0;
  var startAchievementStage = (typeof getAchStageByCount === 'function') ? getAchStageByCount(startAchievementTotal) : null;
  setSessionFields({ sess: { queue: queue, idx: 0, results: [], streak: 0, startTime: 0, sessStartTime: Date.now(), _sessionEnding: false, _specialOver: false, _specialAnswerLocked: false, specialQuestionDeadlineMs: 0, specialMode: mode || 'normal', startAchievementTotal: startAchievementTotal, startAchievementStageLv: startAchievementStage ? startAchievementStage.lv : null }, sessMode: mode || 'normal' });

  if (mode && mode !== 'normal') {
    setSessionField('curCourse', 'all');
  }

  var bdg = document.getElementById('pbdg');
  if (bdg) {
    var label = levelLabels[curLevel] + ' ' + courseLabels[curCourse];
    if (mode && specialLabels[mode]) label += ' / ' + specialLabels[mode];
    bdg.textContent = label;
    bdg.className = 'pbdg ' + c.bdg;
  }

  document.getElementById('pcard').className = c.pcardCls;
  document.getElementById('peq').className   = c.peqCls;
  document.getElementById('ptimer').className = 'ptimer' + (curLevel==='hard'?' ptimer-p':'');
  document.getElementById('pgbar').style.background = c.pgCol;
  document.getElementById('rcard').className = c.rcardCls;
  document.getElementById('rt2').className   = c.rt2Cls;
  document.getElementById('res-again').className = c.ragCls;
  var rb = document.getElementById('res-back');
  var ra = document.getElementById('res-again');
  if (rb) rb.setAttribute('data-action', 'show');
  if (rb) rb.setAttribute('data-value', 'course-select');
  if (ra) {
    if (mode && mode !== 'normal') {
      ra.setAttribute('data-action', 'startEndMode');
      ra.setAttribute('data-value', mode);
    } else {
      ra.setAttribute('data-action', 'startCourse');
      ra.setAttribute('data-value', curCourse);
    }
  }

  show('practice');
  beginCountdown(showP);
}
