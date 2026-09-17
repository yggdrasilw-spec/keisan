// Recitation is practice only: it never calls the answer/statistics/reward path.
var recitationState = null;
function recitationActive() { return recitationState !== null; }
function uniqueMissedProblems(results) {
  var seen = new Set();
  return results.filter(function(r) {
    if (r.ok || !r.p) return false;
    var key = r.p.a + '+' + r.p.b;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map(function(r) { return r.p; });
}
function renderRecitationSettings() {
  var area = document.getElementById('recitation-settings');
  if (!area) return;
  document.getElementById('recite-enabled').checked = ['immediate','end','both'].includes(learningPrefs.recite);
  document.getElementById('recite-when').value = learningPrefs.recite === 'off' || !learningPrefs.recite ? 'both' : learningPrefs.recite;
  document.getElementById('recite-count').value = recitationCount();
  area.querySelectorAll('select').forEach(function(el) { el.disabled = !document.getElementById('recite-enabled').checked; });
}
function startRecitation(problems, done) {
  if (recitationActive() || !problems.length) return;
  clearNextQuestionTimer();
  if (tIv) { clearInterval(tIv); tIv = null; }
  if (typeof clearSpecialFinishTimer === 'function') clearSpecialFinishTimer();

  recitationState = { problems: problems, index: 0, step: 0, count: recitationCount(), done: done, session: sess };
  document.getElementById('app').inert = true;
  setQuitBarVisible(false);
  document.getElementById('recitation-overlay').hidden = false;
  renderRecitation();
}
function renderRecitation() {
  var state = recitationState, p = state.problems[state.index];
  var visible = state.step < Math.ceil(state.count / 2);
  document.getElementById('recitation-progress').textContent = (state.index + 1) + ' / ' + state.problems.length + 'もん ・ ' + (state.step + 1) + ' / ' + state.count + 'かい';
  document.getElementById('recitation-instruction').textContent = visible ? 'こたえを みながら こえに だそう' : 'こたえを みないで こえに だそう';
  document.getElementById('recitation-equation').textContent = p.a + ' ＋ ' + p.b + ' ＝ ' + (visible ? p.ans : '？');
  document.getElementById('recitation-peek').hidden = visible;
  document.getElementById('recitation-next').focus();
}
function advanceRecitation() {
  var state = recitationState;
  if (!state) return;
  state.step++;
  if (state.step >= state.count) { state.step = 0; state.index++; }
  if (state.index < state.problems.length) { renderRecitation(); return; }
  recitationState = null;
  document.getElementById('recitation-overlay').hidden = true;
  document.getElementById('app').inert = false;
  if (state.session !== sess) return;
  setQuitBarVisible(!sess._sessionEnding);
  state.done();
}
document.addEventListener('DOMContentLoaded', function() {
  syncMasterDescriptions();
  var area = document.createElement('section');
  area.id = 'recitation-settings'; area.className = 'learning-settings';
  area.innerHTML = '<h2>🗣 唱えて おぼえる</h2><label><input id="recite-enabled" type="checkbox"> まちがえた もんだいを 唱える</label>' +
    '<label>いつ？ <select id="recite-when"><option value="immediate">まちがえた直後</option><option value="end">セッションの最後</option><option value="both">直後と最後の両方</option></select></label>' +
    '<label>1もんにつき <select id="recite-count">' + [5,6,7,8,9,10].map(function(n) {return '<option>' + n + '</option>';}).join('') + '</select> 回</label>' +
    '<p>前半は答えを見ながら、後半は答えをかくして唱えます。1回ずつ「唱えた」を押して進みます。最後の復習では同じ問題をまとめます。</p>';
  document.getElementById('settings').appendChild(area);
  area.addEventListener('change', function() {
    learningPrefs.recite = document.getElementById('recite-enabled').checked ? document.getElementById('recite-when').value : 'off';
    learningPrefs.count = Number(document.getElementById('recite-count').value);
    saveLearningPrefs(); renderRecitationSettings();
  });
  var overlay = document.createElement('div');
  overlay.id = 'recitation-overlay'; overlay.hidden = true;
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-labelledby','recitation-title');
  overlay.innerHTML = '<section class="recitation-card"><h1 id="recitation-title">🗣 唱えて おぼえよう</h1><p id="recitation-progress" aria-live="polite"></p><h2 id="recitation-instruction"></h2><div id="recitation-equation"></div><button id="recitation-peek">こたえを たしかめる</button><button id="recitation-next">1かい 唱えた ✓</button><p>式と答えを、声に出して言おう。声の自動判定はありません。</p></section>';
  document.body.appendChild(overlay);
  document.getElementById('recitation-next').onclick = advanceRecitation;
  document.getElementById('recitation-peek').onclick = function() {
    var s = recitationState;
    if (!s) return;
    // Looking again restarts the hidden-answer part, preserving retrieval practice.
    var p = s.problems[s.index];
    document.getElementById('recitation-equation').textContent = p.a + ' ＋ ' + p.b + ' ＝ ' + p.ans;
    s.step = Math.ceil(s.count / 2) - 1;
    document.getElementById('recitation-instruction').textContent = 'たしかめたら、もういちど かくして 唱えよう';
    document.getElementById('recitation-peek').hidden = true;
  };
  overlay.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var buttons = Array.from(overlay.querySelectorAll('button')).filter(function(b) { return !b.hidden; });
    var i = buttons.indexOf(document.activeElement);
    e.preventDefault(); buttons[(i + (e.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus();
  });
  renderRecitationSettings();
});

