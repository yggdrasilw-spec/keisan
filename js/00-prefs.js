// 00-prefs.js
// ======================================================
// 永続設定（音声 / 称賛文）
// ======================================================
var LS_VOICE = APP_KEYS.VOICE;
var voiceCfg = storageLoadJSON(LS_VOICE, { voiceName: '', pitch: 1.0, rate: 0.9 });

function saveVoiceCfg() {
  storageSaveJSON(LS_VOICE, voiceCfg);
}

var voiceOn = storageLoadText(APP_KEYS.VOICE_ON, '1') !== '0';

function setVoiceOnState(nextOn) {
  voiceOn = !!nextOn;
  storageSaveText(APP_KEYS.VOICE_ON, voiceOn ? '1' : '0');
  if (typeof setSessionField === 'function') setSessionField('voiceOn', voiceOn);
  else if (typeof appState !== 'undefined' && appState && appState.session) {
    appState.session.voiceOn = voiceOn;
  }
  if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
}

var DEFAULT_PRAISE = [
  'かみ！','すごっ！','はやっ！','さいきょう！','キレてる！',
  'はやい！いいぞ！','すごい！のってる！','ナイス！','いいぞ！すすんでる！',
  'できた！せいかいだよ！','あってる！そのちょうし！'
];
var LS_PRAISE = APP_KEYS.PRAISE;
var praiseList = storageLoadJSON(LS_PRAISE, DEFAULT_PRAISE.slice());

function savePraise() {
  storageSaveJSON(LS_PRAISE, praiseList);
}

function resolvePraiseAudioIndex(text) {
  for (var i = 0; i < praiseList.length; i++) {
    if ((praiseList[i] || DEFAULT_PRAISE[i]) === text) return i;
  }
  return -1;
}

function getPraiseMsg(sec) {
  var idx;
  if      (sec < 1)  idx = 0;
  else if (sec < 2)  idx = 1;
  else if (sec < 3)  idx = 2;
  else if (sec < 4)  idx = 3;
  else if (sec < 5)  idx = 4;
  else if (sec < 6)  idx = 5;
  else if (sec < 7)  idx = 6;
  else if (sec < 8)  idx = 7;
  else if (sec < 9)  idx = 8;
  else if (sec < 10) idx = 9;
  else               idx = 10;
  return praiseList[idx] || DEFAULT_PRAISE[idx];
}
