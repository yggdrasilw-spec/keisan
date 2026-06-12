// 14-special-modes.js
// ======================================================
// エンドコンテンツ / トルマリン固定 / 神速 / 無限
// ======================================================
(function () {
  'use strict';

  var ORIGINAL_SEIHA_BADGE_IDS = ['easy_20', 'easy_all', 'hard_20', 'hard_all', 'mix_20', 'mix_all'];
  var END_MODE_BUTTONS = ['cs-end-shinsoku', 'cs-end-mugen'];
  var TOURMALINE_GEM_INDEX = 18;
  var SHINSOKU_BADGE_IDS = ['easy_shinsoku', 'hard_shinsoku', 'mix_shinsoku'];
  var SHINSOKU_NORMAL_LABEL = '神速（しんそく）';
  var SHINSOKU_SUPER_LABEL = '超神速（ちょうしんそく）';
  var SHINSOKU_NORMAL_SUB = '1問 2びょう いないで こたえる ちょうせん';
  var SHINSOKU_SUPER_SUB = '1問 1.5びょう いないで こたえる ちょうせん';
  var SHINSOKU_NORMAL_LIMIT_MS = 2000;
  var SHINSOKU_SUPER_LIMIT_MS = 1500;
  var MUGEN_RANK_KEY_SUFFIX = '_mugen_best';
  var MUGEN_QUEUE_TOTAL = 1000;
  var MUGEN_MIN_LIMIT_MS = 2500;

  function hasOwn(obj, key) {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
  }

  function fmtMsToSec(ms) {
    return (Math.max(0, ms) / 1000).toFixed(2) + '秒';
  }

  function fmtCount(count) {
    return Math.max(0, count | 0) + 'もん';
  }

  function getRank1TimeText(level, course) {
    var entries = [];
    try { entries = rkGet(level, course) || []; } catch (e) { entries = []; }
    if (!entries.length) return '1位 まだなし';
    return '1位 ' + fmtMsToSec(entries[0].t);
  }

  function getMugenRankKey(level) {
    return level + MUGEN_RANK_KEY_SUFFIX;
  }

  function clearSpecialFinishTimer() {
    if (typeof window !== 'undefined' && window.specialModeFinishTimerIv) {
      clearTimeout(window.specialModeFinishTimerIv);
      window.specialModeFinishTimerIv = null;
    }
  }

  function scheduleSpecialFinish(reason, delayMs) {
    clearSpecialFinishTimer();
    window.specialModeFinishTimerIv = setTimeout(function () {
      window.specialModeFinishTimerIv = null;
      if (sess && (sess._specialOver || sess._specialAnswerLocked)) return;
      finishSpecialGameOver(reason || 'timeout');
    }, Math.max(0, delayMs || 0));
  }

  function getMugenBestCount(level) {
    var list = rkD && rkD[getMugenRankKey(level)];
    if (!list || !list.length) return 0;
    return Math.max(0, list[0] && list[0].t ? list[0].t : 0);
  }

  function addMugenBestCount(level, count) {
    if (!rkD) rkD = {};
    var key = getMugenRankKey(level);
    if (!rkD[key]) rkD[key] = [];
    var entry = { t: Math.max(0, count | 0), d: new Date().toLocaleDateString('ja-JP') };
    rkD[key].push(entry);
    rkD[key].sort(function (a, b) { return b.t - a.t; });
    rkD[key] = rkD[key].slice(0, 3);
    if (typeof lsSave === 'function' && typeof LS_RK !== 'undefined') {
      lsSave(LS_RK, rkD);
    }
    return rkD[key][0] ? rkD[key][0].t : 0;
  }

  function buildMugenQueue(level, totalCount) {
    var base = buildPLevel(level);
    if (!base || !base.length) return [];
    var out = [];
    for (var i = 0; i < totalCount; i++) {
      var src = base[Math.floor(Math.random() * base.length)];
      out.push({ a: src.a, b: src.b, ans: src.ans });
    }
    return out;
  }

  function getCourseSubtitleBase(level, course) {
    if (course === '20') return '20もん チャレンジ';
    if (course === 'all') {
      var allPs = buildPLevel(level);
      return allPs.length + 'もん ぜんぶ チャレンジ';
    }
    if (course === 'weak') return 'にがてな もんだいを れんしゅう';
    return '';
  }

  function setSubtitleHtml(id, mainText, subText) {
    var el = document.getElementById(id);
    if (!el) return;
    var html = '<div>' + mainText + '</div>';
    if (subText) html += '<div style="font-size:10px;font-weight:700;line-height:1.2;margin-top:2px;opacity:0.92;">' + subText + '</div>';
    el.innerHTML = html;
  }

  function updateCourseButtonSubtitles(level) {
    var lv = level || curLevel || 'easy';

    setSubtitleHtml('cs-sub-20', getCourseSubtitleBase(lv, '20'), getRank1TimeText(lv, '20'));
    setSubtitleHtml('cs-sub-all', getCourseSubtitleBase(lv, 'all'), getRank1TimeText(lv, 'all'));

    var mugenSub = document.getElementById('cs-sub-mugen');
    if (mugenSub) {
      var best = getMugenBestCount(lv);
      mugenSub.innerHTML = '<div>れんぞく こたえて きろくを のばす</div>'
        + '<div style="font-size:10px;font-weight:700;line-height:1.2;margin-top:2px;opacity:0.92;">さいこうきろく ' + fmtCount(best) + '</div>';
    }

    var shinsokuSub = document.getElementById('cs-sub-shinsoku');
    if (shinsokuSub) {
      shinsokuSub.innerHTML = '<div>' + getShinsokuButtonSub() + '</div>'
        + '<div style="font-size:10px;font-weight:700;line-height:1.2;margin-top:2px;opacity:0.92;">' + (hasAllShinsokuBadges() ? '3つそろって ちょうしんそく' : '3つの おうぎバッジで ちょうしんそく') + '</div>';
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

  function hasAllShinsokuBadges() {
    for (var i = 0; i < SHINSOKU_BADGE_IDS.length; i++) {
      if (!badgeData[SHINSOKU_BADGE_IDS[i]]) return false;
    }
    return true;
  }

  function getEndModeLabel(mode) {
    if (mode === 'shinsoku') {
      return hasAllShinsokuBadges() ? SHINSOKU_SUPER_LABEL : SHINSOKU_NORMAL_LABEL;
    }
    return { mugen: '無限（むげん）' }[mode] || mode;
  }

  function getShinsokuButtonTitle() {
    return hasAllShinsokuBadges() ? SHINSOKU_SUPER_LABEL : SHINSOKU_NORMAL_LABEL;
  }

  function getShinsokuButtonSub() {
    return hasAllShinsokuBadges() ? SHINSOKU_SUPER_SUB : SHINSOKU_NORMAL_SUB;
  }

  function syncShinsokuButtonText() {
    var btn = document.getElementById('cs-end-shinsoku');
    if (!btn) return;
    var title = btn.querySelector('.course-btn-title');
    var sub = document.getElementById('cs-sub-shinsoku');
    if (title) title.textContent = getShinsokuButtonTitle();
    if (sub) sub.textContent = getShinsokuButtonSub();
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
    syncShinsokuButtonText();
  }

  function refreshEndContentUi() {
    syncEndContentButtonState();
    updateCourseButtonSubtitles(curLevel);
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
    if (sessMode === 'shinsoku') {
      return hasAllShinsokuBadges() ? SHINSOKU_SUPER_LIMIT_MS : SHINSOKU_NORMAL_LIMIT_MS;
    }
    if (sessMode === 'mugen') {
      var base = 4000;
      var step = 120;
      var cleared = sess && sess.results ? sess.results.length : 0;
      var next = base - (cleared * step);
      return next < MUGEN_MIN_LIMIT_MS ? MUGEN_MIN_LIMIT_MS : next;
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

  function hideNormalRankBox() {
    var rankBox = document.getElementById('rv-rank-box');
    var rankMsg = document.getElementById('rv-rank-msg');
    if (rankBox) rankBox.style.display = 'none';
    if (rankMsg) rankMsg.textContent = '';
  }

  function finishSpecialGameOver(reason) {
    if (sess && (sess._sessionEnding || sess._specialOver)) return;
    clearSpecialFinishTimer();
    if (typeof clearNextQuestionTimer === 'function') clearNextQuestionTimer();
    if (tIv) { clearInterval(tIv); tIv = null; }
    if (sess) {
      sess._sessionEnding = true;
      sess._specialOver = true;
      sess.specialGameOverReason = reason || 'timeout';
      sess.specialGameOverElapsed = Date.now() - (sess.sessStartTime || Date.now());
    }
    if (typeof finish === 'function') finish(false);
  }

  function launchEndMode(mode) {
    if (!isEndMode(mode)) return;
    if (!hasAllSeihaBadges()) {
      showEndContentLockDialog();
      return;
    }

    try { var ac = getAC(); if (ac && ac.state === 'suspended') ac.resume(); } catch (e) {}

    var queue = (mode === 'mugen')
      ? buildMugenQueue(curLevel, MUGEN_QUEUE_TOTAL)
      : buildCourseQueue(curLevel, 'all');

    if (!queue || !queue.length) {
      alert('もんだいがありません');
      return;
    }

    var theme = getLevelTheme(curLevel);
    var levelLabel = getLevelLabel(curLevel);
    var modeLabel = getEndModeLabel(mode);

    setSessionFields({
      sess: {
        queue: queue,
        idx: 0,
        results: [],
        streak: 0,
        startTime: 0,
        sessStartTime: Date.now(),
        specialMode: mode,
        specialGameOverReason: '',
        specialQuestionLimitMs: 0,
        _sessionEnding: false,
        _specialOver: false,
        _specialAnswerLocked: false
      },
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

  // ── timer / answer hooks ────────────────────────────
  var _startPracticeTimer = typeof startPracticeTimer === 'function' ? startPracticeTimer : null;
  startPracticeTimer = function () {
    if (!isCurrentEndMode()) {
      hideSpecialTimerUi();
      if (_startPracticeTimer) return _startPracticeTimer();
      return;
    }

    if (tIv) { clearInterval(tIv); tIv = null; }
    clearSpecialFinishTimer();
    if (typeof clearNextQuestionTimer === 'function') clearNextQuestionTimer();
    sess.startTime = Date.now();
    var limitMs = getSpecialLimitMs();
    sess.specialQuestionLimitMs = limitMs;
    sess.specialQuestionDeadlineMs = sess.startTime + limitMs;
    sess._specialOver = false;
    sess._specialAnswerLocked = false;
    setSpecialTimerUi(limitMs, limitMs);

    tIv = setInterval(function () {
      var elapsed = Date.now() - sess.startTime;
      var remain = limitMs - elapsed;
      if (remain <= 0) {
        if (tIv) { clearInterval(tIv); tIv = null; }
        setSpecialTimerUi(0, limitMs);
        scheduleSpecialFinish('timeout', 120);
        return;
      }
      setSpecialTimerUi(remain, limitMs);
    }, 40);
  };

  var _submitPracticeAnswer = typeof submitPracticeAnswer === 'function' ? submitPracticeAnswer : null;
  submitPracticeAnswer = function (v, btn, p) {
    if (!isCurrentEndMode()) {
      if (_submitPracticeAnswer) return _submitPracticeAnswer(v, btn, p);
      return { ok: false, elapsed: 0 };
    }

    if (tIv) { clearInterval(tIv); tIv = null; }
    if (typeof clearNextQuestionTimer === 'function') clearNextQuestionTimer();
    var now = Date.now();
    var el = now - sess.startTime;
    var deadline = sess.specialQuestionDeadlineMs || (sess.startTime + getSpecialLimitMs());

    if (now >= deadline) {
      finishSpecialGameOver('timeout');
      return { ok: false, elapsed: el, gameOver: true };
    }

    clearSpecialFinishTimer();
    sess._specialAnswerLocked = true;

    if (v !== p.ans) {
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
    hideNormalRankBox();
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

    hideNormalRankBox();
    show('result');

    if (sessMode === 'mugen') {
      addMugenBestCount(curLevel, summary.tot);
      if (rbi) rbi.textContent = completed ? '🎉' : '⚔';
      if (rt2) rt2.textContent = completed ? ('1000問 ぜんぶ せいかい！') : ('記録 ' + summary.tot + '問');
      if (rs2) rs2.textContent = completed ? '全問正解エフェクト！' : 'ここまでの きろく';

      if (completed) {
        if (getFx('fx_perfect')) {
          try { sndPerfect(); } catch (e) {}
          if (typeof showPerfectEffect === 'function') {
            setTimeout(function () {
              showPerfectEffect(function () {});
            }, 140);
          }
        } else {
          try { sndGoodFinish(); } catch (e) {}
        }
      } else {
        try {
          sndTryAgain();
        } catch (e) {}
      }
    } else if (completed) {
      if (rbi) rbi.textContent = '⚡';
      if (rt2) rt2.textContent = (sessMode === 'shinsoku') ? (hasAllShinsokuBadges() ? 'ちょうしんそく クリア！' : 'しんそく クリア！') : 'むげん クリア！';
      if (rs2) rs2.textContent = summary.tot + 'もん ぜんぶ せいかい';

      var startUnlockSequence = function () {
        var unlocks = { gems: [], badge: null };
        try {
          unlocks = collectFinishUnlockRewards() || unlocks;
        } catch (e) {
          console.error('[finish] collectFinishUnlockRewards failed', e);
        }
        playFinishUnlockSequence(unlocks.gems || [], unlocks.badge || null, unlocks.beforeTotal, null, { skipPerfectEffect: true });
      };

      if (getFx('fx_perfect') && typeof showPerfectEffect === 'function') {
        try { sndPerfect(); } catch (e) {}
        show('result');
        setTimeout(function () {
          showPerfectEffect(startUnlockSequence);
        }, 140);
      } else {
        try { sndGoodFinish(); } catch (e) {}
        show('result');
        startUnlockSequence();
      }
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
    clearSpecialFinishTimer();
    if (typeof clearNextQuestionTimer === 'function') clearNextQuestionTimer();
    hideSpecialTimerUi();
  };

  if (typeof SCREEN_ENTER_HANDLERS !== 'undefined' && SCREEN_ENTER_HANDLERS) {
    var _courseSelectEnter = SCREEN_ENTER_HANDLERS['course-select'];
    SCREEN_ENTER_HANDLERS['course-select'] = function () {
      if (typeof _courseSelectEnter === 'function') _courseSelectEnter();
      refreshEndContentUi();
    };
  }

  if (typeof goLevel === 'function') {
    var _goLevel = goLevel;
    goLevel = function (level) {
      var ret = _goLevel(level);
      updateCourseButtonSubtitles(level);
      return ret;
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
  clearSpecialFinishTimer();
  hideSpecialTimerUi();
  updateCourseButtonSubtitles(curLevel);
})();
