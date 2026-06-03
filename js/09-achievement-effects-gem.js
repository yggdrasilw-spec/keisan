
// gem unlock effect
function showGemUnlockEffect(gemImg, gemName, onDone) {
  if (!getFx('fx_perfect')) { if (onDone) onDone(); return; }
  var parts = buildAchievementOverlay();
  parts.overlay.classList.add('gem-unlock-overlay');

  var card = parts.card;
  card.classList.add('gem-unlock-card');

  var visual = document.createElement('div');
  visual.className = 'gem-unlock-visual';
  var img = document.createElement('img');
  img.className = 'gem-burst-img';
  img.src = gemImg;
  img.alt = gemName;
  img.onerror = function(){ this.style.display='none'; };
  visual.appendChild(img);
  card.appendChild(visual);

  var title = document.createElement('div');
  title.className = 'gem-burst-title';
  title.textContent = gemName + 'ゲット！！';
  card.appendChild(title);

  document.body.appendChild(parts.overlay);
  playAchievementTone([[0,880],[0.12,1100],[0.24,1320],[0.36,1760]],0.18,0.18);

  setTimeout(function(){
    if (parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }, 1900);
}
