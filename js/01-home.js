// 01-home.js
// ======================================================
// ホーム
// ======================================================
function renderCourseSelectScreen(level) {
  var lv = level || curLevel || 'easy';
  var titles = { easy:'🌱 かんたん', hard:'⭐ むずかしい', mix:'🎲 ばらばら' };
  var titleEl = document.getElementById('cs-title');
  if (titleEl) titleEl.textContent = titles[lv] + ' — コース を えらぼう';
  var allPs = buildPLevel(lv);
  var allEl = document.getElementById('cs-sub-all');
  if (allEl) allEl.textContent = allPs.length + 'もん ぜんぶ チャレンジ';
  var weakPs = getWeakPs(lv);
  var weakEl = document.getElementById('cs-sub-weak');
  if (weakEl) weakEl.textContent = weakPs.length + 'もん（にがて）';
  var kb = document.getElementById('cs-kotsu-btn');
  if (kb) kb.style.display = lv === 'mix' ? 'none' : 'flex';
}

function goLevel(level) {
  setSessionField('curLevel', level);
  renderCourseSelectScreen(level);
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
