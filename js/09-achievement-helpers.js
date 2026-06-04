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

function getUnlockedAchievementCount() {
  var gemOn = getUnlockedGemCount();
  var badgeOn = 0;
  if (typeof BADGES !== 'undefined' && Array.isArray(BADGES)) {
    for (var i = 0; i < BADGES.length; i++) {
      if (badgeData && badgeData[BADGES[i].id]) badgeOn++;
    }
  }
  return {
    totalOn: gemOn + badgeOn,
    totalAll: ACH_GEMS.length + (typeof BADGES !== 'undefined' && Array.isArray(BADGES) ? BADGES.length : 0)
  };
}
