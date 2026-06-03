// gem unlock effect
function showGemUnlockEffect(gemImg, gemName, onDone) {
  if (!getFx('fx_perfect')) { if (onDone) onDone(); return; }
  var parts = buildAchievementOverlay();

  var img = document.createElement('img');
  img.className = 'gem-burst-img';
  img.src = gemImg;
  img.onerror = function(){ this.style.display='none'; };
  parts.card.appendChild(img);

  var title = document.createElement('div');
  title.className = 'gem-burst-title';
  title.textContent = '✨ ゲット！';
  parts.card.appendChild(title);

  var sub = document.createElement('div');
  sub.className = 'gem-burst-sub';
  sub.textContent = gemName;
  parts.card.appendChild(sub);

  document.body.appendChild(parts.overlay);
  playAchievementTone([[0,880],[0.12,1100],[0.24,1320],[0.36,1760]],0.18,0.18);

  setTimeout(function(){
    if (parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }, 1900);
}
