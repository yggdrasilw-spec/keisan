// 06-voice-list.js
// ======================================================
// 音声候補リスト生成（voice list / group / select options）
// ======================================================

function buildVoiceSelect() {
  var sel = document.getElementById('voice-select');
  if (!sel || !window.speechSynthesis) return;
  var voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    window.speechSynthesis.onvoiceschanged = function() {
      window.speechSynthesis.onvoiceschanged = null;
      buildVoiceSelect();
    };
    return;
  }

  function guessGender(v) {
    var n = (v.name || '').toLowerCase();
    var femaleKw = ['female','woman','girl','kyoko','haruka','ayumi','yukari','sakura','nanami','mizuki','akiko','yuna','hikari','siri female'];
    var maleKw   = ['male','man','boy','otoya','takashi','kenji','ichiro','siri male'];
    for (var i=0;i<femaleKw.length;i++) if (n.indexOf(femaleKw[i])>=0) return 'female';
    for (var i=0;i<maleKw.length;i++)   if (n.indexOf(maleKw[i])>=0)   return 'male';
    return 'other';
  }

  var jaVoices    = voices.filter(function(v){ return /^ja/i.test(v.lang); });
  var otherVoices = voices.filter(function(v){ return !/^ja/i.test(v.lang); });
  var jaFemale = jaVoices.filter(function(v){ return guessGender(v)==='female'; });
  var jaMale   = jaVoices.filter(function(v){ return guessGender(v)==='male'; });
  var jaOther  = jaVoices.filter(function(v){ return guessGender(v)==='other'; });

  function makeOpts(vs) {
    return vs.map(function(v){
      var sel2 = (v.name === voiceCfg.voiceName) ? ' selected' : '';
      var local = v.localService ? ' ✓' : '';
      return '<option value="'+escHtml(v.name)+'"'+sel2+'>'+escHtml(v.name)+local+'</option>';
    }).join('');
  }

  var h = '';
  if (jaFemale.length) h += '<optgroup label="🟣 にほんご（じょせい）">'+makeOpts(jaFemale)+'</optgroup>';
  if (jaMale.length)   h += '<optgroup label="🔵 にほんご（だんせい）">'+makeOpts(jaMale)+'</optgroup>';
  if (jaOther.length)  h += '<optgroup label="🟡 にほんご（その他）">'+makeOpts(jaOther)+'</optgroup>';
  if (otherVoices.length) {
    var enVoices = otherVoices.filter(function(v){ return /^en/i.test(v.lang); });
    var restVoices = otherVoices.filter(function(v){ return !/^en/i.test(v.lang); });
    if (enVoices.length)   h += '<optgroup label="🇺🇸 えいご">'+makeOpts(enVoices)+'</optgroup>';
    if (restVoices.length) h += '<optgroup label="🌐 その他">'+makeOpts(restVoices)+'</optgroup>';
  }

  if (!voiceCfg.voiceName && jaVoices.length) {
    voiceCfg.voiceName = jaVoices[0].name;
    saveVoiceCfg();
  }
  sel.innerHTML = h || '<option value="">（こえがみつかりません）</option>';
  if (voiceCfg.voiceName) sel.value = voiceCfg.voiceName;
}

