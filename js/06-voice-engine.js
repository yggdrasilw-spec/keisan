// 06-voice-engine.js
// ======================================================
// 音声再生エンジン（読み上げ / 称賛音声連携）
// ======================================================

var __voiceEnginePrimed = false;

function primeVoiceEngine() {
  if (__voiceEnginePrimed || !window.speechSynthesis) return;
  __voiceEnginePrimed = true;
  try {
    window.speechSynthesis.getVoices();
    var u = new SpeechSynthesisUtterance('あ');
    u.lang = 'ja-JP';
    u.pitch = 1;
    u.rate = 1;
    u.volume = 0;
    window.speechSynthesis.speak(u);
    setTimeout(function() {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }, 50);
  } catch (e) {}
}

function setVoiceEnabled(nextOn) {
  if (typeof setVoiceOnState === 'function') setVoiceOnState(nextOn);
  else {
    voiceOn = !!nextOn;
    setSessionField('voiceOn', voiceOn);
    storageSaveText(APP_KEYS.VOICE_ON, voiceOn ? '1' : '0');
  }
  syncAudioControlButtons();
  if (!voiceOn && window.speechSynthesis) window.speechSynthesis.cancel();
}

function toggleVoice() {
  setVoiceEnabled(!voiceOn);
}

function getSelectedVoice() {
  if (!window.speechSynthesis) return null;
  var voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  if (voiceCfg.voiceName) {
    var found = voices.find(function(v){ return v.name === voiceCfg.voiceName; });
    if (found) return found;
  }
  var jaVoices = voices.filter(function(v){ return /^ja/i.test(v.lang); });
  return jaVoices[0] || voices[0];
}

function hSpeak(text) {
  if (!voiceOn) return;
  var praiseIdx = resolvePraiseAudioIndex(text);
  if (praiseIdx >= 0 && praiseAudio[praiseIdx]) {
    playPraiseAudioByIdx(praiseIdx);
    return;
  }
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.pitch = voiceCfg.pitch;
  u.rate  = voiceCfg.rate;
  u.volume = 1.0;
  var v = getSelectedVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}
