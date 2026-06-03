// 02-practice-score.js
// ======================================================
// 回答結果の集計・保存
// ======================================================

function getAnswerStatsStore(p) {
  var isKotsu = (sessMode === 'kotsu');
  var key = isKotsu ? kk(kSt.num, p) : gkLevel(curLevel, p);
  return {
    isKotsu: isKotsu,
    key: key,
    store: isKotsu ? kD : gD,
    lsKey: isKotsu ? LS_KD : LS_GD
  };
}

function updateAnswerStats(store, key, ok, el) {
  if (!store[key]) store[key] = {att:0, cor:0, t:0};
  store[key].att++;
  if (ok) store[key].cor++;
  store[key].t += el;
  store[key].last = {ok:ok, el:el};
}

function appendSessionResult(p, ok, el) {
  sess.results.push({p:p, el:el, ok:ok});
}

function persistAnswerStats(lsKey, store) {
  lsSave(lsKey, store);
}

function recordAnswerResult(p, ok, el) {
  var meta = getAnswerStatsStore(p);
  updateAnswerStats(meta.store, meta.key, ok, el);
  persistAnswerStats(meta.lsKey, meta.store);
  appendSessionResult(p, ok, el);
}

function computeSessionSummary() {
  var res = sess.results;
  var tot = res.length, cor = 0, sumT = 0;
  for (var i = 0; i < res.length; i++) {
    if (res[i].ok) cor++;
    sumT += res[i].el;
  }
  return {
    tot: tot,
    cor: cor,
    sumT: sumT,
    acc: tot ? Math.round(cor / tot * 100) : 0,
    avgT: tot ? (sumT / tot / 1000).toFixed(1) : '0',
    totalMs: sumT
  };
}

function countMasterProblems() {
  var ms = 0;
  if (sessMode === 'kotsu') {
    var kps = buildKP(kSt.num);
    for (var i = 0; i < kps.length; i++) {
      if (getSt(kD[kk(kSt.num, kps[i])]) === 'master') ms++;
    }
  } else {
    var allPs = buildPLevel(curLevel);
    for (var j = 0; j < allPs.length; j++) {
      if (getSt(gD[gkLevel(curLevel, allPs[j])]) === 'master') ms++;
    }
  }
  return ms;
}
