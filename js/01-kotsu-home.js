// 01-kotsu-home.js
// ======================================================
// コツ：ホーム・問題選択
// ======================================================
function renNumGrid() {
  var title = document.getElementById('kotsu-home-title');
  var desc  = document.getElementById('kotsu-home-desc');
  if (title) title.textContent = (kSt.mode==='no'?'🌿 くりあがりなし コツをつかもう！':'💡 くりあがりあり コツをつかもう！');
  if (desc)  desc.textContent  = kModeDesc(kSt.mode);
  var h = '', start = kNumStart(kSt.mode), end = kNumEnd(kSt.mode);
  for (var n = start; n <= end; n++) {
    var ps = buildKP(n), col = NUM_COLS[n] || {bd:'#E8D8B8',bg:'#fff',tc:'#3A2A00'}, dh = '';
    for (var i = 0; i < ps.length; i++) {
      var st = getSt(kD[kk(n, ps[i])]);
      dh += '<div class="ndot" style="background:'+ST_DOT[st]+'"></div>';
    }
    h += '<div class="num-card" style="border-color:'+col.bd+';background:'+col.bg+'" data-action="showKotsuSub" data-value="'+n+'">'
      + '<div class="num-big" style="color:'+col.tc+'">'+n+'</div>'
      + '<div class="num-lbl">をたすもんだい</div>'
      + '<div class="num-dots">'+dh+'</div></div>';
  }
  document.getElementById('num-grid').innerHTML = h;
}

function showKotsuSub(n) {
  kSt.num = n; kSt.filt = 'all';
  syncLegacyStateAliases();
  document.getElementById('ksub-title').textContent = n + 'をたすもんだい';
  var ps = buildKP(n);
  document.getElementById('ksub-desc').textContent = '（'+n+'＋○ と ○＋'+n+' ぜんぶで '+ps.length+'もん）';
  document.getElementById('kfa').classList.add('on');
  document.getElementById('kfw').classList.remove('on');
  updKQI();
  show('kotsu-sub');
}
