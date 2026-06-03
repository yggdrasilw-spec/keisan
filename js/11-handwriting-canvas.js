// 11-handwriting-canvas.js
// ======================================================
// 手書き判定 / キャンバス描画
// ======================================================
// 認識完了後に答えを判定する
function hwCheckAnswer(recognized) {
  var hintEl = document.getElementById('hw-hint');
  if (recognized === null || recognized === undefined) {
    if(hintEl) { hintEl.textContent='うまく よめなかった… もう1かい！'; hintEl.className='hw-hint ng'; }
    setTimeout(hwClear, 900);
    return;
  }

  // 答えを取得
  var p = sess.queue && sess.queue[sess.idx];
  if (!p) return;
  var correct = p.ans;

  if (recognized === correct) {
    // 正解 → 即 chk() 相当の処理
    var hintEl = document.getElementById('hw-hint');
    if(hintEl) { hintEl.textContent='✅ せいかい！'; hintEl.className='hw-hint ok'; }
    // pcard を手裏剣の起点にするためダミーbtnとして渡す
    var pcardEl = document.getElementById('pcard');
    setTimeout(function() {
      hwClear();
      chk(correct, pcardEl, p);
    }, 400);
  } else {
    // 不正解にしない → もう一度促す
    if(hintEl) {
      hintEl.textContent='もう1かい かいてみて ✏️';
      hintEl.className='hw-hint ng';
    }
    setTimeout(hwClear, 700);
  }
}

// ストローク終了後の認識ロジック（元コードの end() を移植）
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

    // 1本目 → 十の位（仮）
    if(hwStrokeCount===1) {
      hwStroke1Box=box; hwDrawBoxes(octx);
      hwTensDigit = await hwPredict(hwStroke1Box, canvas);
      var hintEl=document.getElementById('hw-hint');
      if(hintEl) hintEl.textContent='2本目 または はんていちゅう…';
      // 1桁答えの場合は即判定
      var p=sess.queue&&sess.queue[sess.idx];
      if (p && p.ans <= 9) {
        // 十の位 = 答えとして判定
        hwCheckAnswer(hwTensDigit);
      }
      return;
    }

    // 2本目 → 接触判定
    if(hwStrokeCount===2) {
      var dist=hwMinDist(hwStroke1Pts,hwStroke2Pts);
      var touching=dist<HW_TOUCH_THRESHOLD;
      if(touching) {
        // 同じ数字の続き → 十の位に追記（1桁答えの場合も）
        hwStroke1Box=hwMergeBox(hwStroke1Box,box); hwDrawBoxes(octx);
        hwTensDigit=await hwPredict(hwStroke1Box,canvas);
        var p=sess.queue&&sess.queue[sess.idx];
        if(p && p.ans<=9) { hwCheckAnswer(hwTensDigit); return; }
      } else {
        // 別の数字 → 一の位確定
        hwStroke2Box=box; hwDrawBoxes(octx);
        hwOnesDigit=await hwPredict(hwStroke2Box,canvas);
        var recognized=(hwTensDigit*10)+hwOnesDigit;
        hwCheckAnswer(recognized);
      }
      return;
    }

    // 3本目以降
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
