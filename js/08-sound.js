// 08-sound.js
// ======================================================
// 画像表示 / 全問正解エフェクト / ボタンFX
// ======================================================
// ======================================================
// 効果音 / 音声エンジン
// ======================================================
var sfxOn = true;
var AC = null;
try { sfxOn = getFx('fx_sfx'); } catch(e) {}

function setSfxEnabled(nextOn) {
  sfxOn = !!nextOn;
  var tog = document.getElementById('fxtog-fx_sfx');
  if (tog) tog.classList.toggle('on', sfxOn);
  if (!sfxOn && AC) { try { AC.suspend(); } catch(e){} }
  else if (sfxOn && AC) { try { AC.resume(); } catch(e){} }
}
function playFileSound(src) {
  if (!sfxOn || !src) return null;
  try {
    var a = new Audio(src);
    a.preload = 'auto';
    a.volume = 1;
    var p = a.play();
    if (p && typeof p.catch === 'function') p.catch(function(){});
    return a;
  } catch (e) {
    return null;
  }
}
function toggleSfx() {
  setSfxEnabled(!sfxOn);
  if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
}
function getAC() {
  if (!AC) {
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return AC;
}
function playTones(notes) {
  if (!sfxOn) return;
  var ac = getAC(); if (!ac) return;
  for (var i=0; i<notes.length; i++) {
    (function(n) {
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = n.type || 'sine';
      osc.frequency.setValueAtTime(n.freq, ac.currentTime + (n.delay||0));
      gain.gain.setValueAtTime(n.vol||0.3, ac.currentTime + (n.delay||0));
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (n.delay||0) + n.dur);
      osc.start(ac.currentTime + (n.delay||0));
      osc.stop(ac.currentTime + (n.delay||0) + n.dur);
    })(notes[i]);
  }
}
function sndCorrect(){ playTones([{freq:523,dur:0.08,type:'sine',vol:0.25,delay:0},{freq:659,dur:0.10,type:'sine',vol:0.25,delay:0.08}]); }
function sndFast(){ playTones([{freq:659,dur:0.07,type:'sine',vol:0.28,delay:0},{freq:784,dur:0.07,type:'sine',vol:0.28,delay:0.07},{freq:1047,dur:0.12,type:'sine',vol:0.28,delay:0.14}]); }
function sndWrong(){ playTones([{freq:220,dur:0.12,type:'square',vol:0.15,delay:0},{freq:196,dur:0.15,type:'square',vol:0.12,delay:0.10}]); }
function sndStreak(n){ var base=[523,659,784,1047],notes=[],cnt=Math.min(n,5); for(var i=0;i<cnt;i++) notes.push({freq:base[i%base.length],dur:0.09,type:'sine',vol:0.22,delay:i*0.08}); playTones(notes); }
function sndPerfect(){
  if (!sfxOn) return;
  var ac = getAC(); if (!ac) return;
  var t = ac.currentTime;
  [[0,80],[0.08,60],[0.16,50]].forEach(function(pair){
    var osc=ac.createOscillator(), g=ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type='sawtooth'; osc.frequency.setValueAtTime(pair[1], t+pair[0]);
    g.gain.setValueAtTime(0.55, t+pair[0]);
    g.gain.exponentialRampToValueAtTime(0.001, t+pair[0]+0.18);
    osc.start(t+pair[0]); osc.stop(t+pair[0]+0.18);
  });
  [0,0.08,0.16].forEach(function(d){
    var osc=ac.createOscillator(), g=ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type='sine'; osc.frequency.setValueAtTime(120, t+d);
    osc.frequency.exponentialRampToValueAtTime(40, t+d+0.15);
    g.gain.setValueAtTime(0.7, t+d);
    g.gain.exponentialRampToValueAtTime(0.001, t+d+0.22);
    osc.start(t+d); osc.stop(t+d+0.22);
  });
  var chars=['ぜ','ん','も','ん','せ','い','か','い'];
  chars.forEach(function(_, i){
    var d=0.30+i*0.28;
    var osc=ac.createOscillator(), g=ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type='square'; osc.frequency.setValueAtTime(200-i*8, t+d);
    osc.frequency.exponentialRampToValueAtTime(60, t+d+0.12);
    g.gain.setValueAtTime(0.4, t+d);
    g.gain.exponentialRampToValueAtTime(0.001, t+d+0.18);
    osc.start(t+d); osc.stop(t+d+0.18);
    var osc2=ac.createOscillator(), g2=ac.createGain();
    osc2.connect(g2); g2.connect(ac.destination);
    osc2.type='sine'; osc2.frequency.setValueAtTime(1200+i*80, t+d);
    g2.gain.setValueAtTime(0.18, t+d);
    g2.gain.exponentialRampToValueAtTime(0.001, t+d+0.10);
    osc2.start(t+d); osc2.stop(t+d+0.10);
  });
  var fanfare=[{f:523,d:0.12,delay:0},{f:659,d:0.12,delay:0.12},{f:784,d:0.12,delay:0.24},{f:1047,d:0.18,delay:0.36},{f:1319,d:0.40,delay:0.54}];
  var fanStart=0.30+8*0.28+0.2;
  fanfare.forEach(function(n){
    var osc=ac.createOscillator(), g=ac.createGain();
    osc.connect(g); g.connect(ac.destination);
    osc.type='sine'; osc.frequency.setValueAtTime(n.f, t+fanStart+n.delay);
    g.gain.setValueAtTime(0.32, t+fanStart+n.delay);
    g.gain.exponentialRampToValueAtTime(0.001, t+fanStart+n.delay+n.d);
    osc.start(t+fanStart+n.delay); osc.stop(t+fanStart+n.delay+n.d);
  });
}
function sndGoodFinish(){ playTones([{freq:523,dur:0.10,type:'sine',vol:0.25,delay:0},{freq:659,dur:0.10,type:'sine',vol:0.25,delay:0.10},{freq:784,dur:0.20,type:'sine',vol:0.25,delay:0.20}]); }
function sndTryAgain(){ playTones([{freq:392,dur:0.12,type:'sine',vol:0.2,delay:0},{freq:349,dur:0.18,type:'sine',vol:0.2,delay:0.12}]); }
// ======================================================
