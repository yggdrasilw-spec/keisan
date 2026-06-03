// 01-kotsu-records.js
// ======================================================
// コツ：記録・統計
// ======================================================
function goKotsuR() {
  document.getElementById('kr-title').textContent = kModeLabel(kSt.mode) + ' ' + kSt.num + 'をたすもんだい きろく';
  renKotsuR();
  show('kotsu-records');
}

function goKotsuSt() {
  document.getElementById('ks-title').textContent = kModeLabel(kSt.mode) + ' ' + kSt.num + 'をたすもんだい とうけい';
  document.getElementById('ks-gtitle').textContent = kModeLabel(kSt.mode) + ' ' + kSt.num + 'をたすもんだい いちらん';
  renKotsuSt();
  show('kotsu-stats');
}

function renKotsuR() {
  var n = kSt.num, ord = {weak:0, unseen:1, ok:2, master:3};
  var ps = buildKP(n).slice().sort(function(a, b) { return (ord[getSt(kD[kk(n, a)])] || 0) - (ord[getSt(kD[kk(n, b)])] || 0); });
  var h = '';
  for (var i = 0; i < ps.length; i++) {
    var p = ps[i], rec = kD[kk(n, p)], st = getSt(rec);
    var info = (rec && rec.att) ? rec.att + 'かい・' + Math.round(rec.cor / rec.att * 100) + '%・さいきん' + (rec.last ? (rec.last.el / 1000).toFixed(1) + '秒' : '-') : 'まだ やっていないよ';
    h += riHtml(ST_DOT[st], p.a + '+' + p.b + '=' + p.ans, info, ST_BG[st], ST_TC[st], ST_PT[st]);
  }
  document.getElementById('kr-list').innerHTML = h;
}

function renKotsuSt() {
  var n = kSt.num, ps = buildKP(n), m = 0, ok = 0, w = 0;
  for (var i = 0; i < ps.length; i++) {
    var st = getSt(kD[kk(n, ps[i])]);
    if (st === 'master') m++; else if (st === 'ok') ok++; else if (st === 'weak') w++;
  }
  document.getElementById('ks-m').textContent = m;
  document.getElementById('ks-ok').textContent = ok;
  document.getElementById('ks-w').textContent = w;
  var h = '';
  for (var j = 0; j < ps.length; j++) {
    var st2 = getSt(kD[kk(n, ps[j])]);
    h += '<div class="hcell" style="background:'+ST_HG[st2]+';color:'+ST_HTC[st2]+'" title="'+ps[j].a+'+'+ps[j].b+'='+ps[j].ans+'">'+ps[j].a+'+'+ps[j].b+'</div>';
  }
  document.getElementById('ks-grid').innerHTML = h;
}

function riHtml(dot, eq, info, pb, pc, pt) {
  return '<div class="ri"><span style="width:9px;height:9px;border-radius:50%;background:'+dot+';flex-shrink:0;display:inline-block"></span>'
    + '<span class="req">'+eq+'</span><span class="rinfo">'+info+'</span>'
    + '<span class="rpill" style="background:'+pb+';color:'+pc+'">'+pt+'</span></div>';
}
