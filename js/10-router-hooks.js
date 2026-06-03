// 10-router-hooks.js
// ======================================================
// 画面入場時の再描画処理
// ======================================================
var SCREEN_ENTER_HANDLERS = {
  'settings': renderSettingsScreen,
  'advanced-settings': renderAdvancedSettingsScreen,
  'records-top': renderRecordsScreen,
  'stats-top': renderStatsScreen,
  'achievement': renderAchievementScreen,
};

function renderFxAndAudioSettings() {
  renderFxSettings();
  syncAudioToggles();
}

function renderSettingsScreen() {
  setAnswerMode(answerMode);
  renderFxAndAudioSettings();
}

function renderAdvancedSettingsScreen() {
  renderFxAndAudioSettings();
  renderVoiceSettings();
  renderPraiseEdit();
  renderImgSetRows();
}

function renderRecordsScreen() {
  historyRenderRecords();
}

function renderStatsScreen() {
  historyRenderStats();
}

function renderAchievementScreen() {
  renderAchievement();
  achInitTabs();
}

function renderScreenEnterHooks(n) {
  var fn = SCREEN_ENTER_HANDLERS[n];
  if (!fn) return;
  try {
    fn();
  } catch (e) {
    if (window && window.console && console.error) console.error(e);
  }
}

function refreshVisibleScreen() {
  renderScreenEnterHooks((appState && appState.ui && appState.ui.currentScreen) ? appState.ui.currentScreen : ((_currentScreen) ? _currentScreen : 'home'));
}
