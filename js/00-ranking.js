// 00-ranking.js
// ======================================================
// ランキング管理
// ======================================================
function rkKey(level, course) { return level + '_' + course; }

function rkGet(level, course) {
  var k = rkKey(level, course);
  return (rkD[k] || []).slice();
}

function rkAdd(level, course, totalMs) {
  var k = rkKey(level, course);
  if (!rkD[k]) rkD[k] = [];
  var entry = { t: totalMs, d: new Date().toLocaleDateString('ja-JP') };
  rkD[k].push(entry);
  rkD[k].sort(function(a,b){ return a.t - b.t; });
  rkD[k] = rkD[k].slice(0, 3); // 上位3件
  lsSave(LS_RK, rkD);
  return rkD[k].findIndex(function(e){ return e.t === entry.t && e.d === entry.d; });
}

function fmtTime(ms) {
  var s = (ms / 1000).toFixed(2);
  return s + '秒';
}

function rkBestTimeLabel(level, course) {
  var entries = rkGet(level, course);
  if (!entries.length) return 'きろくなし';
  return '1位 ' + fmtTime(entries[0].t);
}
