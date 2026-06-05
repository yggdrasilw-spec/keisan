// 10-router.js
// ======================================================
// 画面切替 / 初期化
// ======================================================
// 05-router-init-handwriting.js
// ======================================================
// 画面切替
// ======================================================
var _currentScreen = (appState && appState.ui && appState.ui.currentScreen) ? appState.ui.currentScreen : 'home';

function setCurrentScreen(n) {
  _currentScreen = n || 'home';
  if (typeof setCurrentScreenField === 'function') setCurrentScreenField(_currentScreen);
  else if (appState && appState.ui) appState.ui.currentScreen = _currentScreen;
  return _currentScreen;
}

function syncFullBleedScreenClass(screenName) {
  var body = document.body;
  if (!body) return;
  if (screenName === 'achievement') body.classList.add('screen-fullbleed');
  else body.classList.remove('screen-fullbleed');
}

function clearRuntimeTimers() {
  try { if (typeof countdownTimer !== 'undefined' && countdownTimer) { clearTimeout(countdownTimer); countdownTimer = null; } } catch (e) {}
  try { if (typeof clearScreenTransitionTimer === 'function') clearScreenTransitionTimer(); } catch (e) {}
  try { if (typeof tIv !== 'undefined' && tIv) { clearInterval(tIv); tIv = null; } } catch (e) {}
  try { if (typeof specialModeTimerIv !== 'undefined' && specialModeTimerIv) { clearInterval(specialModeTimerIv); specialModeTimerIv = null; } } catch (e) {}
}

function show(n) {
  if (!n) return;
  // 前回の遷移タイマーだけは先に止める
  if (typeof clearScreenTransitionTimer === 'function') clearScreenTransitionTimer();
  // 比較は更新前に行う
  var isSameScreen = (n === _currentScreen);
  // 画面状態を先に同期して、初期化タイミングのズレをなくす
  setCurrentScreen(n);
  // 画面切替のたびに、残っているオーバーレイを片付ける
  hideCountdownOverlay();
  if (isSameScreen) {
    var ss = document.querySelectorAll('.sc');
    for (var i = 0; i < ss.length; i++) ss[i].classList.remove('on');
    var same = document.getElementById(n);
    if (same) same.classList.add('on');
    syncFullBleedScreenClass(n);
    renderScreenEnterHooks(n);
    return;
  }
  var useWipe = getFx('fx_wipe');
  var wipe = useWipe ? document.getElementById('scene-wipe') : null;
  var next = document.getElementById(n);
  if (!next) return;
  var body = document.body;
  scheduleScreenTransition(n, next, body, useWipe);
}

// ======================================================
// 手書きモード
// ======================================================
