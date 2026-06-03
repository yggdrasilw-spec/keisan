// 02-practice-input.js
// ======================================================
// 練習画面の入力UI・電卓・キーボード入力
// ======================================================

function buildA(p) {
  var choices = [p.ans], tries = 0;
  while (choices.length < 10 && tries < 300) {
    tries++;
    var v = p.ans + Math.round((Math.random() - .5) * 7);
    if (v >= 1 && v <= 18 && choices.indexOf(v) === -1) choices.push(v);
  }
  sh(choices);
  var g = document.getElementById('agrid');
  if (!g) return;
  g.innerHTML = '';
  for (var i = 0; i < choices.length; i++) {
    (function(v, col) {
      var btn = document.createElement('button');
      btn.className = 'abtn';
      btn.style.cssText = 'background:' + col.bg + ';border-color:' + col.bd + ';color:' + col.tc + ';box-shadow:0 3px 0 ' + col.sh;
      btn.textContent = v;
      btn.addEventListener('click', function() { chk(v, btn, p); });
      g.appendChild(btn);
    })(choices[i], ACOLS[i % 6]);
  }
}

function buildCalc(p) {
  var g = document.getElementById('calcgrid');
  if (!g) return;
  g.innerHTML = '';
  var keys = [7,8,9, 4,5,6, 1,2,3, 'DEL',0,''];
  for (var i = 0; i < keys.length; i++) {
    (function(k) {
      var btn = document.createElement('button');
      if (k === '') { btn.style.visibility = 'hidden'; btn.className = 'cbtn'; g.appendChild(btn); return; }
      btn.className = k === 'DEL' ? 'cbtn cbtn-del' : 'cbtn';
      btn.textContent = k === 'DEL' ? '⌫' : k;
      btn.id = k === 'DEL' ? 'cbtn-del' : 'cbtn-' + k;
      btn.addEventListener('click', function() { calcPress(k); });
      g.appendChild(btn);
    })(keys[i]);
  }
}

function calcPress(k) {
  if (sess._calcDone) return;
  var p = sess.queue[sess.idx];
  if (!p) return;

  if (k === 'DEL') {
    if (calcInput.length > 0) {
      calcInput = calcInput.slice(0, -1);
      var disp = calcInput === '' ? '？' : calcInput + '？';
      fitEq(p.a + ' ＋ ' + p.b + ' ＝ ' + disp);
    }
    return;
  }

  var digit = String(k);
  var ans = p.ans;
  var isTwoDigit = (ans >= 10);

  if (isTwoDigit) {
    if (calcInput.length === 0) {
      calcInput = digit;
      var tensExpected = Math.floor(ans / 10);
      if (parseInt(digit, 10) !== tensExpected) {
        sess._calcDone = true;
        fitEq(p.a + ' ＋ ' + p.b + ' ＝ ' + digit + '?');
        var snapP = p;
        setTimeout(function() { chkCalc(parseInt(digit, 10) * 10, snapP); }, 350);
      } else {
        fitEq(p.a + ' ＋ ' + p.b + ' ＝ ' + digit + '？');
      }
    } else if (calcInput.length === 1) {
      var tens = calcInput;
      var ones = digit;
      var fullStr = tens + ones;
      var fullVal = parseInt(fullStr, 10);
      calcInput = fullStr;
      sess._calcDone = true;
      fitEq(p.a + ' ＋ ' + p.b + ' ＝ ' + fullStr);
      var snapP2 = p;
      setTimeout(function() { chkCalc(fullVal, snapP2); }, 120);
    }
  } else {
    var oneVal = parseInt(digit, 10);
    calcInput = digit;
    sess._calcDone = true;
    fitEq(p.a + ' ＋ ' + p.b + ' ＝ ' + digit);
    var snapP3 = p;
    setTimeout(function() { chkCalc(oneVal, snapP3); }, 120);
  }
}

function chkCalc(v, p) {
  var btns = document.querySelectorAll('#calcgrid .cbtn');
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
  var dummy = document.createElement('div');
  dummy._calcOrigin = document.getElementById('pcard');
  chk(v, dummy, p);
}

document.addEventListener('keydown', function(e) {
  if (!document.getElementById('practice').classList.contains('on')) return;
  if (answerMode !== 'calc') return;
  if (sess._calcDone) return;
  if (e.key >= '0' && e.key <= '9') {
    calcPress(parseInt(e.key, 10));
  } else if (e.key === 'Backspace') {
    calcPress('DEL');
  }
});
