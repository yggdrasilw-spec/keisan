// 06-voice-ui.js
// ======================================================
// 音声設定UI（表示 / 入力）
// ======================================================

function syncSoundButton(btnId, on, onIcon, offIcon, label) {
  var btn = document.getElementById(btnId);
  if (!btn) return;
  btn.className = 'snd-btn ' + (on ? 'on' : 'off');
  btn.textContent = (on ? onIcon : offIcon) + ' ' + label;
}

function syncAudioControlButtons() {
  syncSoundButton('sfx-btn', typeof sfxOn !== 'undefined' ? !!sfxOn : true, '🔔', '🔕', 'おと');
  syncSoundButton('voice-btn', voiceOn, '🗣', '🔇', 'こえ');
}

function syncAudioToggles() {
  syncAudioControlButtons();
}

function syncVoiceSettingsUI() {
  var pitchSlider = document.getElementById('pitch-slider');
  var rateSlider  = document.getElementById('rate-slider');
  var pitchVal    = document.getElementById('pitch-val');
  var rateVal     = document.getElementById('rate-val');
  var sel         = document.getElementById('voice-select');
  if (pitchSlider) pitchSlider.value = voiceCfg.pitch;
  if (rateSlider)  rateSlider.value  = voiceCfg.rate;
  if (pitchVal)    pitchVal.textContent = Number(voiceCfg.pitch).toFixed(2);
  if (rateVal)     rateVal.textContent  = Number(voiceCfg.rate).toFixed(2);
  if (sel && voiceCfg.voiceName) sel.value = voiceCfg.voiceName;
  syncAudioControlButtons();
}

function saveVoiceCfg() {
  storageSaveJSON(LS_VOICE, voiceCfg);
}

function renderVoiceSettings() {
  if (!window.speechSynthesis) {
    var p = document.getElementById('voice-not-supported');
    var panel = document.getElementById('voice-settings-panel');
    if (p) p.style.display = 'block';
    if (panel) panel.style.display = 'none';
    syncAudioControlButtons();
    return;
  }
  syncVoiceSettingsUI();
  buildVoiceSelect();
}

function onVoiceSelectChange() {
  var sel = document.getElementById('voice-select');
  if (!sel) return;
  voiceCfg.voiceName = sel.value;
  saveVoiceCfg();
  syncVoiceSettingsUI();
}

function onPitchInput(v) {
  voiceCfg.pitch = parseFloat(v);
  saveVoiceCfg();
  syncVoiceSettingsUI();
}

function onRateInput(v) {
  voiceCfg.rate = parseFloat(v);
  saveVoiceCfg();
  syncVoiceSettingsUI();
}


function initVoiceSettingsBindings() {
  var sel = document.getElementById('voice-select');
  if (sel && !sel.__boundVoiceChange) {
    sel.__boundVoiceChange = true;
    sel.addEventListener('change', onVoiceSelectChange);
  }
  var pitchSlider = document.getElementById('pitch-slider');
  if (pitchSlider && !pitchSlider.__boundVoicePitch) {
    pitchSlider.__boundVoicePitch = true;
    pitchSlider.addEventListener('input', function () { onPitchInput(this.value); });
  }
  var rateSlider = document.getElementById('rate-slider');
  if (rateSlider && !rateSlider.__boundVoiceRate) {
    rateSlider.__boundVoiceRate = true;
    rateSlider.addEventListener('input', function () { onRateInput(this.value); });
  }
}

function previewVoice() {
  var sel = document.getElementById('voice-select');
  if (sel) voiceCfg.voiceName = sel.value;
  hSpeak('すごい！はやっ！さいきょう！せいかい！');
}

initVoiceSettingsBindings();
