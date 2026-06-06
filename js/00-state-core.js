// 00-state-core.js
// ======================================================
// データ / セッション状態の土台
// ======================================================

// 保存データ
var gD  = lsLoad(APP_KEYS.GD);
var kD  = lsLoad(APP_KEYS.KD);
var rkD = lsLoad(APP_KEYS.RK); // {easy_20:[], easy_all:[], hard_20:[], hard_all:[], mix_20:[], mix_all:[]}

// 状態の共通器
var appState = {
  storage: APP_KEYS,
  data: {
    gD: gD,
    kD: kD,
    rkD: rkD
  },
  ui: {
    currentScreen: 'home',
    history: null
  },
  session: {
    sess: {},
    tIv: null,
    sessMode: 'normal',
    curLevel: 'easy',
    curCourse: '20',
    kSt: { mode:'carry', num:2, filt:'all' },
    answerMode: storageLoadText(APP_KEYS.ANSWER_MODE, 'random'),
    calcInput: '',
    voiceOn: voiceOn
  }
};

// 互換性のため、従来のグローバル名も残す
var sess      = appState.session.sess;
var tIv       = appState.session.tIv;
var sessMode  = appState.session.sessMode; // 'normal' | 'kotsu'
var curLevel  = appState.session.curLevel;  // 'easy' | 'hard' | 'mix'
var curCourse = appState.session.curCourse; // '20' | 'all' | 'weak'
var kSt       = appState.session.kSt;
var answerMode = appState.session.answerMode;
var calcInput  = appState.session.calcInput;

function syncGlobalsFromAppState() {
  gD = appState.data.gD;
  kD = appState.data.kD;
  rkD = appState.data.rkD;

  sess = appState.session.sess;
  tIv = appState.session.tIv;
  sessMode = appState.session.sessMode;
  curLevel = appState.session.curLevel;
  curCourse = appState.session.curCourse;
  kSt = appState.session.kSt;
  answerMode = appState.session.answerMode;
  calcInput = appState.session.calcInput;
  voiceOn = appState.session.voiceOn;
}

function syncLegacyStateAliases() {
  appState.data.gD = gD;
  appState.data.kD = kD;
  appState.data.rkD = rkD;

  appState.session.sess = sess;
  appState.session.tIv = tIv;
  appState.session.sessMode = sessMode;
  appState.session.curLevel = curLevel;
  appState.session.curCourse = curCourse;
  appState.session.kSt = kSt;
  appState.session.answerMode = answerMode;
  appState.session.calcInput = calcInput;
  appState.session.voiceOn = voiceOn;

  if (appState.ui && typeof _currentScreen !== 'undefined') {
    appState.ui.currentScreen = _currentScreen || appState.ui.currentScreen || 'home';
  }
  if (typeof getHistoryState === 'function') {
    historyState = getHistoryState();
  }
}

function setSessionField(key, value) {
  appState.session[key] = value;
  syncGlobalsFromAppState();
  return appState.session[key];
}

function setSessionFields(patch) {
  if (!patch) return appState.session;
  for (var k in patch) {
    if (Object.prototype.hasOwnProperty.call(patch, k)) {
      appState.session[k] = patch[k];
    }
  }
  syncGlobalsFromAppState();
  return appState.session;
}

function setDataField(key, value) {
  appState.data[key] = value;
  syncGlobalsFromAppState();
  return appState.data[key];
}

function getDataSnapshot() {
  return {
    gD: gD,
    kD: kD,
    rkD: rkD
  };
}

function applyDataSnapshot(snapshot) {
  var src = snapshot || {};
  gD = src.gD || {};
  kD = src.kD || {};
  rkD = src.rkD || {};
  syncLegacyStateAliases();
  return getDataSnapshot();
}

function getSessionSnapshot() {
  return {
    sess: sess,
    tIv: tIv,
    sessMode: sessMode,
    curLevel: curLevel,
    curCourse: curCourse,
    kSt: kSt,
    answerMode: answerMode,
    calcInput: calcInput,
    voiceOn: voiceOn,
    startAchievementCount: (sess && typeof sess.startAchievementCount === 'number') ? sess.startAchievementCount : null
  };
}

function applySessionSnapshot(snapshot) {
  var src = snapshot || {};
  sess = src.sess || {};
  if (typeof src.startAchievementCount === 'number') {
    sess.startAchievementCount = src.startAchievementCount;
  }
  tIv = (src.tIv === undefined) ? null : src.tIv;
  sessMode = src.sessMode || 'normal';
  curLevel = src.curLevel || 'easy';
  curCourse = src.curCourse || '20';
  kSt = src.kSt || { mode:'carry', num:2, filt:'all' };
  answerMode = src.answerMode || 'random';
  calcInput = src.calcInput || '';
  voiceOn = (src.voiceOn === undefined) ? true : !!src.voiceOn;
  syncLegacyStateAliases();
  return getSessionSnapshot();
}
