// 11-handwriting-model.js
// ======================================================
// 手書きモデル / 前処理 / 推論
// ======================================================
// TF.js モデルのロード（練習画面が最初に開いたときに呼ぶ）
function hwLoadModel() {
  if (hwModelLoaded) return;
  hwModelLoaded = true; // 重複呼び出し防止
  var st = document.getElementById('hw-model-status');
  if (!window.tf) {
    if (st) st.textContent = 'TF.js が見つかりません';
    return;
  }
  if (st) st.textContent = 'モデル よみこみちゅう…';
  tf.loadGraphModel('./model/model.json').then(function(m) {
    hwModel = m;
    if (st) st.textContent = '✅ てがきモード つかえるよ！';
  }).catch(function(e) {
    if (st) st.textContent = '⚠ モデル読み込み失敗（サーバー経由で開いてね）';
    console.warn('hw model load failed:', e);
  });
}

// キャンバスのリサイズ対応座標取得
function hwGetPos(e, canvas) {
  var rect = canvas.getBoundingClientRect();
  var cw = 500, ch = 220;
  if (e.touches && e.touches.length) {
    return {
      x: (e.touches[0].clientX - rect.left) * (cw / rect.width),
      y: (e.touches[0].clientY - rect.top)  * (ch / rect.height)
    };
  }
  return {
    x: (e.clientX - rect.left) * (cw / rect.width),
    y: (e.clientY - rect.top)  * (ch / rect.height)
  };
}

var hwDrawing     = false;
var hwStrokeCount = 0;
var hwTensDigit   = null;
var hwOnesDigit   = null;
var hwStroke1Box  = null;
var hwStroke2Box  = null;
var hwStroke1Pts  = [];
var hwStroke2Pts  = [];
var hwMinX, hwMaxX, hwMinY, hwMaxY;
var HW_TOUCH_THRESHOLD = 20;

function hwResetBox() { hwMinX=9999; hwMinY=9999; hwMaxX=-1; hwMaxY=-1; }
function hwUpdateBox(x,y) {
  if(x<hwMinX)hwMinX=x; if(y<hwMinY)hwMinY=y;
  if(x>hwMaxX)hwMaxX=x; if(y>hwMaxY)hwMaxY=y;
}
function hwGetRawBox() {
  return {x:hwMinX, y:hwMinY, w:Math.max(8,hwMaxX-hwMinX), h:Math.max(8,hwMaxY-hwMinY)};
}
function hwExpandBox(b, p) {
  p = p||14;
  var x=b.x-p, y=b.y-p, w=b.w+p*2, h=b.h+p*2;
  if(x<0)x=0; if(y<0)y=0;
  if(x+w>500)w=500-x; if(y+h>220)h=220-y;
  return {x:x,y:y,w:w,h:h};
}
function hwMergeBox(a,b) {
  var x=Math.min(a.x,b.x), y=Math.min(a.y,b.y);
  var r=Math.max(a.x+a.w,b.x+b.w), bt=Math.max(a.y+a.h,b.y+b.h);
  return {x:x,y:y,w:r-x,h:bt-y};
}
function hwMinDist(pts1, pts2) {
  var min=99999;
  for(var i=0;i<pts2.length;i++) {
    for(var j=0;j<pts1.length;j++) {
      var d=Math.hypot(pts2[i].x-pts1[j].x, pts2[i].y-pts1[j].y);
      if(d<min) min=d;
      if(min<2) return min;
    }
  }
  return min;
}
function hwPushPoint(x,y) {
  if(hwStrokeCount===0) hwStroke1Pts.push({x:x,y:y});
  else hwStroke2Pts.push({x:x,y:y});
}
function hwDrawBoxes(octx) {
  octx.clearRect(0,0,500,220);
  function rect(b,c) {
    octx.strokeStyle=c; octx.lineWidth=2;
    octx.setLineDash([8,5]); octx.strokeRect(b.x,b.y,b.w,b.h); octx.setLineDash([]);
  }
  if(hwStroke1Box) rect(hwStroke1Box,'#5AAA30');
  if(hwStroke2Box) rect(hwStroke2Box,'#F5A623');
}

function hwPreprocess(box, canvas) {
  return tf.tidy(function() {
    var img = tf.browser.fromPixels(canvas, 1);
    img = tf.slice(img,
      [Math.floor(box.y), Math.floor(box.x), 0],
      [Math.max(1,Math.floor(box.h)), Math.max(1,Math.floor(box.w)), 1]
    );
    var h=img.shape[0], w=img.shape[1];
    var side=Math.max(h,w), pad=Math.floor(side*0.1), full=side+pad*2;
    var bg=tf.fill([full,full,1],255).bufferSync();
    var src=img.arraySync();
    var top=Math.floor((full-h)/2), left=Math.floor((full-w)/2);
    for(var y=0;y<h;y++) for(var x2=0;x2<w;x2++) bg.set(src[y][x2][0],y+top,x2+left,0);
    img=bg.toTensor();
    img=tf.image.resizeBilinear(img,[28,28]);
    img=tf.sub(255,img);
    img=img.toFloat().div(255);
    img=img.expandDims(0);
    return img;
  });
}

async function hwPredict(box, canvas) {
  if(!hwModel) return null;
  var input = hwPreprocess(box, canvas);
  var output = hwModel.predict ? hwModel.predict(input) : hwModel.execute(input);
  var data = await output.data();
  var max=data[0], idx=0;
  for(var i=1;i<10;i++) { if(data[i]>max){max=data[i];idx=i;} }
  input.dispose(); output.dispose();
  return idx;
}
