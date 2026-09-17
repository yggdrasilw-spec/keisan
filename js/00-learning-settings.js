// Shared mastery threshold and optional recitation preferences.
var learningPrefs = storageLoadJSON('tashizan_learning_v1', {});
if (!learningPrefs || typeof learningPrefs !== 'object') learningPrefs = {};
function getMasterMs() {
  var value = Number(learningPrefs.masterSeconds);
  return Number.isFinite(value) && value >= 0.1 && value <= 60 ? Math.round(value * 10) * 100 : 3000;
}
function isMasterTime(ms) { return Number.isFinite(ms) && ms >= 0 && ms < getMasterMs(); }
function saveLearningPrefs() { storageSaveJSON('tashizan_learning_v1', learningPrefs); }
function recitationEnabled(when) {
  return learningPrefs.recite === when || learningPrefs.recite === 'both';
}
function recitationCount() {
  return Math.max(5, Math.min(10, Math.round(Number(learningPrefs.count) || 5)));
}
function syncMasterDescriptions() {
  if (typeof BADGES === 'undefined') return;
  BADGES.filter(function(b) { return b.course === '20' || b.course === 'all'; }).forEach(function(b) { b.cond = b.cond.replace(/[\d.]+びょう以内/g, (getMasterMs()/1000).toFixed(1) + 'びょう未満').replace(/[\d.]+びょう未満/g, (getMasterMs()/1000).toFixed(1) + 'びょう未満'); });
}
function renderMasterControl(parent) {
  var label = document.createElement('label');
  label.textContent = 'マスター判定（秒未満） ';
  var input = document.createElement('input');
  input.type = 'number'; input.min = '0.1'; input.max = '60'; input.step = '0.1';
  input.value = (getMasterMs()/1000).toFixed(1);
  input.style.width = '90px';
  input.onchange = function() {
    if (!input.checkValidity() || !input.value) { input.value = (getMasterMs()/1000).toFixed(1); return; }
    learningPrefs.masterSeconds = Math.round(Number(input.value)*10)/10;
    saveLearningPrefs(); syncMasterDescriptions();
    if (typeof refreshVisibleScreen === 'function') refreshVisibleScreen();
  };
  label.appendChild(input); parent.appendChild(label);
  var note = document.createElement('small');
  note.textContent = '初期値3.0秒。記録のマスター・宝石・コースバッジに共通で適用。取得済みバッジは保持します。';
  parent.appendChild(note);
}
