// 12-app-init.js
// ======================================================
// 起動時初期化
// ======================================================
function setElementClass(id, className) {
  var el = document.getElementById(id);
  if (!el) return;
  el.className = className;
}

function resetRuntimeVisualState() {
  if (document && document.body) {
    document.body.classList.remove('screen-jolt');
    document.body.classList.remove('screen-fullbleed');
  }

  var wipe = document.getElementById('scene-wipe');
  if (wipe) {
    wipe.classList.remove('active');
  }

  var imgOverlay = document.getElementById('img-overlay');
  if (imgOverlay) {
    imgOverlay.classList.remove('show');
  }
  var overlayImg = document.getElementById('overlay-img');
  if (overlayImg) {
    overlayImg.src = '';
  }

  var perfect = document.getElementById('perfect-overlay');
  if (perfect) {
    perfect.classList.remove('show');
  }

  if (typeof hideCountdownOverlay === 'function') hideCountdownOverlay();
  if (typeof clearRuntimeTimers === 'function') clearRuntimeTimers();

  var screens = document.querySelectorAll('.sc');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('on');
  }
  var home = document.getElementById('home');
  if (home) home.classList.add('on');

  setElementClass('pbdg', 'pbdg');
  setElementClass('pcard', 'pcard');
  setElementClass('peq', 'peq');
  setElementClass('ptimer', 'ptimer');
  setElementClass('rcard', 'rcard');
  setElementClass('rt2', 'rt2');
  setElementClass('res-again', 'rag');
  setElementClass('res-back', 'rbk');
  setElementClass('hint-box', '');
  setElementClass('hint-msg', '');

  var pgbar = document.getElementById('pgbar');
  if (pgbar) {
    pgbar.style.background = '';
    pgbar.style.width = '0%';
  }
  var pctr = document.getElementById('pctr');
  if (pctr) pctr.textContent = '1/10';
  var pbdg = document.getElementById('pbdg');
  if (pbdg) pbdg.textContent = '-';
  var peq = document.getElementById('peq');
  if (peq) peq.textContent = '? ＋ ? ＝ ？';
  var ptimer = document.getElementById('ptimer');
  if (ptimer) ptimer.textContent = '⏱ 0.0 びょう';
  var fbl = document.getElementById('fbl');
  if (fbl) {
    fbl.textContent = '';
    fbl.className = 'fbl';
  }
  var stk = document.getElementById('stk');
  if (stk) stk.textContent = '';

  if (typeof syncHistoryTabButtons === 'function') syncHistoryTabButtons();
  if (typeof renderFxSettings === 'function') renderFxSettings();
  if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
  if (typeof syncVoiceSettingsUI === 'function') syncVoiceSettingsUI();
  if (typeof syncImageSettingsUI === 'function') syncImageSettingsUI();
  if (typeof setAnswerMode === 'function') setAnswerMode(answerMode);
}

function resetTransientUi() {
  if (typeof clearRuntimeTimers === 'function') clearRuntimeTimers();
  if (typeof hideCountdownOverlay === 'function') hideCountdownOverlay();
}

function normalizeVisibleScreen() {
  var screenName = (appState && appState.ui && appState.ui.currentScreen)
    ? appState.ui.currentScreen
    : (_currentScreen ? _currentScreen : 'home');
  if (window.__dbgLog) window.__dbgLog('normalize: screen='+screenName+' timer='+!!(typeof _showTimer!=='undefined'&&_showTimer));

  // すでに遷移タイマーが動いている（ユーザーがボタンを押した）なら何もしない
  if (typeof _showTimer !== 'undefined' && _showTimer) return;

  var ss = document.querySelectorAll('.sc');
  for (var i = 0; i < ss.length; i++) ss[i].classList.remove('on');
  var target = document.getElementById(screenName);
  if (window.__dbgLog) window.__dbgLog('normalize: target='+(target?target.id:'NULL'));
  if (target) target.classList.add('on');
  if (typeof syncFullBleedScreenClass === 'function') syncFullBleedScreenClass(screenName);
}

function scheduleInitialScreenNormalize() {
  if (window.__appInitialScreenNormalizeScheduled) return;
  window.__appInitialScreenNormalizeScheduled = true;

  var run = function () {
    window.__appInitialScreenNormalizeScheduled = false;
    normalizeVisibleScreen();
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(function () {
      requestAnimationFrame(run);
    });
  } else {
    setTimeout(run, 0);
  }
}

function initApp() {
  // 画像カスタムを先に読み込む
  imgCustomLoad();

  // まず見た目を完全に初期化する
  resetRuntimeVisualState();

  // 画面状態の初期値をそろえる
  if (typeof resetUiState === 'function') {
    resetUiState({
      currentScreen: 'home',
      history: (typeof makeDefaultHistoryState === 'function') ? makeDefaultHistoryState() : { recTab:'easy', recCourse:'20', statTab:'easy' }
    });
  } else {
    if (typeof setCurrentScreen === 'function') setCurrentScreen('home');
    else _currentScreen = 'home';
    if (typeof resetHistoryState === 'function') {
      resetHistoryState();
    } else if (typeof setHistorySnapshot === 'function') {
      setHistorySnapshot({ recTab:'easy', recCourse:'20', statTab:'easy' });
    } else if (typeof setHistoryField === 'function') {
      setHistoryField('recTab', 'easy');
      setHistoryField('recCourse', '20');
      setHistoryField('statTab', 'easy');
    } else if (appState && appState.ui && appState.ui.history) {
      appState.ui.history.recTab = 'easy';
      appState.ui.history.recCourse = '20';
      appState.ui.history.statTab = 'easy';
    }
  }

  if (typeof syncHistoryTabButtons === 'function') syncHistoryTabButtons();
  setAnswerMode(answerMode);
  resetTransientUi();
  scheduleInitialScreenNormalize();

  // ボタン演出は設定に応じて後から有効化
  if (getFx('fx_button')) initButtonFX();
}


if (typeof window !== 'undefined' && !window.__appPageshowBound) {
  window.__appPageshowBound = true;
  window.addEventListener('pageshow', function (event) {
    // bfcache 復帰時だけ、残りタイマーと一時オーバーレイを消す
    if (!event || !event.persisted) return;
    resetTransientUi();
    scheduleInitialScreenNormalize();
  });
  window.addEventListener('pagehide', function () {
    resetTransientUi();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    initApp();
  }, { once: true });
} else {
  initApp();
}
