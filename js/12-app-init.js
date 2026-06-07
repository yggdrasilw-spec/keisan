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

  // すでに遷移タイマーが動いている（ユーザーがボタンを押した）なら何もしない
  if (typeof _showTimer !== 'undefined' && _showTimer) return;

  var ss = document.querySelectorAll('.sc');
  for (var i = 0; i < ss.length; i++) ss[i].classList.remove('on');
  var target = document.getElementById(screenName);
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



function getLaunchTargetFromUrl() {
  try {
    var params = new URLSearchParams(window.location.search || '');
    var openTarget = params.get('open');
    if (openTarget) return openTarget;
    var hash = (window.location.hash || '').replace(/^#/, '');
    if (hash) return hash;
  } catch (e) {}
  return '';
}

var __startupOverlayBound = false;
var __startupOverlayStarting = false;
var __startupOverlayCleanup = null;


function primeStartupMedia() {
  try {
    var audio = document.getElementById('startup-kiru-audio');
    if (audio && typeof audio.load === 'function') {
      audio.load();
    }
  } catch (e) {}
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try { window.speechSynthesis.getVoices(); } catch (e) {}
  }
}

function __hideStartupOverlayNow(overlay) {
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.style.pointerEvents = 'none';
  setTimeout(function() {
    overlay.style.display = 'none';
  }, 220);
}

function __playStartupSound() {
  try {
    var audio = document.getElementById('startup-kiru-audio');
    if (audio) {
      try { audio.pause(); } catch (e) {}
      try { audio.currentTime = 0; } catch (e) {}
      try { audio.load(); } catch (e) {}
      var p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(function(){});
      return;
    }
  } catch (e) {}
  if (typeof playFileSound === 'function') {
    try { playFileSound('./sound/kiru.mp3'); } catch (e) {}
  }
}

function initStartupOverlay() {
  var overlay = document.getElementById('startup-overlay');
  var stage = document.getElementById('startup-stage');
  if (!overlay || __startupOverlayBound) return;
  __startupOverlayBound = true;

  var cleanup = function() {
    if (__startupOverlayCleanup) {
      __startupOverlayCleanup();
      __startupOverlayCleanup = null;
    }
  };

  var start = function(ev) {
    if (__startupOverlayStarting) return;
    __startupOverlayStarting = true;

    if (ev) {
      if (typeof ev.preventDefault === 'function') ev.preventDefault();
      if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
    }

    cleanup();
    __playStartupSound();
    if (typeof primeVoiceEngine === 'function') {
      setTimeout(function() {
        try { primeVoiceEngine(); } catch (e) {}
      }, 0);
    }
    __hideStartupOverlayNow(overlay);

    setTimeout(function() {
      if (document.body) document.body.classList.remove('booting');
      if (typeof show === 'function') {
        try { show('home'); } catch (e) {}
      } else if (typeof setCurrentScreen === 'function') {
        setCurrentScreen('home');
      }
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      __startupOverlayStarting = false;
    }, 160);
  };

  var opts = { passive: false, capture: true };
  var events = ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown'];
  var bound = [];
  var handler = function(ev) {
    if (ev && ev.type === 'keydown') {
      var key = ev.key || ev.code || '';
      if (key !== 'Enter' && key !== ' ' && key !== 'Spacebar') return;
    }
    start(ev);
  };

  for (var i = 0; i < events.length; i++) {
    overlay.addEventListener(events[i], handler, opts);
    bound.push([overlay, events[i], handler, opts]);
  }
  if (stage && stage !== overlay) {
    for (var j = 0; j < events.length; j++) {
      stage.addEventListener(events[j], handler, opts);
      bound.push([stage, events[j], handler, opts]);
    }
  }
  if (document && document.body) {
    for (var k = 0; k < events.length; k++) {
      document.body.addEventListener(events[k], handler, opts);
      bound.push([document.body, events[k], handler, opts]);
    }
  }

  __startupOverlayCleanup = function() {
    for (var x = 0; x < bound.length; x++) {
      try {
        bound[x][0].removeEventListener(bound[x][1], bound[x][2], bound[x][3]);
      } catch (e) {}
    }
    bound = [];
  };
}

function initApp() {

  primeStartupMedia();

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

  var launchTarget = getLaunchTargetFromUrl();
  if (launchTarget && typeof show === 'function') {
    if (document.body) document.body.classList.remove('booting');
    var overlayNow = document.getElementById('startup-overlay');
    if (overlayNow && overlayNow.parentNode) {
      overlayNow.parentNode.removeChild(overlayNow);
    }
    try { show(launchTarget); } catch (e) {}
    scheduleInitialScreenNormalize();
    if (getFx('fx_button')) initButtonFX();
    return;
  }

  initStartupOverlay();
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
