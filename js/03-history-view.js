// 03-history-view.js
// ======================================================
// 記録・統計の表示部品（HTML生成）
// ======================================================

function historyBuildRecordItemHtml(p, level) {
  var rec = gD[gkLevel(level, p)];
  var st = getSt(rec);
  var info = (rec && rec.att)
    ? rec.att + 'かい・' + Math.round(rec.cor / rec.att * 100) + '%・さいきん' + (rec.last ? (rec.last.el / 1000).toFixed(1) + '秒' : '-')
    : 'まだ やっていないよ';
  return riHtml(ST_DOT[st], p.a + '+' + p.b + '=' + p.ans, info, ST_BG[st], ST_TC[st], ST_PT[st]);
}

function historyBuildRankingHtml(level, course) {
  if (course === 'weak') return '';
  var medals = ['🥇', '🥈', '🥉'];
  var entries = rkGet(level, course);
  if (entries.length === 0) {
    return '<div class="ranking-empty">まだ きろくが ありません<br>ぜんもんせいかい を ねらおう！</div>';
  }
  var rh = '';
  for (var i = 0; i < entries.length; i++) {
    rh += '<div class="ranking-row">'
      + '<span class="ranking-medal">' + medals[i] + '</span>'
      + '<div class="ranking-info">'
      + '<div class="ranking-time">' + fmtTime(entries[i].t) + '</div>'
      + '<div class="ranking-date">' + entries[i].d + '</div>'
      + '</div></div>';
  }
  return rh;
}
