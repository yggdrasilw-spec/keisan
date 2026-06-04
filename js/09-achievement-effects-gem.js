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

function getGemUnlockHeadlineByIndex(idx) {
  if (idx === 18) return 'ぜんぶマスター！';
  var carry = idx > 9;
  var base = carry ? idx - 9 : idx;
  return toFullWidthDigits(base) + 'をたすマスター' + (carry ? '（くりあがり）' : '') + '！';
}

function getGemUnlockTextByIndex(idx) {
  return getGemUnlockHeadlineByIndex(idx) + '\n' + getGemUnlockNameByIndex(idx) + 'ゲット！';
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
  document.body.appendChild(parts.overlay);

  requestAnimationFrame(function() {
    try {
      if (line2 && line2.scrollWidth > line2.clientWidth) {
        var size = parseFloat(getComputedStyle(line2).fontSize) || 18;
        while (size > 12 && line2.scrollWidth > line2.clientWidth) {
          size -= 1;
          line2.style.fontSize = size + 'px';
        }
      }
    } catch (e) {}
  });

  try {
    playAchievementTone([[0,880],[0.12,1100],[0.24,1320],[0.36,1760]],0.18,0.18);
  } catch (e) {}
}
