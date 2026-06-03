// 10-router-transition.js
// ======================================================
// 画面切替のタイマー / 演出補助
// ======================================================
var _showTimer = null;

function clearScreenTransitionTimer() {
  if (_showTimer) {
    clearTimeout(_showTimer);
    _showTimer = null;
  }
}

function fadeOutSceneWipe(wipe) {
  if (!wipe) return;
  setTimeout(function(){
    wipe.style.transition = 'opacity 80ms linear';
    wipe.style.opacity = '0';
    setTimeout(function(){
      wipe.classList.remove('active');
      wipe.style.transition = '';
      wipe.style.opacity = '';
    }, 90);
  }, 540);
}

function applyScreenTransition(n, next, body) {
  if (typeof syncVisibleScreenDom === 'function') syncVisibleScreenDom(n);
  else {
    var ss = document.querySelectorAll('.sc');
    for (var i = 0; i < ss.length; i++) ss[i].classList.remove('on');
    next.classList.add('on');
    setCurrentScreen(n);
    syncFullBleedScreenClass(n);
  }
  var qb = document.getElementById('quit-bar');
  if (qb) {
    if (n === 'practice') qb.classList.add('show');
    else qb.classList.remove('show');
  }
  renderScreenEnterHooks(n);
}

function scheduleScreenTransition(n, next, body, useWipe) {
  clearScreenTransitionTimer();
  var wipe = useWipe ? document.getElementById('scene-wipe') : null;
  if (wipe) { wipe.classList.remove('active'); void wipe.offsetWidth; wipe.classList.add('active'); }
  _showTimer = setTimeout(function(){
    applyScreenTransition(n, next, body);
  }, useWipe ? 280 : 0);
  if (useWipe) fadeOutSceneWipe(wipe);
}
