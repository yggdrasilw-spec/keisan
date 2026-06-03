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
