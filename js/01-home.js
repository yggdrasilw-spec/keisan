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

function createNinjaPresetUrl() {
  var params = new URLSearchParams();
  params.set('preset', '1');
  params.set('level', curLevel === 'hard' || curLevel === 'mix' ? curLevel : 'easy');
  params.set('course', curCourse === 'all' || curCourse === 'weak' ? curCourse : '20');
  var url = new URL(window.location.href);
  url.search = params.toString();
  url.hash = '';
  var input = document.getElementById('ninja-preset-url');
  var result = document.getElementById('ninja-preset-result');
  if (input) input.value = url.href;
  if (result) result.style.display = 'block';
}

function copyNinjaPresetUrl() {
  var input = document.getElementById('ninja-preset-url');
  if (!input || !input.value) return;
  var done = function() {
    var toast = document.getElementById('ninja-preset-toast');
    if (!toast) return;
    toast.style.display = 'inline';
    setTimeout(function() { toast.style.display = 'none'; }, 1800);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(input.value).then(done).catch(function() {
      input.select();
      try { if (document.execCommand('copy')) done(); } catch (e) {}
    });
  } else {
    input.select();
    try { if (document.execCommand('copy')) done(); } catch (e) {}
  }
}

function applyNinjaPreset() {
  var params;
  try { params = new URLSearchParams(window.location.search || ''); } catch (e) { return; }
  if (params.get('preset') !== '1') return;
  var level = params.get('level');
  var course = params.get('course');
  setSessionField('curLevel', level === 'hard' || level === 'mix' ? level : 'easy');
  setSessionField('curCourse', course === 'all' || course === 'weak' ? course : '20');
  updateCourseSelectSubtitles(curLevel);
  setTimeout(function() { startCourse(curCourse); }, 250);
}

window.addEventListener('load', function() {
  if (document.readyState === 'complete') applyNinjaPreset();
  else window.addEventListener('pageshow', applyNinjaPreset, { once: true });
}, { once: true });
