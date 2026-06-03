// 01-home.js
// ======================================================
// ホーム
// ======================================================
function goLevel(level) {
  if (window.__dbgLog) window.__dbgLog('goLevel('+level+') start');
  setSessionField('curLevel', level);
  var titles = { easy:'🌱 かんたん', hard:'⭐ むずかしい', mix:'🎲 ばらばら' };
  document.getElementById('cs-title').textContent = titles[level] + ' — コース を えらぼう';
  var allPs = buildPLevel(level);
  document.getElementById('cs-sub-all').textContent = allPs.length + 'もん ぜんぶ チャレンジ';
  var weakPs = getWeakPs(level);
  document.getElementById('cs-sub-weak').textContent = weakPs.length + 'もん（にがて）';
  var kb = document.getElementById('cs-kotsu-btn');
  if (kb) kb.style.display = level === 'mix' ? 'none' : 'flex';
  show('course-select');
}

function getWeakPs(level) {
  var ps = buildPLevel(level);
  var out = [];
  for (var i = 0; i < ps.length; i++) {
    var k = gkLevel(level, ps[i]);
    var st = getSt(gD[k]);
    if (st === 'weak' || st === 'unseen') out.push(ps[i]);
  }
  return out;
}
