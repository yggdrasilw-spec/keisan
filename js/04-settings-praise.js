// 04-settings-praise.js
// ======================================================
// 設定画面：ほめ言葉 / 答えモード
// ======================================================
var PRAISE_LABELS = [
  '1秒未満','1〜2秒','2〜3秒','3〜4秒','4〜5秒',
  '5〜6秒','6〜7秒','7〜8秒','8〜9秒','9〜10秒','10秒以上'
];

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
var NUM_TO_HIRA = ['ぜろ','いち','に','さん','し','ご','ろく','なな','はち','く','じゅう','じゅういち','じゅうに','じゅうさん','じゅうし','じゅうご','じゅうろく','じゅうなな','じゅうはち'];
function toHira(n) { return NUM_TO_HIRA[n] || String(n); }

function renderPraiseEdit() {
  var el = document.getElementById('praise-edit-list');
  if (!el) return;
  var h = '';
  for (var i = 0; i < DEFAULT_PRAISE.length; i++) {
    var hasAudio = !!praiseAudio[i];
    var audioName = hasAudio ? (praiseAudioNames[i] || 'おんせい'+i) : '';
    h += '<div style="background:#fff;border-radius:14px;padding:10px 12px;border:2px solid #E8D8B8;margin-bottom:2px;">'
      + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">'
      + '<span style="font-size:10px;color:#8A7050;font-weight:700;min-width:54px;text-align:right;">'+PRAISE_LABELS[i]+'</span>'
      + '<input id="praise-inp-'+i+'" type="text" value="'+escHtml(praiseList[i]||'')+'" '
      + (hasAudio ? 'disabled style="flex:1;border-radius:12px;padding:8px 10px;font-size:13px;font-weight:700;border:2px dashed #AAAAE8;font-family:Nunito,sans-serif;color:#8A7050;outline:none;background:#F5F5FF;" '
                  : 'style="flex:1;border-radius:12px;padding:8px 10px;font-size:13px;font-weight:700;border:2px solid #E8D8B8;font-family:Nunito,sans-serif;color:#3A2A00;outline:none;" ')
      + '/>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:6px;padding-left:60px;">'
      + (hasAudio
          ? '<span style="font-size:10px;color:#5050A0;font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🎵 '+escHtml(audioName)+'</span>'
            + '<button data-action="playPraiseAudioPreview" data-value="'+i+'" style="border-radius:10px;padding:3px 10px;font-size:11px;font-weight:700;background:#EEF0FF;color:#3A3A9A;border:1.5px solid #AAAAE8;cursor:pointer;font-family:inherit;white-space:nowrap;">▶ためし</button>'
            + '<button data-action="removePraiseAudio" data-value="'+i+'" style="border-radius:10px;padding:3px 8px;font-size:11px;font-weight:700;background:#FFF0F0;color:#A03030;border:1.5px solid #E8B0B0;cursor:pointer;font-family:inherit;">✕</button>'
          : '<button data-action="openPraiseAudioPicker" data-value="'+i+'" style="border-radius:10px;padding:3px 12px;font-size:11px;font-weight:700;background:#F5EDE0;color:#8A7050;border:1.5px solid #E8D8B8;cursor:pointer;font-family:inherit;white-space:nowrap;">🎵 おんせいをえらぶ</button>'
            + '<span style="font-size:10px;color:#B0A090;font-weight:600;">（てきようすると よみあげしない）</span>'
        )
      + '</div>'
      + '</div>';
  }
  el.innerHTML = h;
}
function savePraiseEdit() {
  for (var i = 0; i < DEFAULT_PRAISE.length; i++) {
    var inp = document.getElementById('praise-inp-'+i);
    if (inp) praiseList[i] = inp.value.trim() || DEFAULT_PRAISE[i];
  }
  savePraise();
  var btn = document.querySelector('[data-action="savePraiseEdit"]');
  if (btn) { var orig=btn.textContent; btn.textContent='✓ ほぞん した！'; setTimeout(function(){ btn.textContent=orig; },1200); }
}
function resetPraiseEdit() {
  praiseList = DEFAULT_PRAISE.slice();
  savePraise();
  renderPraiseEdit();
}

function syncAnswerModeButtons(m) {
  var configs = {
    'random': { bg:'#E8F8DF', bd:'#5AAA30' },
    'calc':   { bg:'#EEF0FF', bd:'#5A5ADF' },
    'hw':     { bg:'#FFF8E8', bd:'#F5A623' },
  };
  ['random','calc','hw'].forEach(function(key) {
    var el = document.getElementById('set-btn-' + key);
    if (!el) return;
    var on = (m === key);
    el.style.background  = on ? configs[key].bg : '#fff';
    el.style.borderColor = on ? configs[key].bd : '#E8D8B8';
  });
}

function setAnswerMode(m) {
  answerMode = m;
  if (typeof setSessionField === 'function') setSessionField('answerMode', answerMode);
  storageSaveText(APP_KEYS.ANSWER_MODE, m);
  syncAnswerModeButtons(m);
}
