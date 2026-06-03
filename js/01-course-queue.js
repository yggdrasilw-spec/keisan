// 01-course-queue.js
// ======================================================
// コースの出題キュー生成
// ======================================================
function splitPsByStatus(level, ps) {
  var weak = [], rest = [];
  for (var i = 0; i < ps.length; i++) {
    var st = getSt(gD[gkLevel(level, ps[i])]);
    if (st === 'weak') weak.push(ps[i]); else rest.push(ps[i]);
  }
  return { weak: weak, rest: rest };
}

function buildCourseQueue(level, course) {
  var ps = buildPLevel(level);
  var split = splitPsByStatus(level, ps);
  if (course === '20') return sh(split.weak).concat(sh(split.rest)).slice(0, 20);
  if (course === 'all') return sh(split.weak).concat(sh(split.rest));
  if (course === 'weak') {
    var weakPs = getWeakPs(level);
    if (weakPs.length) return sh(weakPs);
    var ganbarePs = [];
    for (var i = 0; i < ps.length; i++) {
      var st = getSt(gD[gkLevel(level, ps[i])]);
      if (st === 'ok') ganbarePs.push(ps[i]);
    }
    return { ganbarePs: ganbarePs };
  }
  return [];
}
