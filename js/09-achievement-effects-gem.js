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

function toFullWidthDigits(n) {
  return String(n).replace(/[0-9]/g, function(ch) {
    return '０１２３４５６７８９'.charAt(parseInt(ch, 10));
  });
}

function getGemUnlockNameByIndex(idx) {
  return ACH_GEM_NAMES[idx] || ('宝石' + idx);
}

function getGemUnlockTextByIndex(idx) {
  return toFullWidthDigits(idx) + 'をたすマスター！\n' + getGemUnlockNameByIndex(idx) + 'ゲット！';
}

function showGemUnlockEffect(gemImg, gemName, onDone) {
  if (typeof getFx === 'function' && !getFx('fx_perfect')) {
    if (onDone) onDone();
    return;
  }

  var parts = buildAchievementOverlay();
  parts.card.style.maxWidth = 'min(92vw, 760px)';
  parts.card.style.padding = '28px 34px 24px';

  var img = document.createElement('img');
  img.className = 'gem-burst-img';
  img.src = gemImg;
  img.alt = gemName;
  img.onerror = function(){ this.style.display='none'; };
  parts.card.appendChild(img);

  var titleWrap = document.createElement('div');
  titleWrap.className = 'gem-burst-title';
  titleWrap.style.display = 'flex';
  titleWrap.style.flexDirection = 'column';
  titleWrap.style.alignItems = 'center';
  titleWrap.style.gap = '4px';
  titleWrap.style.textAlign = 'center';
  titleWrap.style.width = '100%';

  var lines = String(gemName || '').split(/\n+/);
  var mainLine = document.createElement('div');
  mainLine.className = 'gem-burst-title-main';
  mainLine.textContent = lines[0] || '';
  titleWrap.appendChild(mainLine);

  if (lines.length > 1) {
    var subLine = document.createElement('div');
    subLine.className = 'gem-burst-title-sub';
    subLine.textContent = lines.slice(1).join(' ');
    titleWrap.appendChild(subLine);
  }
  parts.card.appendChild(titleWrap);

  document.body.appendChild(parts.overlay);

  try {
    playAchievementTone([[0,880],[0.12,1100],[0.24,1320],[0.36,1760]],0.18,0.18);
  } catch (e) {}

  setTimeout(function(){
    if (parts.overlay && parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }, 1900);
}
