// 05-hint-animate-steps.js
// ======================================================
// ヒント step 別アニメーション
// ======================================================

function hHintStep2(brd, msg, c, other, move, remain, step, fs, lblY, topMargin, Lox) {
  msg.textContent = 'あと ' + move + ' で 10 だね。' + move + ' こ あげよう！';
  hSpeak('あと ' + toHira(move) + ' で じゅう だね。' + toHira(move) + ' こ あげよう！');

  for (var i = 0; i < move; i++) {
    var d = hintEl('hOt' + (other - 1 - i));
    if (d) d.style.background = '#ffd93d';
  }

  var yellowStartIdx = other - move;
  var yDotCenter = c.otherPos[yellowStartIdx].x + step * (move - 1) / 2;
  var moveNumEl = document.createElement('div');
  moveNumEl.id = 'hMoveNum';
  var moveNumY = Math.round(topMargin * 0.15);
  moveNumEl.style.cssText = 'position:absolute;font-weight:900;font-family:Nunito,sans-serif;'
    +'font-size:'+Math.round(fs*1.1)+'px;color:#cc8800;'
    +'left:'+Math.round(yDotCenter)+'px;top:'+moveNumY+'px;'
    +'transform:translateX(-50%);transition:left 0.8s ease,top 0.8s ease;z-index:5;';
  moveNumEl.textContent = move;
  brd.appendChild(moveNumEl);

  var ol = hintEl('hOL');
  if (ol) ol.textContent = remain;

  var formulaY = lblY + Math.round(fs * 1.5);
  var formulaEl = document.createElement('div');
  formulaEl.id = 'hRemainFormula';
  formulaEl.style.cssText = 'position:absolute;font-weight:800;font-family:Nunito,sans-serif;'
    +'font-size:'+Math.round(fs*0.85)+'px;'
    +'left:'+Math.round(Lox)+'px;top:'+formulaY+'px;'
    +'z-index:5;white-space:nowrap;line-height:1;';
  var spanOther = document.createElement('span');
  spanOther.style.color = c.otherTc;
  spanOther.textContent = other;
  var spanMinus = document.createElement('span');
  spanMinus.style.color = '#333333';
  spanMinus.textContent = '－';
  var spanMove = document.createElement('span');
  spanMove.style.color = '#cc8800';
  spanMove.textContent = move;
  var spanEq = document.createElement('span');
  spanEq.style.color = '#333333';
  spanEq.textContent = '＝';
  var spanRemain = document.createElement('span');
  spanRemain.id = 'hRemainFormulaAns';
  spanRemain.style.color = c.otherTc;
  spanRemain.textContent = remain;
  formulaEl.appendChild(spanOther);
  formulaEl.appendChild(spanMinus);
  formulaEl.appendChild(spanMove);
  formulaEl.appendChild(spanEq);
  formulaEl.appendChild(spanRemain);
  brd.appendChild(formulaEl);

  requestAnimationFrame(function() {
    var olEl = hintEl('hOL');
    var ansEl = hintEl('hRemainFormulaAns');
    var brdEl = document.getElementById('hint-board');
    if (!olEl || !ansEl || !brdEl) return;
    var brdRect = brdEl.getBoundingClientRect();
    var olRect  = olEl.getBoundingClientRect();
    var ansRect = ansEl.getBoundingClientRect();
    var x1 = Math.round(olRect.left + olRect.width/2  - brdRect.left);
    var y1 = Math.round(olRect.bottom - brdRect.top);
    var x2 = Math.round(ansRect.left + ansRect.width/2 - brdRect.left);
    var y2 = Math.round(ansRect.top - brdRect.top);
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'hRemainLine';
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4;overflow:visible;';
    var line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', c.otherTc);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4 3');
    line.setAttribute('opacity', '0.7');
    svg.appendChild(line);
    brdEl.appendChild(svg);
  });
}

function hHintStep3(brd, msg, c, near, other, move, step, fs, topMargin, Rox, oy, dotPx, gap) {
  msg.textContent = move + ' こ が いくよ！';
  hSpeak(toHira(move) + ' こ が いくよ！');

  var dstPositions = hDotPositions(near + move, Rox, oy, dotPx, gap);

  for (var i = 0; i < move; i++) {
    var d = hintEl('hOt' + (other - 1 - i));
    if (d) {
      var dst = dstPositions[near + i];
      d.style.left = dst.x + 'px';
      d.style.top  = dst.y + 'px';
    }
  }

  var mnEl = hintEl('hMoveNum');
  if (mnEl) {
    var dstPositions2 = hDotPositions(near + move, Rox, oy, dotPx, gap);
    var yellowStartIdx = near;
    var yellowCenterX = dstPositions2[yellowStartIdx].x + step * (move > 1 ? (move - 1) / 2 : 0);
    var moveNumY = Math.round(topMargin * 0.15);
    mnEl.style.left = Math.round(yellowCenterX) + 'px';
    mnEl.style.top  = moveNumY + 'px';
    mnEl.style.transform = 'translateX(-50%)';
  }
}

function hHintStep4(brd, msg, c, near, move, remain, fs, lblY, Rox, oy, dotPx, gap, step) {
  msg.textContent = '✨ 10 が できた！ ✨';
  hSpeak('じゅう が できた！');

  var nl = hintEl('hNL');
  if (nl) nl.style.opacity = '0';

  hDotPositions(10, Rox, oy, dotPx, gap);
  var boxX = Rox - gap;
  var boxY = oy - gap;
  var boxW = step * 5 + gap;
  var boxH = step * 2 + gap;
  var boxEl = document.createElement('div');
  boxEl.style.cssText = 'position:absolute;border:3px dashed #ff9900;border-radius:8px;'
    +'left:'+boxX+'px;top:'+boxY+'px;width:'+boxW+'px;height:'+boxH+'px;z-index:1;';
  brd.appendChild(boxEl);

  hMakeLbl(brd, Math.round(Rox + step * 5 + gap * 2), Math.round(oy + step * 0.2),
    '10', '#ff6600', 'hTenLbl', Math.round(fs * 1.3));

  var mnEl = hintEl('hMoveNum');
  if (mnEl) mnEl.style.opacity = '0';

  var formulaEl = document.createElement('div');
  formulaEl.id = 'hFormula';
  var formulaTxt = near + '＋' + move + '＝10';
  formulaEl.style.cssText = 'position:absolute;font-weight:900;font-family:Nunito,sans-serif;'
    +'font-size:'+Math.round(fs * 1.05)+'px;color:#ff6600;'
    +'left:'+Rox+'px;top:'+Math.round(lblY)+'px;z-index:5;white-space:nowrap;';
  formulaEl.textContent = formulaTxt;
  brd.appendChild(formulaEl);

  var ol = hintEl('hOL');
  if (ol) ol.textContent = remain;
}

function hHintStep5(brd, msg, A, B, fs) {
  msg.textContent = 'こたえは ' + (A + B) + '！';
  hSpeak('こたえは ' + toHira(A + B) + '！');
  var ans = document.createElement('div');
  ans.style.cssText = 'position:absolute;font-size:'+Math.round(fs*2.2)+'px;font-weight:900;'
    +'color:#ff3300;left:50%;bottom:4px;transform:translateX(-50%);'
    +'font-family:Nunito,sans-serif;white-space:nowrap;z-index:10;';
  ans.textContent = A + ' ＋ ' + B + ' ＝ ' + (A+B);
  brd.appendChild(ans);
}
