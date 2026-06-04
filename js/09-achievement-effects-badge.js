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
  parts.card.style.borderColor = 'rgba(245,166,35,.6)';
  parts.card.style.maxWidth = 'min(92vw, 760px)';
  parts.card.style.padding = '28px 34px 24px';

  var img = document.createElement('img');
  img.className = 'gem-burst-img badge-burst-img';
  img.src = badge.img;
  img.alt = badge.name;
  img.onerror = function(){ this.style.display='none'; };
  parts.card.appendChild(img);

  var title = document.createElement('div');
  title.className = 'gem-burst-title badge-burst-title';
  var mainTitle = badge.unlockTitle ? String(badge.unlockTitle).replace(/[ 　]*せいはバッジ\s*$/, '') : 'せいはバッジ';
  title.innerHTML = '';
  title.style.whiteSpace = 'pre-line';
  title.textContent = mainTitle + '\nせいはバッジゲット！';
  parts.card.appendChild(title);

  document.body.appendChild(parts.overlay);
  try {
    playAchievementTone([[0,523],[0.1,659],[0.2,784],[0.3,1047]],0.22,0.22);
  } catch (e) {}

  setTimeout(function(){
    if (parts.overlay && parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }, 2200);
}
