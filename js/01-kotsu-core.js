// 01-kotsu-core.js
// ======================================================
// コツ（kotsu）共通
// ======================================================
function kModeLabel(mode) { return mode==='no'?'くりあがりなし':'くりあがりあり'; }
function kModeDesc(mode)  { return mode==='no'?'１〜９を ひとつずつ れんしゅうできるよ':'２〜９を ひとつずつ れんしゅうできるよ'; }
function kNumStart(mode)   { return mode==='no'?1:2; }
function kNumEnd(mode)     { return 9; }

function goKotsuFromCourse() {
  var mode = (curLevel === 'hard') ? 'carry' : 'no';
  kSt.mode = mode;
  syncLegacyStateAliases();
  renNumGrid();
  show('kotsu-home');
}

function kFiltP() {
  var ps = buildKP(kSt.num), out = [];
  for (var i = 0; i < ps.length; i++) {
    if (kSt.filt === 'weak') {
      var st = getSt(kD[kk(kSt.num, ps[i])]);
      if (st === 'weak' || st === 'unseen') out.push(ps[i]);
    } else {
      out.push(ps[i]);
    }
  }
  return out;
}

function updKQI() {
  var n = kFiltP().length;
  document.getElementById('kqi').textContent = n ? n + 'もん あります' : 'がいとうするもんだいがありません';
}

function kSelFilt(f) {
  kSt.filt = f;
  syncLegacyStateAliases();
  document.getElementById('kfa').classList.toggle('on', f === 'all');
  document.getElementById('kfw').classList.toggle('on', f === 'weak');
  updKQI();
}
