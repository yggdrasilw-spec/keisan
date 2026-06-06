// 01-home.js
// ======================================================
// ホーム
// ======================================================
function updateCourseSelectSubtitles(level) {
  var lv = level || curLevel || 'easy';
  var titles = { easy:'🌱 かんたん', hard:'⭐ むずかしい', mix:'🎲 ばらばら' };
  var titleEl = document.getElementById('cs-title');
  if (titleEl) titleEl.textContent = titles[lv] + ' — コース を えらぼう';

  var allPs = buildPLevel(lv);
  var sub20 = document.getElementById('cs-sub-20');
  if (sub20) sub20.textContent = '20もん チャレンジ / ' + rkBestTimeLabel(lv, '20');

  var subAll = document.getElementById('cs-sub-all');
  if (subAll) subAll.textContent = allPs.length + 'もん ぜんぶ チャレンジ / ' + rkBestTimeLabel(lv, 'all');

  var weakPs = getWeakPs(lv);
  var subWeak = document.getElementById('cs-sub-weak');
  if (subWeak) subWeak.textContent = weakPs.length + 'もん（にがて）';

  var kb = document.getElementById('cs-kotsu-btn');
  if (kb) kb.style.display = lv === 'mix' ? 'none' : 'flex';
}

function goLevel(level) {
  setSessionField('curLevel', level);
  updateCourseSelectSubtitles(level);
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
