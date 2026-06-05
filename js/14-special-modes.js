// 14-special-modes.js
// ======================================================
// エンドコンテンツ / トルマリン固定 / 神速 / 無限
// ======================================================
(function () {
  'use strict';

  var ORIGINAL_SEIHA_BADGE_IDS = ['easy_20', 'easy_all', 'hard_20', 'hard_all', 'mix_20', 'mix_all'];
  var END_MODE_LABELS = { shinsoku: '神速', mugen: '無限' };
  var END_MODE_BUTTONS = ['cs-end-shinsoku', 'cs-end-mugen'];
  var TOURMALINE_GEM_INDEX = 18;
  var SHINSOKU_BADGE_ID = 'shinsoku_clear';
  var SHINSOKU_BADGE_LABEL = '神速\nクリア！';
  var SHINSOKU_BADGE_IMG = './img/badge_easy_all.png';

  function hasOwn(obj, key) {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
  }

  function ensureSpecialCollections() {
    if (typeof ACH_GEMS !== 'undefined' && ACH_GEMS && ACH_GEMS.length >= 18) {
      var gem = ACH_GEMS[17];
      if (gem) {
        gem.id = 'tourmaline';
        gem.label = 'トルマリン';
        gem.img = './img/gem_10.png';
        gem.check = function () {
          return !!badgeData['tourmaline'] || isAllMasterForLevel('mix');
        };
      }
    }

    if (typeof BADGES !== 'undefined' && BADGES && !BADGES.some(function (b) { return b && b.id === SHINSOKU_BADGE_ID; })) {
      BADGES.push({
        id: SHINSOKU_BADGE_ID,
        ico: '⚡',
        name: SHINSOKU_BADGE_LABEL,
        unlockTitle: 'しんそく クリア せいはバッジ',
        cond: '神速モードを クリア',
        img: SHINSOKU_BADGE_IMG,
        level: 'special',
        course: 'shinsoku'
      });
    }
  }

  function isTourmalineUnlocked() {
    return !!badgeData['tourmaline'];
  }

  function getSeihaBadgeUnlockedCount() {
    var cnt = 0;
    for (var i = 0; i < ORIGINAL_SEIHA_BADGE_IDS.length; i++) {
      if (badgeData[ORIGINAL_SEIHA_BADGE_IDS[i]]) cnt++;
    }
    return cnt;
  }

  function hasAllSeihaBadges() {
    return getSeihaBadgeUnlockedCount() >= ORIGINAL_SEIHA_BADGE_IDS.length;
  }

  function isEndMode(mode) {
    return mode === 'shinsoku' || mode === 'mugen';
  }

  function isCurrentEndMode() {
    return isEndMode(sessMode);
  }

  function showEndContentLockDialog() {
    var el = document.getElementById('end-content-lock-dialog');
    if (el) el.style.display = 'flex';
  }

  function closeEndContentLockDialog() {
    var el = document.getElementById('end-content-lock-dialog');
    if (el) el.style.display = 'none';
  }

  function syncEndContentButtonState() {
    var unlocked = hasAllSeihaBadges();
    for (var i = 0; i < END_MODE_BUTTONS.length; i++) {
      var btn = document.getElementById(END_MODE_BUTTONS[i]);
      if (!btn) continue;
      btn.style.opacity = unlocked ? '' : '0.55';
      btn.style.filter = unlocked ? '' : 'grayscale(0.15)';
      btn.style.transform = '';
      btn.dataset.locked = unlocked ? 'false' : 'true';
      btn.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
    }
  }

  function refreshEndContentUi() {
    ensureSpecialCollections();
    syncEndContentButtonState();
  }

  function getEndModeLabel(mode) {
    return END_MODE_LABELS[mode] || mode;
  }

  function getLevelLabel(level) {
    return { easy: 'かんたん', hard: 'むずかしい', mix: 'ばらばら' }[level] || 'かんたん';
  }

  function getLevelTheme(level) {
    var levelColors = {
      easy: { bdg: 'bno', pcardCls: 'pcard', peqCls: 'peq', pgCol: '#5AAA30', rcardCls: 'rcard', rt2Cls: 'rt2', ragCls: 'rag' },
      hard: { bdg: 'bcy', pcardCls: 'pcard pcard-p', peqCls: 'peq peq-p', pgCol: '#7070D0', rcardCls: 'rcard rcard-p', rt2Cls: 'rt2 rt2-p', ragCls: 'rag rag-p' },
      mix:  { bdg: 'bno', pcardCls: 'pcard', peqCls: 'peq', pgCol: '#F5A623', rcardCls: 'rcard', rt2Cls: 'rt2', ragCls: 'rag' }
    };
    return levelColors[level] || levelColors.easy;
  }

  function setupPracticeFrame(theme, pbdgText) {
    var bdg = document.getElementById('pbdg');
    if (bdg) {
      bdg.textContent = pbdgText;
      bdg.className = 'pbdg ' + theme.bdg;
    }
    var pcard = document.getElementById('pcard');
    if (pcard) pcard.className = theme.pcardCls;
    var peq = document.getElementById('peq');
    if (peq) peq.className = theme.peqCls;
    var ptimer = document.getElementById('ptimer');
    if (ptimer) ptimer.className = 'ptimer' + (curLevel === 'hard' ? ' ptimer-p' : '');
    var pgbar = document.getElementById('pgbar');
    if (pgbar) pgbar.style.background = theme.pgCol;
    var rcard = document.getElementById('rcard');
    if (rcard) rcard.className = theme.rcardCls;
    var rt2 = document.getElementById('rt2');
    if (rt2) rt2.className = theme.rt2Cls;
    var resAgain = document.getElementById('res-again');
    if (resAgain) resAgain.className = theme.ragCls;
  }

  function getSpecialLimitMs() {
    if (sessMode === 'shinsoku') return 2000;
    if (sessMode === 'mugen') {
      var base = 4000;
      var step = 120;
      var min = 2500;
      var cleared = sess && sess.results ? sess.results.length : 0;
      var next = base - (cleared * step);
      return next < min ? min : next;
    }
    return 0;
  }

  function setSpecialTimerUi(remainingMs, limitMs) {
    var wrap = document.getElementById('timebar-wrap');
    var bar = document.getElementById('timebar');
    var label = document.getElementById('timebar-label');
    if (wrap) wrap.style.display = 'block';
    if (bar) {
      var pct = limitMs > 0 ? Math.max(0, Math.min(100, (remainingMs / limitMs) * 100)) : 0;
      bar.style.width = pct + '%';
    }
    if (label) {
      label.textContent = (Math.max(0, remainingMs) / 1000).toFixed(1) + 'びょう';
    }
    var ptimer = document.getElementById('ptimer');
    if (ptimer) {
      ptimer.textContent = '⏱ ' + (Math.max(0, remainingMs) / 1000).toFixed(1) + ' / ' + (limitMs / 1000).toFixed(1) + ' びょう';
    }
  }

  function hideSpecialTimerUi() {
    var wrap = document.getElementById('timebar-wrap');
    var bar = document.getElementById('timebar');
    var label = document.getElementById('timebar-label');
    if (wrap) wrap.style.display = 'none';
    if (bar) bar.style.width = '100%';
    if (label) label.textContent = '2.0びょう';
  }

  function finishSpecialGameOver(reason) {
    sess.specialGameOverReason = reason || 'timeout';
    sess.specialGameOverElapsed = Date.now() - (sess.sessStartTime || Date.now());
    if (typeof finish === 'function') finish(false);
  }

  function launchEndMode(mode) {
    if (!isEndMode(mode)) return;
    if (!hasAllSeihaBadges()) {
      showEndContentLockDialog();
      return;
    }

    try { var ac = getAC(); if (ac && ac.state === 'suspended') ac.resume(); } catch (e) {}

    var queue = buildCourseQueue(curLevel, 'all');
    if (!queue || !queue.length) {
      alert('もんだいがありません');
      return;
    }

    var theme = getLevelTheme(curLevel);
    var levelLabel = getLevelLabel(curLevel);
    var modeLabel = getEndModeLabel(mode);

    setSessionFields({
      sess: { queue: queue, idx: 0, results: [], streak: 0, startTime: 0, sessStartTime: Date.now(), specialMode: mode, specialGameOverReason: '', specialQuestionLimitMs: 0 },
      sessMode: mode,
      curCourse: 'all'
    });

    setupPracticeFrame(theme, levelLabel + ' ' + modeLabel);

    var rb = document.getElementById('res-back');
    var ra = document.getElementById('res-again');
    if (rb) {
      rb.setAttribute('data-action', 'show');
      rb.setAttribute('data-value', 'course-select');
    }
    if (ra) {
      ra.setAttribute('data-action', 'startEndMode');
      ra.setAttribute('data-value', mode);
    }

    show('practice');
    beginCountdown(showP);
  }

  function startEndMode(mode) {
    launchEndMode(mode);
  }

  // ── reward / unlock hooks ───────────────────────────
  var _collectFinishUnlockRewards = typeof collectFinishUnlockRewards === 'function' ? collectFinishUnlockRewards : null;
  collectFinishUnlockRewards = function () {
    var result = _collectFinishUnlockRewards ? (_collectFinishUnlockRewards() || { gems: [], badge: null }) : { gems: [], badge: null };
    var gems = result.gems || [];
    var badge = result.badge || null;

    if (sessMode === 'normal' && curCourse === 'weak' && !isTourmalineUnlocked() && isAllMasterForLevel(curLevel)) {
      badgeData['tourmaline'] = { date: new Date().toLocaleDateString('ja-JP') };
      saveBadgeData();
      gems.push({ img: './img/gem_10.png', name: getGemUnlockTextByIndex(TOURMALINE_GEM_INDEX) });
    }

    if (sessMode === 'shinsoku' && !badgeData[SHINSOKU_BADGE_ID]) {
      badgeData[SHINSOKU_BADGE_ID] = { date: new Date().toLocaleDateString('ja-JP') };
      saveBadgeData();
      badge = BADGES.find(function (b) { return b.id === SHINSOKU_BADGE_ID; }) || badge;
    }

    return { gems: gems, badge: badge };
  };

  // ── timer / answer hooks ────────────────────────────
  var _startPracticeTimer = typeof startPracticeTimer === 'function' ? startPracticeTimer : null;
  startPracticeTimer = function () {
    if (!isCurrentEndMode()) {
      hideSpecialTimerUi();
      if (_startPracticeTimer) return _startPracticeTimer();
      return;
    }

    if (tIv) { clearInterval(tIv); tIv = null; }
    sess.startTime = Date.now();
    var limitMs = getSpecialLimitMs();
    sess.specialQuestionLimitMs = limitMs;
    setSpecialTimerUi(limitMs, limitMs);

    tIv = setInterval(function () {
      var elapsed = Date.now() - sess.startTime;
      var remain = limitMs - elapsed;
      if (remain <= 0) {
        if (tIv) { clearInterval(tIv); tIv = null; }
        setSpecialTimerUi(0, limitMs);
        finishSpecialGameOver('timeout');
        return;
      }
      setSpecialTimerUi(remain, limitMs);
    }, 50);
  };

  var _submitPracticeAnswer = typeof submitPracticeAnswer === 'function' ? submitPracticeAnswer : null;
  submitPracticeAnswer = function (v, btn, p) {
    if (!isCurrentEndMode()) {
      if (_submitPracticeAnswer) return _submitPracticeAnswer(v, btn, p);
      return { ok: false, elapsed: 0 };
    }

    if (tIv) { clearInterval(tIv); tIv = null; }
    var el = Date.now() - sess.startTime;
    if (v !== p.ans) {
      sess.specialGameOverReason = 'miss';
      finishSpecialGameOver('miss');
      return { ok: false, elapsed: el, gameOver: true };
    }

    var ok = recordAndFeedbackAnswer(v, btn, p, el);
    return { ok: ok, elapsed: el };
  };

  var _resolvePracticeAnswer = typeof resolvePracticeAnswer === 'function' ? resolvePracticeAnswer : null;
  resolvePracticeAnswer = function (v, btn, p, submitted) {
    if (submitted && submitted.gameOver) return;
    if (_resolvePracticeAnswer) return _resolvePracticeAnswer(v, btn, p, submitted);
  };

  chk = function (v, btn, p) {
    var submitted = submitPracticeAnswer(v, btn, p);
    if (submitted && submitted.gameOver) return;
    resolvePracticeAnswer(v, btn, p, submitted);
  };

  // ── finish screen hooks ─────────────────────────────
  var _renderFinishSummaryToResultPage = typeof renderFinishSummaryToResultPage === 'function' ? renderFinishSummaryToResultPage : null;
  renderFinishSummaryToResultPage = function (summary, completed) {
    if (!isCurrentEndMode()) {
      if (_renderFinishSummaryToResultPage) return _renderFinishSummaryToResultPage(summary, completed);
      return;
    }

    var totText = summary.tot + '問';
    document.getElementById('rv-t').textContent = totText;
    document.getElementById('rv-a').textContent = completed ? summary.acc + '%' : '—';
    document.getElementById('rv-avg').textContent = completed ? (summary.avgT + '秒') : '—';
    document.getElementById('rv-total').textContent = completed ? ((summary.totalMs / 1000).toFixed(2) + '秒') : (((sess.specialGameOverElapsed || 0) / 1000).toFixed(2) + '秒');
  };

  var _renderFinishOutcome = typeof renderFinishOutcome === 'function' ? renderFinishOutcome : null;
  renderFinishOutcome = function (summary, completed) {
    if (!isCurrentEndMode()) {
      if (_renderFinishOutcome) return _renderFinishOutcome(summary, completed);
      return;
    }

    var rbi = document.getElementById('rbi');
    var rt2 = document.getElementById('rt2');
    var rs2 = document.getElementById('rs2');
    var rcard = document.getElementById('rcard');
    if (rcard) rcard.className = (curLevel === 'hard') ? 'rcard rcard-p' : 'rcard';

    show('result');

    if (completed) {
      sndGoodFinish();
      if (rbi) rbi.textContent = '⚡';
      if (rt2) rt2.textContent = (sessMode === 'shinsoku') ? 'しんそく クリア！' : 'むげん クリア！';
      if (rs2) rs2.textContent = summary.tot + 'もん ぜんぶ せいかい';

      var unlocks = { gems: [], badge: null };
      try {
        unlocks = collectFinishUnlockRewards() || unlocks;
      } catch (e) {
        console.error('[finish] collectFinishUnlockRewards failed', e);
      }
      playFinishUnlockSequence(unlocks.gems || [], unlocks.badge || null);
    } else {
      sndTryAgain();
      if (rbi) rbi.textContent = '⚔';
      if (rt2) rt2.textContent = '記録 ' + summary.tot + '問';
      if (rs2) rs2.textContent = 'ここまでの きろく';
    }

    var ra = document.getElementById('res-again');
    if (ra) {
      ra.setAttribute('data-action', 'startEndMode');
      ra.setAttribute('data-value', sessMode);
    }
    var rb = document.getElementById('res-back');
    if (rb) {
      rb.setAttribute('data-action', 'show');
      rb.setAttribute('data-value', 'course-select');
    }
  };

  var _resetRuntimeVisualState = typeof resetRuntimeVisualState === 'function' ? resetRuntimeVisualState : null;
  resetRuntimeVisualState = function () {
    if (_resetRuntimeVisualState) _resetRuntimeVisualState();
    hideSpecialTimerUi();
  };

  if (typeof SCREEN_ENTER_HANDLERS !== 'undefined' && SCREEN_ENTER_HANDLERS) {
    SCREEN_ENTER_HANDLERS['course-select'] = function () {
      refreshEndContentUi();
    };
  }

  if (typeof registerAppActions === 'function') {
    registerAppActions({
      startEndMode: function (value) {
        return startEndMode(value);
      },
      closeEndContentLock: function () {
        return closeEndContentLockDialog();
      }
    });
  }

  // 初期反映
  ensureSpecialCollections();
  hideSpecialTimerUi();
})();
