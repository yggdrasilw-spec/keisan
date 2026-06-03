// 11-handwriting.js
// ======================================================
// 手書きモード / 答えモードタブ
// ======================================================
var hwModel = null;
var hwModelLoaded = false;
// ── 答えモードタブ切替 ──
var _currentAnsTab = null; // btn / calc / hw

function setAnsTab(mode) {
  _currentAnsTab = mode;
  // タブUI
  ['btn','calc','hw'].forEach(function(m) {
    var el=document.getElementById('atab-'+m);
    if(el) el.classList.toggle('on', m===mode);
  });
  // 各エリアの表示切替
  var agrid   = document.getElementById('agrid');
  var calcgrid= document.getElementById('calcgrid');
  var hwArea  = document.getElementById('hw-area');
  if(agrid)    agrid.style.display    = (mode==='btn')  ? '' : 'none';
  if(calcgrid) calcgrid.style.display = (mode==='calc') ? '' : 'none';
  if(hwArea)   {
    if(mode==='hw') {
      hwArea.style.display='flex';
      hwClear();
      hwLoadModel();
      hwInitCanvas();
    } else {
      hwArea.style.display='none';
    }
  }
  // 各モードの入力UIを生成
  if(sess.queue && sess.queue[sess.idx]) {
    if(mode==='calc') buildCalc(sess.queue[sess.idx]);
    if(mode==='btn')  buildA(sess.queue[sess.idx]);
  }
}

// showP が呼ばれるたびにタブ表示・手書きキャンバスリセット
function hwOnShowP() {
  // タブを表示
  var tabs=document.getElementById('ans-mode-tabs');
  if(tabs) tabs.style.display='flex';
  // 現在のタブを維持（初回はanswerModeに合わせる）
  if(!_currentAnsTab) {
    _currentAnsTab = answerMode==='calc' ? 'calc' : answerMode==='hw' ? 'hw' : 'btn';
  }
  setAnsTab(_currentAnsTab);
  // 手書き中ならリセット
  if(_currentAnsTab==='hw') hwClear();
}
