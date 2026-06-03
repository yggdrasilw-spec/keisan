// 08-effects-perfect.js
// ======================================================
// 全問正解エフェクト
// ======================================================
function showPerfectEffect(onDone) {
  var ov = document.getElementById('perfect-overlay');
  var canvas = document.getElementById('lightning-canvas');
  var flashEl = document.getElementById('pf-flash');
  var charsEl = document.getElementById('pf-chars');
  if (!ov) { if (onDone) onDone(); return; }

  var W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');
  charsEl.innerHTML = '';

  // 文字列
  var text = ['ぜ','ん','も','ん','せ','い','か','い'];
  // 文字サイズを画面に合わせて計算
  // 横: W*0.88 / 8文字(gap込み) 、縦: H*0.28 の小さい方、最大88px
  var charW = Math.floor(W * 0.88 / text.length) - 6;
  var charH = Math.floor(H * 0.30);
  var charSize = Math.max(28, Math.min(88, charW, charH));

  text.forEach(function(ch) {
    var span = document.createElement('span');
    span.className = 'pf-char';
    span.textContent = ch;
    span.style.fontSize = charSize + 'px';
    charsEl.appendChild(span);
  });

  ov.classList.add('show');

  // 稲妻描画
  function drawLightning(x1, y1, x2, y2, roughness, ctx) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    var pts = [[x1,y1],[x2,y2]];
    for (var iter = 0; iter < 5; iter++) {
      var next = [];
      for (var i = 0; i < pts.length-1; i++) {
        next.push(pts[i]);
        var mx = (pts[i][0]+pts[i+1][0])/2 + (Math.random()-0.5)*roughness;
        var my = (pts[i][1]+pts[i+1][1])/2 + (Math.random()-0.5)*roughness;
        next.push([mx, my]);
      }
      next.push(pts[pts.length-1]);
      pts = next;
      roughness *= 0.55;
    }
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }

  function fireLightnings(alpha) {
    ctx.clearRect(0, 0, W, H);
    var bolts = 5 + Math.floor(Math.random()*4);
    for (var i = 0; i < bolts; i++) {
      var sx = Math.random() * W;
      var ex = sx + (Math.random()-0.5)*W*0.6;
      var ey = H * (0.4 + Math.random()*0.45);
      ctx.strokeStyle = 'rgba(200,220,255,' + (alpha*(0.6+Math.random()*0.4)) + ')';
      ctx.lineWidth = 1 + Math.random()*2.5;
      ctx.shadowColor = '#aaccff';
      ctx.shadowBlur = 18;
      drawLightning(sx, 0, ex, ey, W*0.25, ctx);

      // 枝
      for (var b = 0; b < 2; b++) {
        var bi = Math.floor(Math.random() * 8) + 2;
        ctx.strokeStyle = 'rgba(180,210,255,' + (alpha*0.5) + ')';
        ctx.lineWidth = 0.8;
        drawLightning(sx + (Math.random()-0.5)*60, bi*10,
                      ex + (Math.random()-0.5)*120, ey*(0.5+Math.random()*0.4), W*0.12, ctx);
      }
    }
  }

  // 閃光＋稲妻フェーズ
  var flashCount = 0;
  function doFlash() {
    flashEl.classList.remove('bang');
    void flashEl.offsetWidth;
    flashEl.classList.add('bang');
    fireLightnings(0.9);
    flashCount++;
    if (flashCount < 3) {
      setTimeout(doFlash, 110 + Math.random()*80);
    }
  }
  doFlash();

  // 文字を1文字ずつドドン（0.3秒間隔）
  var spans = charsEl.querySelectorAll('.pf-char');
  spans.forEach(function(sp, i) {
    setTimeout(function() {
      // 打撃に合わせて稲妻チラッ
      ctx.clearRect(0, 0, W, H);
      fireLightnings(0.6);
      // 文字ポン
      sp.classList.add('pop');
      // 閃光ミニ
      flashEl.classList.remove('bang');
      void flashEl.offsetWidth;
      flashEl.classList.add('bang');
    }, 300 + i * 280);
  });

  // 全文字出し終わったら手裏剣バースト → フェードアウト
  var totalDur = 300 + text.length * 280 + 600;
  setTimeout(function() {
    // 手裏剣を画面中央から爆散
    var fxLayer = document.getElementById('fx-layer');
    if (fxLayer) {
      var cx = W/2, cy = H/2;
      var angles = [0,36,72,108,144,180,216,252,288,324];
      angles.forEach(function(deg, i) {
        setTimeout(function() {
          var rad = deg * Math.PI/180;
          var dist = 160 + Math.random()*80;
          var s = document.createElement('span');
          s.className = 'fx-shuriken';
          s.style.left = cx + 'px';
          s.style.top = cy + 'px';
          s.style.setProperty('--dx', Math.round(Math.cos(rad)*dist) + 'px');
          s.style.setProperty('--dy', Math.round(Math.sin(rad)*dist) + 'px');
          s.style.transform = 'translate(-50%,-50%) scale(' + (0.9+Math.random()*0.4) + ')';
          fxLayer.appendChild(s);
          setTimeout(function(){ if (s.parentNode) s.parentNode.removeChild(s); }, 1400);
        }, i * 40);
      });
    }
  }, totalDur - 200);

  // オーバーレイを閉じる
  setTimeout(function() {
    ctx.clearRect(0, 0, W, H);
    ov.style.transition = 'opacity 400ms ease';
    ov.style.opacity = '0';
    setTimeout(function() {
      ov.classList.remove('show');
      ov.style.transition = '';
      ov.style.opacity = '';
      if (onDone) onDone();
    }, 420);
  }, totalDur + 300);
}
