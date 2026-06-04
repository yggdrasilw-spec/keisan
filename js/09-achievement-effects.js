// 09-achievement-effects.js
// shared helpers for achievement effects

function buildAchievementOverlay(){
  var ov=document.createElement('div');
  ov.className='gem-burst-overlay';
  var card=document.createElement('div');
  card.className='gem-burst-card';
  ov.appendChild(card);
  return {overlay:ov,card:card};
}

function playAchievementTone(seq, gainValue, duration){
  try {
    var ac=getAC();
    if (ac && sfxOn) {
      var t=ac.currentTime;
      seq.forEach(function(p){
        var o=ac.createOscillator(), g=ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type='sine'; o.frequency.value=p[1];
        g.gain.setValueAtTime(gainValue, t+p[0]);
        g.gain.exponentialRampToValueAtTime(0.001, t+p[0]+duration);
        o.start(t+p[0]); o.stop(t+p[0]+duration);
      });
    }
  } catch(e){}
}


function bindAchievementOverlayClose(parts, onDone){
  var closed = false;
  function closeEffect(ev){
    if (ev) { try { ev.preventDefault(); ev.stopPropagation(); } catch(e){} }
    if (closed) return;
    closed = true;
    if (parts.overlay && parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }
  ['pointerdown','touchstart','click'].forEach(function(evt){
    parts.overlay.addEventListener(evt, closeEffect, {passive:false});
    parts.card.addEventListener(evt, closeEffect, {passive:false});
  });
  return closeEffect;
}
