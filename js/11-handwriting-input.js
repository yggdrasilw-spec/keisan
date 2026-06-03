// 11-handwriting-input.js
// ======================================================
// 手書きキャンバス描画 / 入力処理
// ======================================================
function hwInitCanvas() {
  var canvas  = document.getElementById('hw-canvas');
  var overlay = document.getElementById('hw-overlay');
  if (!canvas || canvas._hwInited) return;
  canvas._hwInited = true;

  var ctx  = canvas.getContext('2d');
  var octx = overlay.getContext('2d');

  ctx.fillStyle='white'; ctx.fillRect(0,0,500,220);

  function start(e) {
    if (document.getElementById('hw-area').style.display==='none') return;
    e.preventDefault();
    hwDrawing=true;
    hwResetBox();
    var p=hwGetPos(e,canvas);
    hwUpdateBox(p.x,p.y); hwPushPoint(p.x,p.y);
    ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2);
    ctx.fillStyle='black'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(p.x,p.y);
  }
  function move(e) {
    if(!hwDrawing) return;
    e.preventDefault();
    var p=hwGetPos(e,canvas);
    hwUpdateBox(p.x,p.y); hwPushPoint(p.x,p.y);
    ctx.lineWidth=22; ctx.lineCap='round'; ctx.strokeStyle='black';
    ctx.lineTo(p.x,p.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x,p.y);
  }
  async function end(e) {
    if(!hwDrawing) return;
    hwDrawing=false; ctx.beginPath();
    hwStrokeCount++;
    var box=hwExpandBox(hwGetRawBox());

    if(hwStrokeCount===1) {
      hwStroke1Box=box; hwDrawBoxes(octx);
      hwTensDigit = await hwPredict(hwStroke1Box, canvas);
      var hintEl=document.getElementById('hw-hint');
      if(hintEl) hintEl.textContent='2本目 または はんていちゅう…';
      var p=sess.queue&&sess.queue[sess.idx];
      if (p && p.ans <= 9) {
        hwCheckAnswer(hwTensDigit);
      }
      return;
    }

    if(hwStrokeCount===2) {
      var dist=hwMinDist(hwStroke1Pts,hwStroke2Pts);
      var touching=dist<HW_TOUCH_THRESHOLD;
      if(touching) {
        hwStroke1Box=hwMergeBox(hwStroke1Box,box); hwDrawBoxes(octx);
        hwTensDigit=await hwPredict(hwStroke1Box,canvas);
        var p=sess.queue&&sess.queue[sess.idx];
        if(p && p.ans<=9) { hwCheckAnswer(hwTensDigit); return; }
      } else {
        hwStroke2Box=box; hwDrawBoxes(octx);
        hwOnesDigit=await hwPredict(hwStroke2Box,canvas);
        var recognized=(hwTensDigit*10)+hwOnesDigit;
        hwCheckAnswer(recognized);
      }
      return;
    }

    if(!hwStroke2Box) hwStroke2Box=box;
    else hwStroke2Box=hwMergeBox(hwStroke2Box,box);
    hwDrawBoxes(octx);
    hwOnesDigit=await hwPredict(hwStroke2Box,canvas);
    var recognized=(hwTensDigit*10)+hwOnesDigit;
    hwCheckAnswer(recognized);
  }

  canvas.addEventListener('mousedown',  start);
  canvas.addEventListener('mousemove',  move);
  canvas.addEventListener('mouseup',    end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, {passive:false});
  canvas.addEventListener('touchmove',  move,  {passive:false});
  canvas.addEventListener('touchend',   end,   {passive:false});
}
