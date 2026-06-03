// 03-history-ui.js
// ======================================================
// 記録・統計 / リセット（UI）
// ======================================================
// 03-history-settings-hint-voice.js
// ======================================================
// 記録・統計（history）
// ======================================================

function syncHistoryTabButtons() {
  var hs = getHistoryState();
  toggleTabButtons('rtab-', ['easy','hard','mix'], hs.recTab);
  toggleTabButtons('rtab-', ['20','all','weak'], hs.recCourse);
  toggleTabButtons('stab-', ['easy','hard','mix'], hs.statTab);
}

var historyTabsBound = false;
function historyBindTabs() {
  if (historyTabsBound) return;
  historyTabsBound = true;
  ['easy','hard','mix'].forEach(function(k) {
    var rec = document.getElementById('rtab-' + k);
    if (rec) rec.addEventListener('click', function(){ historySetRecTab(k); });
    var stat = document.getElementById('stab-' + k);
    if (stat) stat.addEventListener('click', function(){ historySetStatTab(k); });
  });
  ['20','all','weak'].forEach(function(k) {
    var el = document.getElementById('rtab-' + k);
    if (el) el.addEventListener('click', function(){ historySetRecCourse(k); });
  });
}

function historySetRecTab(t) {
  if (typeof setHistoryField === 'function') setHistoryField('recTab', t);
  else historyState.recTab = t;
  syncHistoryTabButtons();
  historyRenderRecords();
}

function historySetRecCourse(c) {
  if (typeof setHistoryField === 'function') setHistoryField('recCourse', c);
  else historyState.recCourse = c;
  syncHistoryTabButtons();
  historyRenderRecords();
}

function historySetStatTab(t) {
  if (typeof setHistoryField === 'function') setHistoryField('statTab', t);
  else historyState.statTab = t;
  syncHistoryTabButtons();
  historyRenderStats();
}


function historyRenderRecords() {
  historyBindTabs();
  var rlist = document.getElementById('rlist');
  if (!rlist) return;

  var hs = getHistoryState();
  var recTab = hs.recTab;
  var recCourse = hs.recCourse;
  syncHistoryTabButtons();
  var filtered = historyGetFilteredProblems(recTab, recCourse);
  var h = '';

  for (var i = 0; i < filtered.length; i++) {
    h += historyBuildRecordItemHtml(filtered[i], recTab);
  }

  if (!h) h = '<div style="text-align:center;padding:18px;font-size:13px;color:#8A7050;font-weight:600;">がいとうするもんだいがありません</div>';
  rlist.innerHTML = h;

  var rkBox = document.getElementById('rec-ranking-box');
  var rkList = document.getElementById('rec-ranking-list');
  if (recCourse === 'weak') {
    if (rkBox) rkBox.style.display = 'none';
    if (rkList) rkList.innerHTML = '';
    return;
  }
  if (rkBox) rkBox.style.display = 'block';
  if (rkList) rkList.innerHTML = historyBuildRankingHtml(recTab, recCourse);
}

function historyRenderStats() {
  historyBindTabs();
  var hs = getHistoryState();
  var statTab = hs.statTab;
  syncHistoryTabButtons();
  var ps = buildPLevel(statTab);
  var counts = historyBuildStatsCounts(statTab);

  var elM = document.getElementById('ss-m');
  var elO = document.getElementById('ss-ok');
  var elW = document.getElementById('ss-w');
  var elTitle = document.getElementById('st-gtitle');
  var elGrid = document.getElementById('st-hgrid');
  if (!elM || !elO || !elW || !elTitle || !elGrid) return;

  elM.textContent = counts.master;
  elO.textContent = counts.ok;
  elW.textContent = counts.weak;
  var levelTitles = {easy:'🌱 かんたん（' + ps.length + 'もん）', hard:'⭐ むずかしい（' + ps.length + 'もん）', mix:'🎲 ばらばら（' + ps.length + 'もん）'};
  elTitle.textContent = levelTitles[statTab] || '';
  var h = '';
  for (var i = 0; i < ps.length; i++) {
    var st = getSt(gD[gkLevel(statTab, ps[i])]);
    h += '<div class="hcell" style="background:' + ST_HG[st] + ';color:' + ST_HTC[st] + '" title="' + ps[i].a + '+' + ps[i].b + '=' + ps[i].ans + '">' + ps[i].a + '+' + ps[i].b + '</div>';
  }
  elGrid.innerHTML = h;
}



// 互換ラッパー
function selRecTab(t) { historySetRecTab(t); }
function selRecCourse(c) { historySetRecCourse(c); }
function renRecords() { historyRenderRecords(); }

function selStatTab(t) { historySetStatTab(t); }
function renStats() { historyRenderStats(); }

// ======================================================
// データリセット
// ======================================================
function resetData(){
  if (!confirm('きろくをすべてけします。よろしいですか？')) return;
  clearPersistedAppData();
  if (typeof resetPersistedRuntimeState === 'function') resetPersistedRuntimeState();
  if (typeof refreshVisibleScreen === 'function') refreshVisibleScreen();
  else {
    if (_currentScreen==='records-top') renRecords();
    if (_currentScreen==='stats-top') renStats();
  }
}
