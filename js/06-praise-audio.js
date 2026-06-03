// 06-praise-audio.js
// ======================================================
// 称賛音声ファイル管理（保存 / 再生）
// ======================================================

var LS_AUDIO = APP_KEYS.PRAISE_AUDIO;
var LS_AUDIO_NAMES = APP_KEYS.PRAISE_AUDIO_NAMES;
var praiseAudio = {};      // {0: 'data:audio/...', 1: ...}
var praiseAudioNames = {}; // {0: 'filename.mp3', ...}
var _praiseAudioPickerIdx = -1;
var _praiseAudioCurrentObj = null;

function praiseAudioLoad() {
  praiseAudio = storageLoadJSON(LS_AUDIO, {});
  praiseAudioNames = storageLoadJSON(LS_AUDIO_NAMES, {});
}
function praiseAudioSave() {
  try {
    storageSaveJSON(LS_AUDIO, praiseAudio);
    storageSaveJSON(LS_AUDIO_NAMES, praiseAudioNames);
  } catch(e) {
    alert('おんせいの ほぞんに しっぱいしました。\nファイルサイズが おおきすぎるかもしれません。');
  }
}
function openPraiseAudioPicker(idx) {
  _praiseAudioPickerIdx = idx;
  var inp = document.getElementById('praise-audio-input');
  if (inp) { inp.value = ''; inp.click(); }
}
function initPraiseAudioInputBinding() {
  var inp = document.getElementById('praise-audio-input');
  if (!inp || inp.__boundPraiseAudioChange) return;
  inp.__boundPraiseAudioChange = true;
  inp.addEventListener('change', onPraiseAudioSelected);
}

function onPraiseAudioSelected(e) {
  var file = e.target.files && e.target.files[0];
  if (!file || _praiseAudioPickerIdx < 0) return;
  var idx = _praiseAudioPickerIdx;
  var reader = new FileReader();
  reader.onload = function(ev) {
    praiseAudio[idx] = ev.target.result;
    praiseAudioNames[idx] = file.name;
    praiseAudioSave();
    renderPraiseEdit();
  };
  reader.readAsDataURL(file);
}
function removePraiseAudio(idx) {
  delete praiseAudio[idx];
  delete praiseAudioNames[idx];
  praiseAudioSave();
  renderPraiseEdit();
}
function playPraiseAudioByIdx(idx) {
  if (!praiseAudio[idx]) return;
  if (_praiseAudioCurrentObj) { try { _praiseAudioCurrentObj.pause(); _praiseAudioCurrentObj.currentTime = 0; } catch(e){} }
  var audio = new Audio(praiseAudio[idx]);
  _praiseAudioCurrentObj = audio;
  audio.volume = 1.0;
  audio.play().catch(function(){});
}
function playPraiseAudioPreview(idx) {
  playPraiseAudioByIdx(idx);
}

praiseAudioLoad();

initPraiseAudioInputBinding();
