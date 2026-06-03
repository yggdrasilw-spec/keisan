// 02-practice-finish-summary.js
// ======================================================
// 結果画面の要約表示
// ======================================================

function renderFinishSummaryToResultPage(summary, completed) {
  document.getElementById('rv-t').textContent = summary.tot + 'もん';
  document.getElementById('rv-a').textContent = summary.acc + '%';
  document.getElementById('rv-avg').textContent = summary.avgT + '秒';
  document.getElementById('rv-total').textContent = (summary.totalMs / 1000).toFixed(2) + '秒';

  var rankBox = document.getElementById('rv-rank-box');
  var rankMsg = document.getElementById('rv-rank-msg');
  if (rankBox) rankBox.style.display = 'none';

  if (summary.acc === 100 && completed && sessMode === 'normal' && (curCourse === '20' || curCourse === 'all')) {
    var rankIdx = rkAdd(curLevel, curCourse, summary.totalMs);
    var medals = ['🥇','🥈','🥉'];
    if (rankIdx >= 0 && rankIdx < 3 && rankBox && rankMsg) {
      rankBox.style.display = 'block';
      rankMsg.textContent = medals[rankIdx] + ' ' + (rankIdx + 1) + 'い ランクイン！ ' + fmtTime(summary.totalMs);
    }
  }
}
