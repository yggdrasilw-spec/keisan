// 01-kotsu-session.js
// ======================================================
// コツ：練習開始
// ======================================================
function kStart() {
  var startAchievementCount = (typeof getUnlockedAchievementCount === 'function')
    ? getUnlockedAchievementCount().totalOn
    : null;
  console.log('[DBG] kStart', {
    mode: kSt.mode,
    num: kSt.num,
    startAchievementCount: startAchievementCount
  });

  var ps = kFiltP();
  if (!ps.length) { alert('がいとうするもんだいがありません。'); return; }
  var weak = [], rest = [];
  for (var i = 0; i < ps.length; i++) {
    var st = getSt(kD[kk(kSt.num, ps[i])]);
    if (st === 'weak') weak.push(ps[i]);
    else rest.push(ps[i]);
  }
  setSessionFields({ sess:{queue:sh(weak).concat(sh(rest)).slice(0,Math.min(ps.length,20)),idx:0,results:[],streak:0,startTime:0,sessStartTime:Date.now(), startAchievementCount: startAchievementCount, _sessionEnding:false, _specialOver:false, _specialAnswerLocked:false}, sessMode:'kotsu' });
  var bdg = document.getElementById('pbdg');
  bdg.textContent = kModeLabel(kSt.mode) + ' ' + kSt.num + 'をたすもんだい';
  bdg.className = 'pbdg bkotsu';
  document.getElementById('pcard').className = 'pcard pcard-p';
  document.getElementById('peq').className = 'peq peq-p';
  document.getElementById('ptimer').className = 'ptimer ptimer-p';
  document.getElementById('pgbar').style.background = '#7070D0';
  document.getElementById('rcard').className = 'rcard rcard-p';
  document.getElementById('rt2').className = 'rt2 rt2-p';
  document.getElementById('res-again').className = 'rag rag-p';
  var rb = document.getElementById('res-back');
  var ra = document.getElementById('res-again');
  if (rb) rb.setAttribute('data-action', 'show');
  if (rb) rb.setAttribute('data-value', 'kotsu-sub');
  if (ra) ra.setAttribute('data-action', 'kStart');
  try { var ac = getAC(); if (ac && ac.state === 'suspended') ac.resume(); } catch(e) {}
  show('practice');
  beginCountdown(showP);
}
