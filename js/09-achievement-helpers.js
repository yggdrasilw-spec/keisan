// 09-achievement-helpers.js
// ======================================================
// じっせきの 共通判定ヘルパー
// ======================================================

function isAllMasterForProblemSet(questions, keyPrefix) {
  if (!Array.isArray(questions) || !questions.length) return false;
  return questions.every(function(p) {
    return getSt(kD[keyPrefix + p.a + '+' + p.b]) === 'master';
  });
}

function isAllMasterForLevel(level) {
  if (level === 'easy') return buildP('no').every(function(p){ return getSt(gD[gkLevel(level, p)]) === 'master'; });
  if (level === 'hard') return buildP('carry').every(function(p){ return getSt(gD[gkLevel(level, p)]) === 'master'; });
  if (level === 'mix') return isAllMasterForLevel('easy') && isAllMasterForLevel('hard');
  return false;
}

function getUnlockedGemCount() {
  var cnt = 0;
  for (var i = 0; i < ACH_GEMS.length; i++) {
    try { if (ACH_GEMS[i].check()) cnt++; } catch (e) {}
  }
  return cnt;
}

function getUnlockedBadgeCount() {
  var cnt = 0;
  for (var i = 0; i < BADGES.length; i++) {
    if (badgeData[BADGES[i].id]) cnt++;
  }
  return cnt;
}

function getUnlockedAchievementCount() {
  return {
    totalOn: getUnlockedGemCount() + getUnlockedBadgeCount(),
    totalAll: ACH_GEMS.length + BADGES.length
  };
}
