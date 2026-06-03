// 02-practice-countdown.js
// ======================================================
// 練習画面のカウントダウン
// ======================================================

var countdownTimer = null;

function hideCountdownOverlay() {
  if (countdownTimer) {
    clearTimeout(countdownTimer);
    countdownTimer = null;
  }
  var ov = document.getElementById('countdown-overlay');
  if (!ov) return;
  ov.classList.remove('show');
  ov.classList.remove('cd-go');
  var num = document.getElementById('countdown-num');
  var sub = document.getElementById('countdown-sub');
  if (num) {
    num.classList.remove('pop');
    num.textContent = '3';
  }
  if (sub) sub.textContent = 'よーい';
}

function countdownBeep(freqs, dur, vol, type) {
  if (!sfxOn) return;
  var ac = getAC();
  if (!ac) return;
  var list = Array.isArray(freqs) ? freqs : [freqs];
  for (var i = 0; i < list.length; i++) {
    playTones([{freq:list[i], dur:dur || 0.08, type:type || 'sine', vol:vol || 0.22, delay:i * (dur ? dur * 0.55 : 0.05)}]);
  }
}

function beginCountdown(done) {
  hideCountdownOverlay();
  var ov = document.getElementById('countdown-overlay');
  var num = document.getElementById('countdown-num');
  var sub = document.getElementById('countdown-sub');
  if (!ov || !num || !sub) {
    if (done) done();
    return;
  }

  try {
    var ac = getAC();
    if (ac && ac.state === 'suspended' && ac.resume) { ac.resume(); }
  } catch(e) {}

  ov.classList.add('show');

  var seq = [
    { text: '3',  sub: 'よーい',  cls: '',     tone: [392],       vib: 10 },
    { text: '2',  sub: 'よーい',  cls: '',     tone: [440],       vib: 10 },
    { text: '1',  sub: 'よーい',  cls: '',     tone: [523],       vib: 12 },
    { text: '忍!!', sub: 'しゅっぱつ！', cls: 'cd-go', tone: [784, 988, 1319], vib: 24, go: true }
  ];

  var i = 0;
  function step() {
    var s = seq[i];
    if (!s) return;
    ov.classList.toggle('cd-go', !!s.go);
    num.classList.remove('pop');
    void num.offsetWidth;
    num.textContent = s.text;
    num.classList.add('pop');
    sub.textContent = s.sub;

    try { if (navigator.vibrate) navigator.vibrate(s.vib || (s.go ? 20 : 10)); } catch(e) {}
    countdownBeep(s.tone, s.go ? 0.09 : 0.07, s.go ? 0.28 : 0.18, s.go ? 'triangle' : 'sine');
    try {
      if (num) throwShurikenBurst(num, s.go ? 3 : 1);
    } catch(e) {}

    i++;
    if (i < seq.length) {
      countdownTimer = setTimeout(step, 1000);
    } else {
      countdownTimer = setTimeout(function() {
        hideCountdownOverlay();
        if (done) done();
      }, 700);
    }
  }
  step();
}
