// 09-achievement-effects-badge.js
// ======================================================
// 制覇バッジ演出
// ======================================================

function showBadgeUnlockEffect(badge, onDone) {
  if (typeof getFx === 'function' && !getFx('fx_perfect')) {
    if (onDone) onDone();
    return;
  }
  if (!badge) {
    if (onDone) onDone();
    return;
  }

  var parts = buildAchievementOverlay();
  bindAchievementOverlayClose(parts, onDone);

  parts.card.style.borderColor = 'rgba(245,166,35,.6)';
  parts.card.style.maxWidth = 'min(92vw, 720px)';
  parts.card.style.padding = '30px 40px';

  var img = document.createElement('img');
  img.className = 'gem-burst-img';
  img.src = badge.img;
  img.alt = badge.name;
  img.onerror = function(){ this.style.display='none'; };
  parts.card.appendChild(img);

  var title = document.createElement('div');
  title.className = 'gem-burst-title';
  title.textContent = badge.unlockTitle ? (badge.unlockTitle.replace(/　/g, String.fromCharCode(10)) + String.fromCharCode(10) + 'ゲット！') : 'せいはバッジ' + String.fromCharCode(10) + 'ゲット！';
  parts.card.appendChild(title);

  var sub = document.createElement('div');
  sub.className = 'gem-burst-sub';
  sub.textContent = badge.name.replace(/\n/g, ' ');
  parts.card.appendChild(sub);

  document.body.appendChild(parts.overlay);
  try {
    playAchievementTone([[0,523],[0.1,659],[0.2,784],[0.3,1047]],0.22,0.22);
  } catch (e) {}
}
