// 09-achievement-effects-gem.js
// ======================================================
// 宝石ゲット演出 / 宝石名
// ======================================================

var GEM_UNLOCK_TEXTS = {
  1: '１をたすマスター！\n金剛石（ダイヤモンド）ゲット！',
  2: '２をたすマスター！\n紅玉（ルビー）ゲット！',
  3: '３をたすマスター！\n青玉（サファイア）ゲット！',
  4: '４をたすマスター！\n翠玉（エメラルド）ゲット！',
  5: '５をたすマスター！\n紫水晶（アメジスト）ゲット！',
  6: '６をたすマスター！\n黄玉（トパーズ）ゲット！',
  7: '７をたすマスター！\n柘榴石（ガーネット）ゲット！',
  8: '８をたすマスター！\n橄欖石（ペリドット）ゲット！',
  9: '9をたすマスター！\n蛋白石（オパール）ゲット！',
  10: '２をたすマスター（くりあがり）！\n電気石（トルマリン）ゲット！',
  11: '３をたすマスター（くりあがり）！\n翡翠（ヒスイ）ゲット！',
  12: '４をたすマスター（くりあがり）！\n瑠璃（ラピスラズリ）ゲット！',
  13: '５をたすマスター（くりあがり）！\n真珠（パール）ゲット！',
  14: '６をたすマスター（くりあがり）！\n琥珀（コハク）ゲット！',
  15: '７をたすマスター（くりあがり）！\n風信子石（ジルコン）ゲット！',
  16: '８をたすマスター（くりあがり）！\n尖晶石（スピネル）ゲット！',
  17: '9をたすマスター（くりあがり）！\n月長石（ムーンストーン）ゲット！',
  18: 'すべてをマスター！\n6つの せいはバッジを てにいれた！'
};

function getGemUnlockTextByIndex(idx) {
  return GEM_UNLOCK_TEXTS[idx] || ('宝石' + idx + '\nゲット！');
}

function showGemUnlockEffect(gemImg, gemName, onDone) {
  if (typeof getFx === 'function' && !getFx('fx_perfect')) {
    if (onDone) onDone();
    return;
  }

  var parts = buildAchievementOverlay();
  bindAchievementOverlayClose(parts, onDone);

  parts.card.style.maxWidth = 'min(94vw, 760px)';
  parts.card.style.width = 'min(94vw, 760px)';
  parts.card.style.padding = '28px 36px 24px';

  var img = document.createElement('img');
  img.className = 'gem-burst-img';
  img.src = gemImg;
  img.alt = gemName;
  img.onerror = function(){ this.style.display='none'; };
  parts.card.appendChild(img);

  var title = document.createElement('div');
  title.className = 'gem-burst-title';

  var text = String(gemName || '');
  var lines = text.indexOf('\n') >= 0 ? text.split('\n') : [text, 'ゲット！'];
  var line1 = document.createElement('div');
  line1.className = 'gem-burst-title-main';
  line1.textContent = lines[0] || '';
  title.appendChild(line1);

  var line2 = document.createElement('div');
  line2.className = 'gem-burst-title-sub';
  line2.textContent = lines.slice(1).join('\n') || '';
  title.appendChild(line2);

  parts.card.appendChild(title);
}
