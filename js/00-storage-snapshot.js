// 00-storage-snapshot.js
// ======================================================
// アプリ状態のスナップショット / 復元
// ======================================================
var APP_DATA_VERSION = 2;

function applyHistorySnapshot(historySnapshot) {
  if (typeof setHistorySnapshot === 'function') return setHistorySnapshot(historySnapshot);
  var hs = (typeof getHistoryState === 'function') ? getHistoryState() : (appState && appState.ui ? (appState.ui.history || (appState.ui.history = { recTab:'easy', recCourse:'20', statTab:'easy' })) : { recTab:'easy', recCourse:'20', statTab:'easy' });
  hs.recTab = (historySnapshot && historySnapshot.recTab) || 'easy';
  hs.recCourse = (historySnapshot && historySnapshot.recCourse) || '20';
  hs.statTab = (historySnapshot && historySnapshot.statTab) || 'easy';
  historyState = hs;
  return hs;
}

function collectAppSnapshot() {
  var stateSnapshot = (typeof getAppSnapshotState === 'function')
    ? getAppSnapshotState()
    : {
        data: {
          gD: gD,
          kD: kD,
          rkD: rkD
        },
        session: {
          answerMode: appState.session.answerMode,
          kSt: appState.session.kSt,
          voiceOn: voiceOn
        },
        ui: {
          currentScreen: (appState && appState.ui) ? appState.ui.currentScreen : null,
          history: (typeof getHistorySnapshot === 'function') ? getHistorySnapshot() : null
        }
      };

  return {
    version: APP_DATA_VERSION,
    savedAt: Date.now(),
    storage: {
      gD: stateSnapshot.data.gD,
      kD: stateSnapshot.data.kD,
      rkD: stateSnapshot.data.rkD,
      fxSettings: fxSettings,
      voiceOn: stateSnapshot.session.voiceOn,
      voiceCfg: voiceCfg,
      imgCustom: imgCustom,
      praiseAudio: praiseAudio,
      praiseAudioNames: praiseAudioNames,
      praiseList: praiseList,
      badgeData: badgeData,
      answerMode: stateSnapshot.session.answerMode,
      kSt: stateSnapshot.session.kSt,
      historyState: stateSnapshot.ui.history,
      currentScreen: stateSnapshot.ui.currentScreen
    }
  };
}

function applyAppSnapshot(snapshot) {
  if (!snapshot || !snapshot.storage) return false;
  var s = snapshot.storage;

  if (typeof applyDataSnapshot === 'function') {
    applyDataSnapshot({
      gD: s.gD || {},
      kD: s.kD || {},
      rkD: s.rkD || {}
    });
  } else {
    gD = s.gD || {};
    kD = s.kD || {};
    rkD = s.rkD || {};
  }

  fxSettings = s.fxSettings || {};
  voiceOn = (s.voiceOn === undefined) ? true : !!s.voiceOn;
  voiceCfg = s.voiceCfg || { voiceName: '', pitch: 1.0, rate: 0.9 };
  imgCustom = s.imgCustom || {};
  praiseAudio = s.praiseAudio || {};
  praiseAudioNames = s.praiseAudioNames || {};
  praiseList = Array.isArray(s.praiseList) && s.praiseList.length ? s.praiseList.slice() : DEFAULT_PRAISE.slice();
  badgeData = s.badgeData || {};
  shopData = s.shopData || {};

  if (typeof applySessionSnapshot === 'function') {
    applySessionSnapshot({
      answerMode: s.answerMode || 'random',
      kSt: s.kSt || { mode:'carry', num:2, filt:'all' },
      voiceOn: voiceOn
    });
  } else if (typeof setSessionFields === 'function') {
    setSessionFields({
      answerMode: s.answerMode || 'random',
      kSt: s.kSt || { mode:'carry', num:2, filt:'all' },
      voiceOn: voiceOn
    });
  } else {
    appState.session.answerMode = s.answerMode || 'random';
    appState.session.kSt = s.kSt || { mode:'carry', num:2, filt:'all' };
    appState.session.voiceOn = voiceOn;
  }

  applyHistorySnapshot(s.historyState);

  if (typeof s.currentScreen === 'string' && s.currentScreen) {
    if (typeof setCurrentScreenField === 'function') setCurrentScreenField(s.currentScreen);
    else _currentScreen = s.currentScreen;
  }

  syncLegacyStateAliases();
  return true;
}
