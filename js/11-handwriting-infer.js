// 11-handwriting-infer.js
// ======================================================
// 手書きモデル / 前処理 / 推論
// ======================================================
var hwModel = null;
var hwModelLoaded = false;

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
    y: (e.clientY - rect.top) * (ch / rect.height)
  };
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
