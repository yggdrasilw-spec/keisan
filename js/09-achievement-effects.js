// 09-achievement-effects.js
// shared helpers for achievement effects

function buildAchievementOverlay(){
  var ov = document.createElement('div');
  ov.className = 'gem-burst-overlay';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');

  var backdrop = document.createElement('div');
  backdrop.className = 'gem-burst-backdrop';

  var card = document.createElement('div');
  card.className = 'gem-burst-card';

  ov.appendChild(backdrop);
  ov.appendChild(card);
  return {overlay: ov, backdrop: backdrop, card: card};
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
  var events = ['pointerdown', 'touchstart', 'click'];
  var cleanup = function() {
    events.forEach(function(evt) {
      document.removeEventListener(evt, closeEffect, true);
      if (parts.overlay) parts.overlay.removeEventListener(evt, closeEffect, true);
      if (parts.card) parts.card.removeEventListener(evt, closeEffect, true);
      if (parts.backdrop) parts.backdrop.removeEventListener(evt, closeEffect, true);
    });
  };
  function closeEffect(ev){
    if (ev) {
      try { ev.preventDefault(); ev.stopPropagation(); } catch(e){}
    }
    if (closed) return;
    closed = true;
    cleanup();
    if (parts.overlay && parts.overlay.parentNode) parts.overlay.parentNode.removeChild(parts.overlay);
    if (onDone) onDone();
  }
  events.forEach(function(evt){
    document.addEventListener(evt, closeEffect, true);
    if (parts.overlay) parts.overlay.addEventListener(evt, closeEffect, {passive:false, capture:true});
    if (parts.card) parts.card.addEventListener(evt, closeEffect, {passive:false, capture:true});
    if (parts.backdrop) parts.backdrop.addEventListener(evt, closeEffect, {passive:false, capture:true});
  });
  return closeEffect;
}
