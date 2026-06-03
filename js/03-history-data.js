// 03-history-data.js
// ======================================================
// 記録・統計のデータ処理
// ======================================================

function historyGetFilteredProblems(level, course) {
  var ps = buildPLevel(level);
  var ord = {weak:0,unseen:1,ok:2,master:3};
  var filtered;

  if (course === 'weak') {
    filtered = ps.filter(function(p){
      var st = getSt(gD[gkLevel(level, p)]);
      return st === 'weak' || st === 'unseen';
    });
  } else {
    filtered = ps.slice();
  }

  filtered.sort(function(a, b) {
    return (ord[getSt(gD[gkLevel(level, a)])] || 0) - (ord[getSt(gD[gkLevel(level, b)])] || 0);
  });

  return filtered;
}


function historyBuildStatsCounts(level) {
  var ps = buildPLevel(level);
  var counts = { master: 0, ok: 0, weak: 0, total: ps.length };
  for (var i = 0; i < ps.length; i++) {
    var st = getSt(gD[gkLevel(level, ps[i])]);
    if (st === 'master') counts.master++;
    else if (st === 'ok') counts.ok++;
    else if (st === 'weak') counts.weak++;
  }
  return counts;
}
