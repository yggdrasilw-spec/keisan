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
  var levelInput = document.getElementById('ninja-preset-level');
  var courseInput = document.getElementById('ninja-preset-course');
  var answerInput = document.getElementById('ninja-preset-answer');
  var level = levelInput && ['easy','hard','mix'].indexOf(levelInput.value) >= 0 ? levelInput.value : curLevel;
  var course = courseInput && ['20','all','weak'].indexOf(courseInput.value) >= 0 ? courseInput.value : curCourse;
  var answer = answerInput && ['random','calc','hw'].indexOf(answerInput.value) >= 0 ? answerInput.value : answerMode;
  var params = new URLSearchParams();
  params.set('preset', '1');
  params.set('level', ['easy','hard','mix'].indexOf(level) >= 0 ? level : 'easy');
  params.set('course', ['20','all','weak'].indexOf(course) >= 0 ? course : '20');
  params.set('answer', ['random','calc','hw'].indexOf(answer) >= 0 ? answer : 'random');
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
  var answer = params.get('answer');
  setSessionField('curLevel', level === 'hard' || level === 'mix' ? level : 'easy');
  if (['20','all','weak'].indexOf(course) < 0) course = '20';
  if (['random','calc','hw'].indexOf(answer) >= 0) setAnswerMode(answer);
  setSessionField('curCourse', course);
  updateCourseSelectSubtitles(curLevel);
  setTimeout(function() {
    if (course === 'weak' && getWeakPs(curLevel).length === 0) startCourse('20');
    else startCourse(course);
  }, 250);
}

window.addEventListener('load', function() {
  var levelInput = document.getElementById('ninja-preset-level');
  var courseInput = document.getElementById('ninja-preset-course');
  var answerInput = document.getElementById('ninja-preset-answer');
  if (levelInput) levelInput.value = curLevel;
  if (courseInput) courseInput.value = curCourse;
  if (answerInput) answerInput.value = answerMode;
  if (document.readyState === 'complete') applyNinjaPreset();
  else window.addEventListener('pageshow', applyNinjaPreset, { once: true });
}, { once: true });
