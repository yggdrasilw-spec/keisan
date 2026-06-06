// 11-handwriting-answer.js
// ======================================================
// 手書き判定 / クリア
// ======================================================
function hwCheckAnswer(recognized) {
  var hintEl = document.getElementById('hw-hint');
  if (recognized === null || recognized === undefined) {
    if(hintEl) { hintEl.textContent='うまく よめなかった… もう1かい！'; hintEl.className='hw-hint ng'; }
    setTimeout(hwClear, 900);
    return;
  }

  if (hwAnswerLocked) return;

  var p = sess.queue && sess.queue[sess.idx];
  if (!p) return;
  var correct = p.ans;

  if (recognized === correct) {
    hwAnswerLocked = true;
    if(hintEl) { hintEl.textContent='✅ せいかい！'; hintEl.className='hw-hint ok'; }
    var pcardEl = document.getElementById('pcard');
    setTimeout(function() {
      hwClear();
      chk(correct, pcardEl, p);
    }, 400);
  } else {
    if(hintEl) {
      hintEl.textContent='もう1かい かいてみて ✏️';
      hintEl.className='hw-hint ng';
    }
    setTimeout(hwClear, 700);
  }
}

function hwClear() {
  var canvas  = document.getElementById('hw-canvas');
  var overlay = document.getElementById('hw-overlay');
  if(!canvas) return;
  var ctx  = canvas.getContext('2d');
  var octx = overlay.getContext('2d');
  ctx.fillStyle='white'; ctx.fillRect(0,0,500,220);
  octx.clearRect(0,0,500,220);
  hwDrawing=false; hwStrokeCount=0;
  hwTensDigit=null; hwOnesDigit=null;
  hwStroke1Box=null; hwStroke2Box=null;
  hwStroke1Pts=[]; hwStroke2Pts=[];
  var hintEl=document.getElementById('hw-hint');
  if(hintEl) { hintEl.textContent='すうじを かいてね ✏️'; hintEl.className='hw-hint'; }
}
