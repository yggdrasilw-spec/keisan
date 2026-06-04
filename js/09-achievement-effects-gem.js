// 09-achievement-effects-gem.js
// ======================================================
// 宝石ゲット演出 / 宝石名
// ======================================================

var ACH_GEM_NAMES = {
  1: '金剛石（ダイヤモンド）',
  2: '紅玉（ルビー）',
  3: '青玉（サファイア）',
  4: '翠玉（エメラルド）',
  5: '紫水晶（アメジスト）',
  6: '黄玉（トパーズ）',
  7: '柘榴石（ガーネット）',
  8: '橄欖石（ペリドット）',
  9: '蛋白石（オパール）',
  10: '電気石（トルマリン）',
  11: '翡翠（ヒスイ）',
  12: '瑠璃（ラピスラズリ）',
  13: '真珠（パール）',
  14: '琥珀（コハク）',
  15: '風信子石（ジルコン）',
  16: '尖晶石（スピネル）',
  17: '月長石（ムーンストーン）',
  18: '金緑石（アレキサンドライト）'
};

function getGemUnlockNameByIndex(idx) {
  return ACH_GEM_NAMES[idx] || ('宝石' + idx);
}

function showGemUnlockEffect(gemImg, gemName, onDone) {
  if (typeof getFx === 'function' && !getFx('fx_perfect')) {
    if (onDone) onDone();
    return;
  }

  var parts = buildAchievementOverlay();
  parts.card.style.maxWidth = 'min(90vw, 620px)';
  parts.card.style.padding = '24px 24px 18px';

  var img = document.createElement('img');
  img.className = 'gem-burst-img';
  img.src = gemImg;
  img.alt = gemName;
  img.onerror = function(){ this.style.display='none'; };
  parts.card.appendChild(img);

  var title = document.createElement('div');
  title.className = 'gem-burst-title';
  title.textContent = gemName + ' ゲット！！';
  parts.card.appendChild(title);

  document.body.appendChild(parts.overlay);

  try {
    playAchievementTone([[0,880],[0.12,1100],[0.24,1320],[0.36,1760]],0.18,0.18);
  } catch (e) {}

  setTimeout(function(){
    if (parts.overlay && parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }, 1900);
}
