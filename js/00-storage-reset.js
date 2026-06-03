// 00-storage-reset.js
// ======================================================
// 保存データの削除 / 実行中状態の初期化
// ======================================================
function getPersistedAppStorageKeys() {
  return [
    LS_GD, LS_KD, LS_RK, LS_FX,
    LS_PRAISE, LS_VOICE, APP_KEYS.VOICE_ON,
    LS_AUDIO, LS_AUDIO_NAMES, LS_IMG,
    LS_BADGE, APP_KEYS.ANSWER_MODE
  ];
}

function clearPersistedAppData() {
  getPersistedAppStorageKeys().forEach(function(key){ storageRemove(key); });
}

function resetPersistedRuntimeState() {
  if (typeof applyDataSnapshot === 'function') {
    applyDataSnapshot({ gD: {}, kD: {}, rkD: {} });
  } else {
    gD = {};
    kD = {};
    rkD = {};
  }

  fxSettings = {};
  voiceOn = true;
  voiceCfg = { voiceName: '', pitch: 1.0, rate: 0.9 };
  imgCustom = {};
  praiseAudio = {};
  praiseAudioNames = {};
  praiseList = DEFAULT_PRAISE.slice();
  badgeData = {};

  if (typeof applySessionSnapshot === 'function') {
    applySessionSnapshot({
      sess: {},
      tIv: null,
      sessMode: 'normal',
      curLevel: 'easy',
      curCourse: '20',
      kSt: { mode:'carry', num:2, filt:'all' },
      answerMode: 'random',
      calcInput: '',
      voiceOn: true
    });
  } else if (typeof setSessionFields === 'function') {
    setSessionFields({
      sess: {},
      tIv: null,
      sessMode: 'normal',
      curLevel: 'easy',
      curCourse: '20',
      kSt: { mode:'carry', num:2, filt:'all' },
      answerMode: 'random',
      calcInput: '',
      voiceOn: true
    });
  } else {
    sess = {};
    tIv = null;
    sessMode = 'normal';
    curLevel = 'easy';
    curCourse = '20';
    kSt = { mode:'carry', num:2, filt:'all' };
    answerMode = 'random';
    calcInput = '';
    voiceOn = true;
  }

  if (typeof resetUiState === 'function') {
    resetUiState({
      currentScreen: 'home',
      history: (typeof makeDefaultHistoryState === 'function') ? makeDefaultHistoryState() : { recTab:'easy', recCourse:'20', statTab:'easy' }
    });
  } else if (typeof applyUiSnapshot === 'function') {
    applyUiSnapshot({
      currentScreen: 'home',
      history: { recTab:'easy', recCourse:'20', statTab:'easy' }
    });
  } else if (appState && appState.ui) {
    if (typeof setCurrentScreenField === 'function') setCurrentScreenField('home');
    else appState.ui.currentScreen = 'home';
    if (typeof resetHistoryState === 'function') {
      resetHistoryState();
    } else if (typeof setHistorySnapshot === 'function') {
      setHistorySnapshot({ recTab:'easy', recCourse:'20', statTab:'easy' });
    } else if (typeof setHistoryField === 'function') {
      setHistoryField('recTab', 'easy');
      setHistoryField('recCourse', '20');
      setHistoryField('statTab', 'easy');
    } else {
      if (!appState.ui.history) appState.ui.history = { recTab:'easy', recCourse:'20', statTab:'easy' };
      appState.ui.history.recTab = 'easy';
      appState.ui.history.recCourse = '20';
      appState.ui.history.statTab = 'easy';
      historyState = appState.ui.history;
    }
  }

  syncLegacyStateAliases();
  if (typeof clearRuntimeTimers === 'function') clearRuntimeTimers();
  if (typeof syncFxToggleButtons === 'function') syncFxToggleButtons();
  if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
  if (typeof syncVoiceSettingsUI === 'function') syncVoiceSettingsUI();
  if (typeof syncImageSettingsUI === 'function') syncImageSettingsUI();
}
