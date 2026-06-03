// 00-state-ui.js
// ======================================================
// UI状態 / 画面履歴の土台
// ======================================================
var DEFAULT_HISTORY_STATE = {
  recTab: 'easy',
  recCourse: '20',
  statTab: 'easy'
};

function makeDefaultHistoryState() {
  return {
    recTab: DEFAULT_HISTORY_STATE.recTab,
    recCourse: DEFAULT_HISTORY_STATE.recCourse,
    statTab: DEFAULT_HISTORY_STATE.statTab
  };
}

function makeDefaultUiState() {
  return {
    currentScreen: 'home',
    history: makeDefaultHistoryState()
  };
}

function getHistoryState() {
  if (!appState.ui) appState.ui = makeDefaultUiState();
  if (!appState.ui.history) {
    appState.ui.history = makeDefaultHistoryState();
  }
  return appState.ui.history;
}

function getHistorySnapshot() {
  var hs = getHistoryState();
  return {
    recTab: hs.recTab,
    recCourse: hs.recCourse,
    statTab: hs.statTab
  };
}

function setHistorySnapshot(snapshot) {
  var hs = getHistoryState();
  var src = snapshot || {};
  hs.recTab = src.recTab || DEFAULT_HISTORY_STATE.recTab;
  hs.recCourse = src.recCourse || DEFAULT_HISTORY_STATE.recCourse;
  hs.statTab = src.statTab || DEFAULT_HISTORY_STATE.statTab;
  historyState = hs;
  return hs;
}

function resetHistoryState() {
  return setHistorySnapshot(DEFAULT_HISTORY_STATE);
}

function setCurrentScreenField(value) {
  if (!appState.ui) appState.ui = makeDefaultUiState();
  appState.ui.currentScreen = value;
  if (typeof _currentScreen !== 'undefined') _currentScreen = value;
  return appState.ui.currentScreen;
}

function resetUiState(snapshot) {
  var src = snapshot || {};
  var nextScreen = src.currentScreen || 'home';
  var nextHistory = src.history || makeDefaultHistoryState();

  setCurrentScreenField(nextScreen);
  setHistorySnapshot(nextHistory);
  return getUiSnapshot();
}

function getUiSnapshot() {
  return {
    currentScreen: (appState && appState.ui && appState.ui.currentScreen) ? appState.ui.currentScreen : ((typeof _currentScreen !== 'undefined' && _currentScreen) ? _currentScreen : 'home'),
    history: getHistorySnapshot()
  };
}

function applyUiSnapshot(snapshot) {
  var src = snapshot || {};
  if (typeof src.history !== 'undefined') {
    setHistorySnapshot(src.history);
  }
  if (typeof src.currentScreen === 'string' && src.currentScreen) {
    setCurrentScreenField(src.currentScreen);
  }
  return getUiSnapshot();
}

var historyState = getHistoryState();
