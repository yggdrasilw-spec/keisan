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
  parts.card.style.maxWidth = 'min(90vw, 620px)';
  parts.card.style.padding = '24px 24px 18px';

  var ico = document.createElement('div');
  ico.style.cssText = 'font-size:56px;line-height:1;filter:drop-shadow(0 0 12px rgba(245,200,76,.8))';
  ico.textContent = badge.ico;
  parts.card.appendChild(ico);

  var img = document.createElement('img');
  img.className = 'gem-burst-img';
  img.src = badge.img;
  img.alt = badge.name;
  img.onerror = function(){ this.style.display='none'; };
  parts.card.appendChild(img);

  var title = document.createElement('div');
  title.className = 'gem-burst-title';
  title.textContent = '🏅 制覇バッジ ゲット！';
  parts.card.appendChild(title);

  var sub = document.createElement('div');
  sub.className = 'gem-burst-sub';
  sub.textContent = badge.name.replace(/\n/g, ' ');
  parts.card.appendChild(sub);

  document.body.appendChild(parts.overlay);
  try {
    playAchievementTone([[0,523],[0.1,659],[0.2,784],[0.3,1047]],0.22,0.22);
  } catch (e) {}

  setTimeout(function(){
    if (parts.overlay && parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }, 2200);
}
