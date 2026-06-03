// 00-storage-persist.js
// ======================================================
// 永続化（localStorage への書き戻し）
// ======================================================
var LS_GD  = APP_KEYS.GD;
var LS_KD  = APP_KEYS.KD;
var LS_RK  = APP_KEYS.RK;
var LS_AUDIO = APP_KEYS.PRAISE_AUDIO;
var LS_AUDIO_NAMES = APP_KEYS.PRAISE_AUDIO_NAMES;
var LS_IMG = APP_KEYS.IMGS;
var LS_BADGE = APP_KEYS.BADGE;

function syncUiAfterPersistedStateChange() {
  if (typeof syncFxToggleButtons === 'function') syncFxToggleButtons();
  if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
  if (typeof syncVoiceSettingsUI === 'function') syncVoiceSettingsUI();
  if (typeof syncImageSettingsUI === 'function') syncImageSettingsUI();
  if (typeof syncHistoryTabButtons === 'function') syncHistoryTabButtons();
  if (typeof refreshVisibleScreen === 'function') refreshVisibleScreen();
}

function persistAppStateToStorage() {
  syncLegacyStateAliases();
  storageSaveJSON(LS_GD, gD);
  storageSaveJSON(LS_KD, kD);
  storageSaveJSON(LS_RK, rkD);
  storageSaveJSON(LS_FX, fxSettings);
  storageSaveText(APP_KEYS.VOICE_ON, voiceOn ? '1' : '0');
  storageSaveJSON(LS_VOICE, voiceCfg);
  storageSaveJSON(LS_IMG, imgCustom);
  storageSaveJSON(LS_AUDIO, praiseAudio);
  storageSaveJSON(LS_AUDIO_NAMES, praiseAudioNames);
  if (typeof savePraise === 'function') savePraise();
  else storageSaveJSON(LS_PRAISE, praiseList);
  storageSaveJSON(LS_BADGE, badgeData);
  storageSaveText(APP_KEYS.ANSWER_MODE, appState.session.answerMode);
}

function syncPersistedStateFromSnapshot(snapshot) {
  if (!applyAppSnapshot(snapshot)) return false;
  persistAppStateToStorage();
  syncUiAfterPersistedStateChange();
  return true;
}
